import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmailfqrizsgqolkwpzm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Q-6AvE-aqweCZlJ_CAcEiw_q8oChA_V';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
