import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectToMongoDB } from '../utils/mongodb';

dotenv.config();

// Define the settings schema
const settingsSchema = new mongoose.Schema({
  course: {
    type: Number,
    required: true,
    default: 1
  }
});

// Create or get the Settings model
const getSettingsModel = () => {
  const modelName = 'Settings';
  return mongoose.models[modelName] || mongoose.model(modelName, settingsSchema, 'settings');
};

export default defineEventHandler(async (event) => {
  try {
    // Use centralized MongoDB connection
    await connectToMongoDB();

    const Settings = getSettingsModel();

    // Find the settings document or create it if it doesn't exist
    let settings = await Settings.findOne({});
    
    if (!settings) {
      settings = await Settings.create({ course: 1 });
    }

    return { course: settings.course };
  } catch (error) {
    console.error('Error retrieving course:', error);
    return { 
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
