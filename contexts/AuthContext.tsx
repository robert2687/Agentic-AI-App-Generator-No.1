import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isPremium: boolean;
  premiumCheckError: string | null;
  checkPremiumStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumCheckError, setPremiumCheckError] = useState<string | null>(null);

  const checkPremiumStatus = async (): Promise<boolean> => {
    setPremiumCheckError(null);
    if (!supabase) {
      setIsPremium(false);
      return false;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsPremium(false);
        return false;
      }
      
      const { data, error } = await supabase
        .from('entitlements')
        .select('status')
        .eq('user_id', user.id)
        .eq('product_id', 'premium_unlock')
        .eq('status', 'active')
        .limit(1);

      if (error) {
        throw error;
      }
      
      const premiumStatus = (data?.length ?? 0) > 0;
      setIsPremium(premiumStatus);
      return premiumStatus;
    } catch (error: any) {
      const errorMessage = error.message || error;
      console.error('Error checking premium status:', errorMessage);
      if (typeof errorMessage === 'string' && errorMessage.includes("Could not find the table 'public.entitlements'")) {
        setPremiumCheckError("The 'entitlements' table is missing. Please create it in your Supabase project to enable premium features.");
      }
      setIsPremium(false);
      return false;
    }
  };


  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        await checkPremiumStatus();
      } catch (error: any) {
        console.error("Error fetching session:", error.message || error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Don't reset premium status immediately, wait for the check
      if (session) {
        await checkPremiumStatus();
      } else {
        setIsPremium(false);
      }
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
    loading,
    isPremium,
    premiumCheckError,
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