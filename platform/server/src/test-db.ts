import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function testConnection() {
  if (!uri) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Database connection successful.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    console.error(`Database connection failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
