import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) not set. Authentication will be disabled.");
}

// The client is exported as potentially null, and consuming code must handle this case.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Explicitly set persistSession to true. This is the default for browsers and uses localStorage.
        persistSession: true,
        // Automatically refreshes the token when it's about to expire. This is the default.
        autoRefreshToken: true,
        // Detects the session from the URL, which is important for OAuth and magic links on the web. This is the default.
        detectSessionInUrl: true,
      },
    }) 
  : null;