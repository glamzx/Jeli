import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const fallbackSupabaseUrl = 'http://127.0.0.1:54321';
const fallbackSupabaseKey = 'supabase-env-not-configured';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceKey);

// Public anon client
export const supabase = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseKey
);

// Admin service role client for bypass RLS and direct Supabase Auth management
export const supabaseAdmin = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseServiceKey || fallbackSupabaseKey,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);
