import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToMongoDB } from '../utils/mongodb';
const { Schema } = mongoose;

// Define the exchange transaction schema
const exchangeTransactionSchema = new Schema({
  userEmail: { type: String, required: true },
  tokenAmount: { type: Number, required: true },
  usdtAmount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Get the collection name from environment variables
const exchangeCollectionName = process.env.MONGODB_EXCHANGE_COLLECTION;

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
    
    if (!token || token === 'undefined' || token === 'null') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token format'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw createError({
        statusCode: 500,
        statusMessage: 'JWT secret not configured'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number, email: string };
      
      if (!decoded || !decoded.email) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token payload'
        });
      }
    } catch (jwtError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      });
    }

    // Use centralized MongoDB connection
    await connectToMongoDB();

    const ExchangeModel = getExchangeModel();

    // Get query parameters
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 5; // Default to 5 per page as per the UI

    // Use the email from the decoded token
    const userEmail = decoded.email;

    // Get total count for this user
    const total = await ExchangeModel.countDocuments({ userEmail });

    // Get paginated results for this user
    const transactions = await ExchangeModel.find({ userEmail })
      .sort({ createdAt: -1 }) // Most recent first
      .skip((page - 1) * limit)
      .limit(limit);
      
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
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

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
}); 