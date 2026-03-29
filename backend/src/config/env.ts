import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Cloudflare R2 (required for file uploads)
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  R2_PUBLIC_URL: z.string(),
  
  // Google Sheets (optional - can be configured later)
  GOOGLE_CLIENT_EMAIL: z.string().optional().default(''),
  GOOGLE_PRIVATE_KEY: z.string().optional().default(''),
  GOOGLE_SHEET_ID: z.string().optional().default(''),

  // Supabase (optional - for farm_audits sync)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_KEY: z.string().optional().default(''),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export const env = envSchema.parse(process.env);

// Helper to check if Google Sheets is configured
export const isGoogleSheetsConfigured = (): boolean => {
  return !!(env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.GOOGLE_SHEET_ID);
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(env.SUPABASE_URL && (env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY));
};
