import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { tokenManager } from '../services/tokenManager';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isPremium: boolean;
  premiumCheckError: string | null;
  checkPremiumStatus: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  isSessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  // All premium logic is now handled by the custom hook.
  const { isPremium, error: premiumCheckError, loading: premiumLoading, refetch } = usePremiumStatus();
  
  // This function now simply triggers the hook to re-fetch status.
  const checkPremiumStatus = async () => {
    refetch();
  };

  // Validate and refresh session if needed
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const validSession = await tokenManager.getValidSession();
      
      if (validSession) {
        setSession(validSession);
        setUser(validSession.user);
        setIsSessionValid(true);
        return true;
      } else {
        setSession(null);
        setUser(null);
        setIsSessionValid(false);
        return false;
      }
    } catch (error: any) {
      console.error("Error refreshing session:", error.message || error);
      setSession(null);
      setUser(null);
      setIsSessionValid(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const getSession = async () => {
      try {
        // Use token manager to get a valid session
        const validSession = await tokenManager.getValidSession();
        
        if (validSession) {
          setSession(validSession);
          setUser(validSession.user);
          setIsSessionValid(true);
        } else {
          setSession(null);
          setUser(null);
          setIsSessionValid(false);
        }
      } catch (error: any) {
        console.error("Error fetching session:", error.message || error);
        setSession(null);
        setUser(null);
        setIsSessionValid(false);
      } finally {
        setAuthLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Validate the new session
      if (session) {
        setIsSessionValid(tokenManager.isSessionValid(session));
      } else {
        setIsSessionValid(false);
      }

      // Handle specific auth events
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        setIsSessionValid(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabase) {
      try {
        await tokenManager.clearSession();
        setSession(null);
        setUser(null);
        setIsSessionValid(false);
      } catch (error: any) {
        console.error('Error signing out:', error);
        throw error;
      }
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading: authLoading || premiumLoading,
    isPremium,
    premiumCheckError: premiumCheckError || null,
    checkPremiumStatus,
    refreshSession,
    isSessionValid,
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
