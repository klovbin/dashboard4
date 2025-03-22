import mongoose from 'mongoose';

let isConnected = false;

export const connectToMongoDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const { MONGODB_URI, MONGODB_DB_NAME } = process.env;
    if (!MONGODB_URI || !MONGODB_DB_NAME) {
      throw new Error('MongoDB configuration missing in environment variables');
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}; 