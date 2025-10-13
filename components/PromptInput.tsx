import React, { useState } from 'react';
import EyeIcon from './icons/EyeIcon';
import ErrorIcon from './icons/ErrorIcon';
import UserIcon from './icons/UserIcon';
import PremiumIcon from './icons/PremiumIcon';
import { supabase } from '../services/supabaseClient';
import ConnectionIcon from './icons/ConnectionIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import type { User } from '@supabase/supabase-js';

interface PromptInputProps {
  projectGoal: string;
  setProjectGoal: (goal: string) => void;
  onStart: () => void;
  onReset: () => void;
  onPreview: () => void;
  isGenerating: boolean;
  isComplete: boolean;
  refinementPrompt: string;
  setRefinementPrompt: (prompt: string) => void;
  onRefine: () => void;
  isError: boolean;
  errorText: string | null;
  disabled?: boolean;
  authLoading?: boolean;
  isPremium: boolean;
  premiumCheckError: string | null;
  user: User | null;
  checkPremiumStatus: () => Promise<boolean>;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  projectGoal, setProjectGoal, onStart, onReset, onPreview, isGenerating, isComplete,
  refinementPrompt, setRefinementPrompt, onRefine, isError, errorText, 
  disabled = false, authLoading = false, isPremium, premiumCheckError,
  user, checkPremiumStatus
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isSqlCopied, setIsSqlCopied] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  const testSupabaseConnection = async () => {
    if (!supabase) {
        alert('Supabase client is not initialized. Check environment variables in metadata.json.');
        return;
    }
    setIsTesting(true);
    try {
        const { error } = await supabase.from('profiles').select('*').limit(1);
        if (error) {
            const isConnectionSuccessError = 
                error.code === '42P01' || 
                (error.message && error.message.includes('Could not find the table'));

            if (!isConnectionSuccessError) {
                throw error;
            }
        }
        alert('Supabase connection successful!');
    } catch (e: any) {
        alert(`Supabase connection error: ${e.message ?? 'Unknown error'}`);
    } finally {
        setIsTesting(false);
    }
  };

  const sqlScript = `-- Create the table to store user entitlements
CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'pending')),
  updated_at TIMESTPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- 1. Users can only read their own entitlements
CREATE POLICY "Users can read their own entitlements"
ON public.entitlements
FOR SELECT USING (auth.uid() = user_id);

-- 2. Prevent users from directly inserting entitlements
CREATE POLICY "No direct insert by users"
ON public.entitlements
FOR INSERT WITH CHECK (false);

-- 3. Prevent users from directly updating entitlements
CREATE POLICY "No direct update by users"
ON public.entitlements
FOR UPDATE USING (false);

-- 4. Prevent users from directly deleting entitlements
CREATE POLICY "No direct delete by users"
ON public.entitlements
FOR DELETE USING (false);

-- RPC FUNCTION
-- Create a function to grant premium access. This bypasses RLS.
-- Make sure to run this as a database superuser.
CREATE OR REPLACE FUNCTION grant_premium_access(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.entitlements (user_id, product_id, status)
  VALUES (p_user_id, 'premium_unlock', 'active')
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET status = 'active', updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

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

  if (isError) {
    return (
      <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 flex flex-col gap-3 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2">
          <ErrorIcon className="w-6 h-6 text-red-400" />
          <h2 className="text-lg font-bold text-red-300">Generation Failed</h2>
        </div>
        <p className="text-red-300/90 text-sm">
          {errorText || 'An unexpected error occurred during agent execution.'}
        </p>
        <button
          onClick={onReset}
          className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors mt-2"
        >
          Reset and Try Again
        </button>
      </div>
    );
  }

  if (premiumCheckError) {
    return (
      <div className="bg-amber-900/40 border border-amber-700/60 rounded-lg p-6 flex flex-col gap-4 items-center">
        <ErrorIcon className="w-8 h-8 text-amber-400" />
        <h2 className="text-lg font-bold text-amber-300">Database Setup Required</h2>
        <p className="text-amber-300/90 text-sm max-w-md text-center">
            {premiumCheckError}
        </p>
        <div className="mt-4 pt-4 border-t border-amber-700/50 text-xs text-slate-500 text-left w-full">
            {sqlScriptBlock}
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
        <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-4 text-center items-center">
            <UserIcon className="w-8 h-8 text-sky-400" />
            <h2 className="text-lg font-bold text-sky-300">Sign In to Begin</h2>
            <p className="text-slate-400/90 text-sm max-w-sm">
                Please sign in to start generating applications. Your projects will be saved to your account.
            </p>
            <div className="border-t border-slate-700/50 w-full mt-2 pt-4">
                <button
                    onClick={testSupabaseConnection}
                    disabled={isTesting || authLoading}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200 disabled:text-slate-500 disabled:cursor-wait transition-colors"
                >
                    {isTesting ? (
                        <>
                            <SpinnerIcon className="w-4 h-4" />
                            <span>Testing...</span>
                        </>
                    ) : authLoading ? (
                        <>
                           <SpinnerIcon className="w-4 h-4" />
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        <>
                            <ConnectionIcon className="w-4 h-4" />
                            <span>Test Supabase Connection</span>
                        </>
                    )}
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-left w-full">
                <p className="font-semibold text-slate-400 mb-2">💡 Developer Tips:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        For OAuth (e.g., Google) to work, add this app's URL to the 
                        <code className="bg-slate-700 text-rose-400 rounded px-1 py-0.5 text-[11px] mx-1">Redirect URLs</code> 
                        list in your Supabase project's auth settings.
                    </li>
                    <li>
                        <details>
                            <summary className="cursor-pointer hover:text-slate-200">
                                Getting a database error or need to set up premium features?
                            </summary>
                            {sqlScriptBlock}
                        </details>
                    </li>
                </ul>
            </div>
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
          // If the function doesn't exist, provide a helpful error.
          if (error.code === '42883') {
            alert("The 'grant_premium_access' function is missing. Please run the full SQL script from the developer tips in your Supabase project to create it.");
          } else {
            throw error;
          }
        } else {
          // Success! Re-check status, which will trigger a re-render.
          await checkPremiumStatus();
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

  const handlePrimaryAction = () => {
    if (isComplete) {
      onPreview();
    } else {
      onStart();
    }
  };

  const primaryButtonText = isGenerating 
    ? 'Generating...' 
    : isComplete 
    ? 'Preview Application' 
    : 'Start Generation';
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col gap-4">
      <div>
        <label htmlFor="project-goal" className="font-bold text-sky-400">
          1. Define Your Project Goal
        </label>
        <textarea
          id="project-goal"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
          placeholder="e.g., A web app for tracking personal fitness goals with data visualization..."
          className="w-full h-32 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/30 focus:outline-none resize-none transition-colors mt-2"
          disabled={isGenerating || isComplete}
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={handlePrimaryAction}
            disabled={isGenerating || (!isComplete && !projectGoal.trim())}
            className="flex-grow bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isComplete && <EyeIcon className="w-5 h-5" />}
            {primaryButtonText}
          </button>
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="border-t border-slate-700/50 pt-4 flex flex-col gap-2 animate-fade-in">
          <label htmlFor="refinement-prompt" className="font-bold text-teal-400">
            2. Debug & Refine
          </label>
          <textarea
            id="refinement-prompt"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="e.g., The 'Delete' button isn't working. OR Change the title color to orange."
            className="w-full h-20 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/30 focus:outline-none resize-none transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={onRefine}
            disabled={isGenerating || !refinementPrompt.trim()}
            className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Refining...' : 'Submit Refinement'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptInput;