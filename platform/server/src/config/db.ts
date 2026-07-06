import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Global cache interface to maintain a single cached Mongoose connection
 * across serverless container restarts and concurrent invocations on Vercel.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  // 1. If connection already exists and is warm, reuse it instantly
  if (cached.conn) {
    return;
  }

  // 2. If no connection promise is pending, create one
  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,              // Keep connection pool lightweight for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,         // Disable buffering for immediate error reporting
    };

    console.log('📡 Initializing new cached MongoDB connection pool for serverless...');
    cached.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('📡 MongoDB Connected successfully (connection cached)');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset cached promise on failure to allow retry
    throw new Error(`MongoDB Connection Error: ${(error as Error).message}`);
  }
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('📡 MongoDB connection closed');
  }
};
