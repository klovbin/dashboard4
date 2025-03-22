import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectToMongoDB } from '../utils/mongodb';
const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  id: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: null },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Define the exchange transaction schema
const exchangeTransactionSchema = new Schema({
  userEmail: { type: String, required: true },
  tokenAmount: { type: Number, required: true },
  usdtAmount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Get the collection names from environment variables
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || 'firstsite_user';
const exchangeCollectionName = process.env.MONGODB_EXCHANGE_COLLECTION || 'exchange_transactions';

// Create or get the models
const getUserModel = () => {
  return mongoose.models.User || mongoose.model('User', userSchema, usersCollectionName);
};

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number, email: string };

    // Get request body
    const body = await readBody(event);
    const { tokenAmount, usdtAmount, address } = body;

    // Validate request data
    if (!tokenAmount || isNaN(tokenAmount) || tokenAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid token amount'
      });
    }

    if (!usdtAmount || isNaN(usdtAmount) || usdtAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid USDT amount'
      });
    }

    if (!address) {
      throw createError({
        statusCode: 400,
        statusMessage: 'USDT address is required'
      });
    }

    // Use centralized MongoDB connection
    await connectToMongoDB();

    const UserModel = getUserModel();
    const ExchangeModel = getExchangeModel();

    // Find the user
    const user = await UserModel.findOne({ id: decoded.userId });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Check if user has enough balance
    if (user.balance < tokenAmount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient balance'
      });
    }

    // Create a transaction in MongoDB
    const transaction = await ExchangeModel.create({
      userEmail: user.email,
      tokenAmount,
      usdtAmount,
      address,
      status: 'pending',
      createdAt: new Date()
    });

    // Deduct tokens from user's balance
    user.balance -= tokenAmount;
    await user.save();

    return {
      success: true,
      message: 'Exchange request created successfully',
      transaction: {
        id: transaction._id,
        userEmail: transaction.userEmail,
        tokenAmount: transaction.tokenAmount,
        usdtAmount: transaction.usdtAmount,
        address: transaction.address,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    };
  } catch (error: any) {
    console.error('Error creating exchange request:', error);

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
