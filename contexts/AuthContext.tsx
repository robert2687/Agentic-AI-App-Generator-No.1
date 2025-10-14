import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isPremium: boolean;
  premiumCheckError: string | null;
  checkPremiumStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // All premium logic is now handled by the custom hook.
  const { isPremium, error: premiumCheckError, loading: premiumLoading, refetch } = usePremiumStatus();
  
  // This function now simply triggers the hook to re-fetch status.
  const checkPremiumStatus = async () => {
    refetch();
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error: any) {
        console.error("Error fetching session:", error.message || error);
      } finally {
        setAuthLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading: authLoading || premiumLoading, // Combine auth and premium loading states
    isPremium,
    premiumCheckError: premiumCheckError || null,
    checkPremiumStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
