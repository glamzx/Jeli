import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmailfqrizsgqolkwpzm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Q-6AvE-aqweCZlJ_CAcEiw_q8oChA_V';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYWlsZnFyaXpzZ3FvbGt3cHptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkxOTUxNiwiZXhwIjoyMTAwNDk1NTE2fQ.0RZraorWgK3tFT-Bl9GhH4aOjDxn2jebTSu33WQzFk0';

// Public anon client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin service role client for bypass RLS and direct Supabase Auth management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
