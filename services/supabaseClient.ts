import { createClient } from '@supabase/supabase-js';

// Hardcode public Supabase values to fix an environment variable loading issue.
const supabaseUrl = "https://buyggnfpbgitgibebilf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWdnbmZwYmdpdGdpYmViaWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMTE3MTcsImV4cCI6MjA3NTg4NzcxN30.e9VIivPfr7KchZr1f7GOFyzny_BIFfveuUEmFWjAAY0";

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