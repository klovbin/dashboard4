import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
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

    // Get request body
    const body = await readBody(event);
    const { transactionId, status } = body;

    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required'
      });
    }

    if (!status || !['pending', 'completed'].includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid status is required (pending or completed)'
      });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      const { MONGODB_URI, MONGODB_DB_NAME } = process.env;
      if (!MONGODB_URI || !MONGODB_DB_NAME) {
        throw createError({
          statusCode: 500,
          statusMessage: 'MongoDB configuration missing'
        });
      }
      await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB_NAME}`);
    }

    const ExchangeModel = getExchangeModel();

    // Find and update the transaction
    const transaction = await ExchangeModel.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    );

    if (!transaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      });
    }

    return {
      success: true,
      message: 'Transaction status updated successfully',
      transaction: {
        id: transaction._id,
        userEmail: transaction.userEmail,
        tokenAmount: transaction.tokenAmount,
        usdtAmount: transaction.usdtAmount,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    };
  } catch (error: any) {
    console.error('Error updating exchange status:', error);

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
