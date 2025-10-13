// src/hooks/usePremiumStatus.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import type { User } from "@supabase/supabase-js";

type PremiumStatus = {
  isPremium: boolean;
  lastChange?: {
    action: string;
    oldStatus: string | null;
    newStatus: string | null;
    at: string;
  };
  loading: boolean;
  error?: string;
};

/**
 * A self-contained React hook that provides the user's premium status.
 * It listens to Supabase auth changes and can be manually refreshed.
 */
export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    loading: true,
  });
  const [user, setUser] = useState<User | null>(null);

  // Effect to get the current user and listen for auth state changes
  useEffect(() => {
    if (!supabase) {
      setStatus({ isPremium: false, loading: false, error: 'Supabase client not available.' });
      return;
    };

    let mounted = true;

    const updateUserState = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(mounted) setUser(user);
    };

    updateUserState();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if(mounted) setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const getStatus = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!supabase) {
        setStatus({ isPremium: false, loading: false, error: 'Supabase client not available.' });
        return false;
    }
    if (!currentUser) {
      setStatus({ isPremium: false, loading: false });
      return false;
    }

    setStatus(prev => ({ ...prev, isPremium: false, loading: true, error: undefined }));

    try {
      const { data, error } = await supabase
        .from("entitlements_with_audit")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const newIsPremium = data.status === "active";
        setStatus({
          isPremium: newIsPremium,
          lastChange: {
            action: data.last_action,
            oldStatus: data.old_status,
            newStatus: data.new_status,
            at: data.audit_created_at,
          },
          loading: false,
        });
        return newIsPremium;
      } else {
        setStatus({ isPremium: false, loading: false });
        return false;
      }
    } catch (e: any) {
      const errorMessage = e.message || e;
      let userFriendlyError = "An error occurred while checking your premium status.";
      if (typeof errorMessage === 'string' && (errorMessage.includes("relation \"public.entitlements_with_audit\" does not exist") || errorMessage.includes("Could not find the view"))) {
         userFriendlyError = "The 'entitlements_with_audit' view is missing. Please run the full SQL script from the developer tips to create it.";
      }
      setStatus({
        isPremium: false,
        loading: false,
        error: userFriendlyError,
      });
      return false;
    }
  }, []);

  // Effect to fetch status when the user changes
  useEffect(() => {
      // Create a mutable-safe reference to the function.
      const getStatusFunc = getStatus;
      let mounted = true;

      const fetchInitialStatus = () => {
          if (mounted) {
              getStatusFunc(user);
          }
      };
      
      fetchInitialStatus();

      return () => {
          mounted = false;
      };
  }, [user, getStatus]);

  // The public refetch function now calls getStatus directly.
  const refetch = useCallback(async (): Promise<boolean> => {
    // We pass the current user from state to ensure the check is accurate,
    // even if it's called while the user state is transitioning.
    return await getStatus(user);
  }, [getStatus, user]);

  return { ...status, refetch };
}