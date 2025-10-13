import React, { useState } from 'react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

import SpinnerIcon from '../components/icons/SpinnerIcon';
import ErrorIcon from '../components/icons/ErrorIcon';
import PremiumIcon from '../components/icons/PremiumIcon';
import UserIcon from '../components/icons/UserIcon';
import CopyIcon from '../components/icons/CopyIcon';
import CheckIcon from '../components/icons/CheckIcon';

export function withPremiumGate<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function PremiumGateWrapper(props: P) {
    const { user, loading: authLoading } = useAuth();
    const { isPremium, loading: premiumLoading, error: premiumError, refetch } = usePremiumStatus();
    const [isGranting, setIsGranting] = useState(false);

    const loading = authLoading || premiumLoading;

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-slate-800/50 rounded-lg">
          <SpinnerIcon className="w-8 h-8 text-sky-400" />
          <p className="mt-4 text-slate-400">Loading user session...</p>
        </div>
      );
    }
    
    if (premiumError) {
        const [isSqlCopied, setIsSqlCopied] = useState(false);
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
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'verify')),
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
* 3. AUDIT TRIGGER
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
* 4. RPC FUNCTION
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


/**
* 5. CONSOLIDATED VIEW (Optional but Recommended)
* This database view joins entitlements with the latest audit log entry,
* making it easy to query the current status and last action in one go.
*/
DROP VIEW IF EXISTS public.entitlements_with_audit;

CREATE VIEW public.entitlements_with_audit AS
SELECT
  e.user_id,
  e.product_id,
  e.status,
  e.updated_at AS entitlement_updated_at,
  a.action AS last_action,
  a.old_status,
  a.new_status,
  a.purchase_token,
  a.created_at AS audit_created_at
FROM public.entitlements e
LEFT JOIN LATERAL (
  SELECT al.*
  FROM public.audit_logs al
  WHERE al.user_id = e.user_id
    AND al.product_id = e.product_id
  ORDER BY al.created_at DESC
  LIMIT 1
) a ON true;`;

        const handleCopySql = () => {
          navigator.clipboard.writeText(sqlScript).then(() => {
              setIsSqlCopied(true);
              setTimeout(() => setIsSqlCopied(false), 2500);
          }, (err) => {
              console.error('Could not copy text: ', err);
          });
        };

        const sqlScriptBlock = (
             <div className="mt-2 p-3 bg-slate-900/70 rounded-md border border-slate-600">
                <p className="mb-2 text-slate-300">This app requires a database table and function to manage premium features. Please copy the script below and run it in your Supabase project's SQL Editor:</p>
                <div className="relative group">
                    <pre className="text-[10px] bg-slate-950 p-3 pr-16 rounded overflow-x-auto text-sky-300">
                        <code>
                            {sqlScript}
                        </code>
                    </pre>
                    <button
                        onClick={handleCopySql}
                        className="absolute top-2 right-2 flex items-center gap-1.5 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 font-sans text-xs px-2 py-1 rounded-md transition-colors opacity-50 group-hover:opacity-100"
                        aria-label="Copy SQL script to clipboard"
                    >
                        {isSqlCopied ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5 text-green-400" />
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
        );
        return (
            <div className="bg-amber-900/40 border border-amber-700/60 rounded-lg p-6 flex flex-col gap-4 items-center">
              <ErrorIcon className="w-8 h-8 text-amber-400" />
              <h2 className="text-lg font-bold text-amber-300">Database Setup Required</h2>
              <p className="text-amber-300/90 text-sm max-w-md text-center">
                  {premiumError}
              </p>
              <div className="mt-4 pt-4 border-t border-amber-700/50 text-xs text-slate-500 text-left w-full">
                  {sqlScriptBlock}
              </div>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 text-center items-center">
                <UserIcon className="w-8 h-8 text-sky-400" />
                <h2 className="text-lg font-bold text-sky-300">Sign In to Begin</h2>
                <p className="text-slate-400/90 text-sm max-w-sm">
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
              const { error } = await supabase.rpc('grant_premium_access', {
                p_user_id: user.id,
              });
      
              if (error) {
                if (error.code === '42883') {
                  alert("The 'grant_premium_access' function is missing. Please run the full SQL script from the developer tips in your Supabase project to create it.");
                } else {
                  throw error;
                }
              } else {
                refetch();
              }
            } catch (e: any) {
              alert(`Error granting premium access: ${e.message}`);
            } finally {
              setIsGranting(false);
            }
          };

        return (
            <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-3 text-center items-center border-2 border-amber-500/30">
                <PremiumIcon className="w-10 h-10 text-amber-400" />
                <h2 className="text-xl font-bold text-amber-300">Upgrade to Premium</h2>
                <p className="text-slate-400/90 text-sm max-w-md mt-1">
                    Unlock the full power of the AI Agent team. This is a demo app, so you can grant yourself premium access for free to test the generation flow.
                </p>
                <button
                    onClick={handleGrantPremium}
                    disabled={isGranting}
                    className="mt-4 w-full bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:bg-amber-500/50 disabled:cursor-wait"
                >
                    {isGranting ? <SpinnerIcon className="w-5 h-5" /> : <PremiumIcon className="w-5 h-5" />}
                    {isGranting ? 'Granting...' : 'Grant Premium Access'}
                </button>
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  }
}
