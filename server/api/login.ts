import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToMongoDB } from '../utils/mongodb';
const { Schema } = mongoose;

const userSchema = new Schema({
    id: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: null },
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const collectionName = process.env.MONGODB_USERS_COLLECTION;

if (!collectionName) {
    throw new Error('MONGODB_USERS_COLLECTION environment variable is not set');
}

const UserModel = mongoose.models.User ||
    mongoose.model('User', userSchema, collectionName);

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        if (!body.email || !body.password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Email and password are required'
            });
        }

        // Use centralized MongoDB connection
        await connectToMongoDB();

        const user = await UserModel.findOne({ email: body.email });
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Incorrect email or password'
            });
        }

        if (body.password !== user.password) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Incorrect email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw createError({
                statusCode: 500,
                statusMessage: 'JWT secret not configured'
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        setCookie(event, 'sessionid', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
        });

        return {
            message: 'Login successful',
            token: token
        };

    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        console.error('Login error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        });
    }
});