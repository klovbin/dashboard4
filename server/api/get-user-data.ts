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

const collectionName = process.env.MONGODB_USERS_COLLECTION || 'first_site_users';

const UserModel = mongoose.models.User ||
    mongoose.model('User', userSchema, collectionName);

export default defineEventHandler(async (event) => {
    try {
        // Get the authorization header
        const authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Authorization header missing or invalid'
            });
        }

        // Extract the token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!process.env.JWT_SECRET) {
            throw createError({
                statusCode: 500,
                statusMessage: 'JWT secret not configured'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number, email: string };

        // Use centralized MongoDB connection
        await connectToMongoDB();

        // Check if user exists in database and get user data
        const user = await UserModel.findOne({ id: decoded.userId });
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        // Return user data (excluding sensitive information)
        return {
            id: user.id,
            email: user.email,
            address: user.address,
            balance: user.balance,
            createdAt: user.createdAt
        };

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Token expired'
            });
        }

        if (error.statusCode) {
            throw error;
        }

        console.error('Error fetching user data:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        });
    }
}); 