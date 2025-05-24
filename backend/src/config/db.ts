import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initGridFS } from './gridfs';

dotenv.config(); // Ensure environment variables are loaded

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources-db';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected...');
    
    // 初始化GridFS
    initGridFS(mongoose.connection);
    console.log('GridFS initialized successfully');
    
    return connection;
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 