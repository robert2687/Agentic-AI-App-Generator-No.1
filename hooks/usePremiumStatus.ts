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
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger(t => t + 1);
  }, []);

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

  // Effect to fetch premium status when the user or a manual trigger changes
  useEffect(() => {
    if (!supabase) return;
    
    let mounted = true;

    const getStatus = async () => {
      if (!user) {
        if (mounted) setStatus({ isPremium: false, loading: false });
        return;
      }
      
      if (mounted) setStatus(prev => ({ ...prev, isPremium: false, loading: true, error: undefined }));

      try {
        const { data, error } = await supabase
          .from("entitlements_with_audit")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          if (data) {
            setStatus({
              isPremium: data.status === "active",
              lastChange: {
                action: data.last_action,
                oldStatus: data.old_status,
                newStatus: data.new_status,
                at: data.audit_created_at,
              },
              loading: false,
            });
          } else {
            setStatus({ isPremium: false, loading: false });
          }
        }
      } catch (e: any) {
        if (mounted) {
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
        }
      }
    };

    getStatus();

    return () => {
      mounted = false;
    };
  }, [user, trigger]);

  return { ...status, refetch };
}