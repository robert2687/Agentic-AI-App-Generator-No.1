/**
 * Token Manager Service
 * Handles efficient token storage, refresh, and validation
 */

import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface TokenRefreshConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_REFRESH_CONFIG: TokenRefreshConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
};

class TokenManager {
  private refreshPromise: Promise<Session | null> | null = null;
  private config: TokenRefreshConfig;

  constructor(config: Partial<TokenRefreshConfig> = {}) {
    this.config = { ...DEFAULT_REFRESH_CONFIG, ...config };
  }

  /**
   * Validates if a session is still valid
   */
  isSessionValid(session: Session | null): boolean {
    if (!session) return false;
    
    const expiresAt = session.expires_at;
    if (!expiresAt) return false;

    // Consider session invalid if it expires in less than 5 minutes
    const bufferTime = 5 * 60; // 5 minutes in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    return expiresAt > currentTime + bufferTime;
  }

  /**
   * Refreshes the session with retry logic and exponential backoff
   */
  async refreshSession(retryCount = 0): Promise<Session | null> {
    // If a refresh is already in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh(retryCount);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(retryCount: number): Promise<Session | null> {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      return data.session;
    } catch (error: any) {
      // If we haven't exceeded max retries, try again with exponential backoff
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, retryCount);
        
        await this.sleep(delay);
        
        return this.performRefresh(retryCount + 1);
      }
      
      // Max retries exceeded
      throw error;
    }
  }

  /**
   * Gets the current session, refreshing if necessary
   */
  async getValidSession(): Promise<Session | null> {
    if (!supabase) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;
      
      // If session is still valid, return it
      if (this.isSessionValid(session)) {
        return session;
      }
      
      // Otherwise, refresh it
      return await this.refreshSession();
    } catch (error) {
      console.error('Error getting valid session:', error);
      return null;
    }
  }

  /**
   * Clears all stored authentication data
   */
  async clearSession(): Promise<void> {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager();
