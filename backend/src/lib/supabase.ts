import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../config/env.js';

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
  supabase = createClient(env.SUPABASE_URL!, key!);
  console.log('[Supabase] Client initialized');
} else {
  console.warn('[Supabase] Not configured - set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY');
}

export { supabase };
