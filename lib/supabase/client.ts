// ============================================================================
// SUPABASE CLIENT CONNECTION
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://spxtvsluxxsnscwbofaa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweHR2c2x1eHhzbnNjd2JvZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjA0MjIsImV4cCI6MjEwNjQzNjQyMn0.VSNGCGiDCKYvcEHj0tgh3t0iPEnXRifZorrr-j8MRok';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
