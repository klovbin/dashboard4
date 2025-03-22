import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToMongoDB } from '../utils/mongodb';
const { Schema } = mongoose;

// Define the exchange transaction schema
const exchangeTransactionSchema = new Schema({
  userEmail: { type: String, required: true },
  tokenAmount: { type: Number, required: true },
  usdtAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Get the collection name from environment variables
const exchangeCollectionName = process.env.MONGODB_EXCHANGE_COLLECTION || 'exchange_transactions';

// Create or get the model
const getExchangeModel = () => {
  return mongoose.models.ExchangeTransaction || 
    mongoose.model('ExchangeTransaction', exchangeTransactionSchema, exchangeCollectionName);
};

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number, email: string, role?: string };

    // Check if user is admin (you may need to adjust this based on your user roles implementation)
    if (!decoded.role || decoded.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized access'
      });
    }

    // Use centralized MongoDB connection
    await connectToMongoDB();

    const ExchangeModel = getExchangeModel();

    // Get query parameters
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const status = query.status as string || undefined;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await ExchangeModel.countDocuments(filter);

    // Get paginated results
    const transactions = await ExchangeModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      transactions: transactions.map(t => ({
        id: t._id,
        userEmail: t.userEmail,
        tokenAmount: t.tokenAmount,
        usdtAmount: t.usdtAmount,
        status: t.status,
        createdAt: t.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Error fetching exchange requests:', error);

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

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
