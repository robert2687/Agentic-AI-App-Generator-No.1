import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

import SpinnerIcon from '../components/icons/SpinnerIcon';
import ErrorIcon from '../components/icons/ErrorIcon';
import UserIcon from '../components/icons/UserIcon';
import CopyIcon from '../components/icons/CopyIcon';
import CheckIcon from '../components/icons/CheckIcon';
import Paywall from '../components/Paywall';

const PremiumErrorDisplay: React.FC<{ error: string; onCopySql: () => void; isSqlCopied: boolean; }> = ({ error, onCopySql, isSqlCopied }) => {
    const sqlScript = `/**
* 1. ENTITLEMENTS TABLE
* Stores the current state of a user's premium access.
*/
CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  purchase_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'pending')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can read own entitlements" ON public.entitlements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "No direct insert by users" ON public.entitlements FOR INSERT WITH CHECK (false);
CREATE POLICY IF NOT EXISTS "No direct update by users" ON public.entitlements FOR UPDATE USING (false);
CREATE POLICY IF NOT EXISTS "No direct delete by users" ON public.entitlements FOR DELETE USING (false);


/**
* 2. AUDIT LOGS TABLE
* Stores an immutable history of all entitlement changes.
*/
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'verify', 'restore')),
  old_status TEXT,
  new_status TEXT,
  purchase_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can read own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "No direct insert by users on audit" ON public.audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY IF NOT EXISTS "No direct update by users on audit" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY IF NOT EXISTS "No direct delete by users on audit" ON public.audit_logs FOR DELETE USING (false);


/**
* 3. PERFORMANCE INDEXES
* Add indexes to optimize queries, especially for the user-specific lookups and
* the lateral join in the 'entitlements_with_audit' view.
*/
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_product ON public.audit_logs(user_id, product_id, created_at DESC);


/**
* 4. AUDIT TRIGGER
* This function and trigger automatically log any change to the entitlements
* table into the audit_logs table, creating a reliable, immutable history.
*/
CREATE OR REPLACE FUNCTION public.log_entitlement_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_action TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_action := 'insert';
    INSERT INTO public.audit_logs (user_id, product_id, action, old_status, new_status, purchase_token)
    VALUES (NEW.user_id, NEW.product_id, v_action, null, NEW.status, NEW.purchase_token);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_action := 'update';
    INSERT INTO public.audit_logs (user_id, product_id, action, old_status, new_status, purchase_token)
    VALUES (NEW.user_id, NEW.product_id, v_action, OLD.status, NEW.status, NEW.purchase_token);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'delete';
    INSERT INTO public.audit_logs (user_id, product_id, action, old_status, new_status, purchase_token)
    VALUES (OLD.user_id, OLD.product_id, v_action, OLD.status, null, OLD.purchase_token);
    RETURN OLD;
  END IF;
  RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$;

-- Drop the trigger if it exists to ensure the script is re-runnable
DROP TRIGGER IF EXISTS entitlements_audit_trigger ON public.entitlements;

-- Attach the trigger to the entitlements table
CREATE TRIGGER entitlements_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.entitlements
FOR EACH ROW EXECUTE FUNCTION public.log_entitlement_change();


/**
* 5. RPC FUNCTION
* This function grants premium access. The trigger above will automatically
* create the audit trail. Run this function as a database superuser.
*/
CREATE OR REPLACE FUNCTION grant_premium_access(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_purchase_token TEXT;
BEGIN
  -- In a real app, this token would come from a payment provider.
  -- For this demo, we generate a unique placeholder token with a timestamp.
  v_purchase_token := 'demo_token_' || p_user_id::text || '_' || floor(extract(epoch from now()))::text;

  -- Upsert the entitlement to grant or re-activate premium access.
  -- The trigger 'entitlements_audit_trigger' will automatically log this change.
  INSERT INTO public.entitlements (user_id, product_id, purchase_token, status)
  VALUES (p_user_id, 'premium_unlock', v_purchase_token, 'active')
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    status = 'active', 
    updated_at = NOW(),
    purchase_token = v_purchase_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

    const handleCopySql = () => {
        navigator.clipboard.writeText(sqlScript).then(() => {
            onCopySql();
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div className="bg-status-warning/20 border border-status-warning/50 rounded-lg p-lg flex flex-col gap-md items-center">
            <ErrorIcon className="w-8 h-8 text-status-warning" />
            <h2 className="text-lg font-bold text-status-warning">Database Setup Required</h2>
            <p className="text-status-warning/90 text-sm max-w-2xl text-center">
                {error}
            </p>
            <div className="w-full mt-md pt-md border-t border-status-warning/50">
                <div className="relative group">
                    <pre className="text-[10px] bg-background-dark p-sm pr-16 rounded-md overflow-x-auto text-accent-primary border border-border-dark">
                        <code>
                            {sqlScript}
                        </code>
                    </pre>
                    <button
                        onClick={handleCopySql}
                        className="absolute top-2 right-2 flex items-center gap-1.5 bg-surface-dark/80 hover:bg-surface-highlight-dark/80 text-text-primary-dark font-sans text-xs px-2 py-1 rounded-md transition-colors opacity-50 group-hover:opacity-100"
                        aria-label="Copy SQL script to clipboard"
                    >
                        {isSqlCopied ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5 text-status-success" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <CopyIcon className="w-3.5 h-3.5" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


export function withPremiumGate<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function PremiumGateWrapper(props: P) {
    const { user, loading: authLoading, isPremium, premiumCheckError } = useAuth();
    const [isGranting, setIsGranting] = useState(false);
    const [isSqlCopied, setIsSqlCopied] = useState(false);

    const loading = authLoading;

    const handleCopySql = useCallback(() => {
        setIsSqlCopied(true);
        setTimeout(() => setIsSqlCopied(false), 2500);
    }, []);

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-lg text-center bg-surface-lighter-dark rounded-lg">
          <SpinnerIcon className="w-8 h-8 text-accent-primary" />
          <p className="mt-md text-text-secondary-dark">Loading user session...</p>
        </div>
      );
    }
    
    if (premiumCheckError) {
        if (premiumCheckError.includes("database schema for premium features")) {
            return <PremiumErrorDisplay error={premiumCheckError} onCopySql={handleCopySql} isSqlCopied={isSqlCopied} />;
        }
        
        return (
            <div className="bg-status-error/20 border border-status-error/50 rounded-lg p-lg flex flex-col gap-md items-center">
                <ErrorIcon className="w-8 h-8 text-status-error" />
                <h2 className="text-lg font-bold text-status-error">An Error Occurred</h2>
                <p className="text-status-error/90 text-sm max-w-md text-center">
                    {premiumCheckError}
                </p>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="bg-surface-lighter-dark rounded-lg p-lg flex flex-col gap-md text-center items-center">
                <UserIcon className="w-8 h-8 text-accent-primary" />
                <h2 className="text-lg font-bold text-accent-primary">Sign In to Begin</h2>
                <p className="text-text-secondary-dark/90 text-sm max-w-sm">
                    Please sign in to start generating applications. Your projects will be saved to your account.
                </p>
            </div>
        );
    }

    if (!isPremium) {
        const handleGrantPremium = async () => {
            if (!user || !supabase) return;
            setIsGranting(true);
            try {
              // This is a placeholder for a real payment flow. In this demo, we call an RPC.
              const { error } = await supabase.rpc('grant_premium_access', { p_user_id: user.id });
              if (error) throw error;
              // The usePremiumStatus hook will automatically update upon auth state change or manual refetch.
              // We can rely on the AuthProvider to re-render.
            } catch (e: any) {
              alert(`Error granting premium access: ${e.message}`);
            } finally {
              setIsGranting(false);
            }
          };

        return (
            <Paywall 
                onGrantPremium={handleGrantPremium} 
                isGranting={isGranting}
            />
        );
    }

    return <WrappedComponent {...props} />;
  }
}
