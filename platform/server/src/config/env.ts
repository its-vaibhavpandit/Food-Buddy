import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file relative to this config directory
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config(); // Fallback for standard cwd loading

const envSchema = z.object({
  MONGODB_URI: z.string().refine(
    val => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
    { message: 'Invalid MongoDB connection URI' }
  ),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET must be at least 8 characters long'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPI_ID: z.string().default('7991627968@mbk'),
  RAZORPAY_KEY_ID: z.string().default(''),
  RAZORPAY_KEY_SECRET: z.string().default(''),
  UNSPLASH_ACCESS_KEY: z.string().default(''),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables in config/env.ts:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();
