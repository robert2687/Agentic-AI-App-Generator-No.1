// src/hooks/usePremiumStatus.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

type PremiumStatus = {
  isPremium: boolean;
  loading: boolean;
  error?: string;
};

/**
 * A self-contained React hook that provides the user's premium status.
 * For this demo, premium is enabled by default for all signed-in users
 * to bypass the need for database setup.
 */
export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    loading: true,
  });

  useEffect(() => {
    // If Supabase isn't configured, we can't check auth, so loading is done.
    if (!supabase) {
      setStatus({ isPremium: false, loading: false, error: 'Supabase client not available.' });
      return;
    };

    let mounted = true;

    // We still need to check the initial session state to know if the user is logged in.
    const checkInitialUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setStatus({ isPremium: !!session?.user, loading: false });
        }
      } catch (error) {
        if (mounted) {
            console.error("Error getting session for premium check:", error);
            setStatus({ isPremium: false, loading: false, error: "Failed to check authentication status." });
        }
      }
    };
    
    checkInitialUser();
    
    // Listen for auth changes. If the user logs in, they get premium. If they log out, they lose it.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setStatus({ isPremium: !!session?.user, loading: false });
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refetch = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const newIsPremium = !!session?.user;
        setStatus({ isPremium: newIsPremium, loading: false });
        return newIsPremium;
    } catch (error) {
        console.error("Error refetching session for premium check:", error);
        setStatus({ isPremium: false, loading: false, error: "Failed to re-check authentication status." });
        return false;
    }
  }, []);

  // Return the status and the refetch function. No database logic is needed.
  return { ...status, refetch };
}
