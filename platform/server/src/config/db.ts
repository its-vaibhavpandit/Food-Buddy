import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore DNS config errors if restricted
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  // If already connected (readyState 1 = connected)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (cached.conn) {
    return;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    console.log('📡 Connecting to MongoDB database...');

    cached.promise = (async () => {
      // 1. Try primary MONGODB_URI (Atlas / Configured)
      try {
        const instance = await mongoose.connect(env.MONGODB_URI, opts);
        console.log('📡 MongoDB Connected successfully (Primary Cluster)');
        return instance;
      } catch (primaryErr) {
        console.warn('⚠️ Primary MongoDB connection failed:', (primaryErr as Error).message);
        
        // 2. Try standard srv URI fallback
        const srvUri = env.MONGODB_URI;
        try {
          console.log('📡 Attempting MongoDB Atlas SRV Fallback Connection...');
          const instance = await mongoose.connect(srvUri, opts);
          console.log('📡 MongoDB Connected successfully (SRV Fallback)');
          return instance;
        } catch (srvErr) {
          // 3. Try local MongoDB
          try {
            console.log('📡 Attempting Local MongoDB Fallback (127.0.0.1:27017)...');
            const instance = await mongoose.connect('mongodb://127.0.0.1:27017/fastfood-buddy', opts);
            console.log('📡 MongoDB Connected successfully (Local Database)');
            return instance;
          } catch (localErr) {
            console.error('❌ All MongoDB Connection attempts failed. Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0');
            throw primaryErr;
          }
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    // Don't crash Express middleware; allow endpoints like /api/location to function cleanly
    console.warn(`⚠️ Database currently offline: ${(error as Error).message}`);
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
