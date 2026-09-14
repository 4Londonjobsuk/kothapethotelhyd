import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'MY_SUPABASE_URL' &&
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns true if Supabase is properly configured with valid credentials.
 */
export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured && supabase !== null;
}
