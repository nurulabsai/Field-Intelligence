/**
 * Environment Variable Validation — NuruOS Field Intelligence
 *
 * Validates all required VITE_ env vars at startup and exports
 * typed constants. Fails fast with clear error messages.
 */

function required(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        'Copy .env.example to .env.local and fill in the values.',
    );
  }
  return value.trim();
}

function optional(name: string): string | undefined {
  const value = import.meta.env[name];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return value.trim();
}

// ── Required ────────────────────────────────────────────────────────────────

export const SUPABASE_URL = required('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = required('VITE_SUPABASE_ANON_KEY');
export const GEMINI_API_KEY = required('VITE_GEMINI_API_KEY');

// ── Optional ────────────────────────────────────────────────────────────────

export const API_BASE_URL = optional('VITE_API_BASE_URL');
export const SENTRY_DSN = optional('VITE_SENTRY_DSN');
export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// ── Safety check: service role key must never be in the browser ─────────────

if (import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[SECURITY] SUPABASE_SERVICE_ROLE_KEY detected in browser environment. ' +
      'This is a backend-only secret and must be removed from .env.local immediately. ' +
      'It grants full admin access to your database.',
  );
}
