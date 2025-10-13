import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import GoogleIcon from './icons/GoogleIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ErrorIcon from './icons/ErrorIcon';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setShowResend(false);

    if (!supabase) {
        setError("Authentication service is not configured.");
        setLoading(false);
        return;
    }

    try {
        let response;
        if (view === 'sign_up') {
            response = await supabase.auth.signUp({ email, password });
            if (!response.error && response.data.user) {
                setMessage('Check your email for the confirmation link!');
            }
        } else {
            response = await supabase.auth.signInWithPassword({ email, password });
            if (!response.error) {
                onClose();
            }
        }
        if (response.error) {
            throw response.error;
        }
    } catch (error: any) {
        setError(error.error_description || error.message);
        if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
            setShowResend(true);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
        setError("Authentication service is not configured.");
        return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
        setError(error.message);
    }
  };

  const handleResendConfirmation = async () => {
    if (!supabase || !email) return;
    setResendLoading(true);
    setError(null);
    setMessage(null);

    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        if (error) throw error;
        setMessage('Confirmation email sent again. Please check your inbox.');
        setShowResend(false);
    } catch (error: any) {
        setError(error.error_description || error.message);
    } finally {
        setResendLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 rounded-lg shadow-2xl w-[95%] max-w-md flex flex-col ring-1 ring-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="font-bold text-lg text-slate-200">
            {view === 'sign_in' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close authentication"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6">
            <button
                onClick={handleGoogleSignIn}
                disabled={!supabase || loading}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
            </button>
            <div className="my-4 flex items-center gap-2">
                <hr className="w-full border-slate-700" />
                <span className="text-slate-500 text-xs font-semibold">OR</span>
                <hr className="w-full border-slate-700" />
            </div>

            {message && <div className="bg-green-900/40 text-green-300 text-sm p-3 rounded-md mb-4 text-center">{message}</div>}
            {error && (
                <div className="bg-red-900/40 text-red-300 text-sm p-3 rounded-md mb-4">
                    <div className="flex items-center gap-2">
                        <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                     {showResend && (
                        <button 
                            onClick={handleResendConfirmation}
                            disabled={resendLoading}
                            className="w-full text-left mt-2 text-sky-300 hover:text-sky-200 font-semibold underline text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleAuthAction} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-400">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full mt-1 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/30 focus:outline-none transition-colors"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="password"className="text-sm font-medium text-slate-400">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full mt-1 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/30 focus:outline-none transition-colors"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !supabase}
                    className="w-full bg-sky-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <SpinnerIcon className="w-5 h-5" /> : (view === 'sign_in' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>
            <p className="text-center text-sm text-slate-400 mt-4">
                {view === 'sign_in' ? "Don't have an account?" : "Already have an account?"}
                <button
                    onClick={() => {
                        setView(view === 'sign_in' ? 'sign_up' : 'sign_in');
                        setError(null);
                        setMessage(null);
                        setShowResend(false);
                    }}
                    className="font-semibold text-sky-400 hover:text-sky-300 ml-1"
                >
                    {view === 'sign_in' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;