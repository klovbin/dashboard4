import mongoose from 'mongoose';
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

const collectionName = process.env.MONGODB_USERS_COLLECTION || 'first_site_users';

const UserModel = mongoose.models.User ||
    mongoose.model('User', userSchema, collectionName);
    
export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and password are required'
        });
    }

    if (body.password.length < 8) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Password is too short'
        });
    }

    try {
        // Use centralized MongoDB connection
        await connectToMongoDB();

        const existingUser = await UserModel.findOne({ email: body.email });
        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Email is already occupied'
            });
        }

        const newUser = new UserModel({
            id: Date.now() + Math.floor(Math.random() * 2001) - 1000, // замени на свой метод, обычно тут просто +1 к последне-найденному айди
            email: body.email,
            password: body.password
        });

        await newUser.save();

        return { message: 'User created' };

    } catch (error: any) {
        if (error.code === 11000) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Email is already occupied'
            });
        }

        if (error.statusCode) {
            throw error;
        }

        console.error('Registration error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        });
    }
});