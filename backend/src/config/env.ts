import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cloudflare R2 (optional — upload routes disabled when missing)
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET_NAME: z.string().optional().default(''),
  R2_PUBLIC_URL: z.string().optional().default(''),

  // Google Sheets (optional — fallback sync target)
  GOOGLE_CLIENT_EMAIL: z.string().optional().default(''),
  GOOGLE_PRIVATE_KEY: z.string().optional().default(''),
  GOOGLE_SHEET_ID: z.string().optional().default(''),

  // Supabase (required for auth and primary data store)
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

// Helper to check if R2 storage is configured
export const isR2Configured = (): boolean => {
  return !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET_NAME);
};

// Startup diagnostics — log which integrations are available
if (env.NODE_ENV !== 'test') {
  const status = (ok: boolean) => (ok ? 'ready' : 'not configured');
  console.log('[Env] Supabase:', status(isSupabaseConfigured()));
  console.log('[Env] R2 Storage:', status(isR2Configured()));
  console.log('[Env] Google Sheets:', status(isGoogleSheetsConfigured()));
}
