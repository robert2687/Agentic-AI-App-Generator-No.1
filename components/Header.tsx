import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import PremiumIcon from './icons/PremiumIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import UserIcon from './icons/UserIcon';

interface HeaderProps {
  onSignIn: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn }) => {
  const { user, signOut, loading, isPremium } = useAuth();
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    return (
        <header className="glass sticky top-0 z-20 shadow-lg animate-scale-in">
            <div className="max-w-screen-3xl mx-auto flex justify-between items-center p-4">
                <div className="flex items-center gap-3 animate-fade-in">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-400 text-white p-2.5 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-110">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient">
                            Agentic AI
                        </h1>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">App Generator</p>
                    </div>
                </div>
                
                {/* Actions Section */}
                <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle Button with enhanced styling */}
                        <button
                            onClick={toggleTheme}
                            className="relative p-2.5 rounded-xl text-text-secondary dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400 bg-surface/60 dark:bg-surface-highlight-dark/30 hover:bg-primary-100/70 dark:hover:bg-primary-900/30 border border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? (
                                <MoonIcon className="w-5 h-5" />
                            ) : (
                                <SunIcon className="w-5 h-5" />
                            )}
                        </button>
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  return (
    <header className="relative bg-gradient-to-r from-primary-50 via-surface to-primary-50 dark:from-surface-dark dark:via-surface-dark dark:to-surface-dark backdrop-blur-lg border-b border-primary-200/50 dark:border-border-dark sticky top-0 z-20 shadow-sm dark:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5 dark:from-primary-500/10 dark:via-transparent dark:to-primary-500/10 pointer-events-none" />

      <div className="relative max-w-screen-3xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2.5 rounded-xl shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent leading-tight">
                Agentic AI
              </h1>
              <p className="hidden sm:block text-xs text-text-secondary dark:text-text-secondary-dark font-medium">
                AI-Powered App Generation
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl text-text-secondary dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400 bg-surface/60 dark:bg-surface-highlight-dark/30 hover:bg-primary-100/70 dark:hover:bg-primary-900/30 border border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              type="button"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>

            {loading ? (
              <div className="p-2" aria-label="Loading user">
                <SpinnerIcon className="w-6 h-6 text-primary-500" />
              </div>
            ) : user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="relative flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary-100/70 dark:hover:bg-primary-900/30 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="User menu"
                  type="button"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User profile"
                      className="w-9 h-9 rounded-lg object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {isPremium && (
                    <span
                      title="Premium Member"
                      className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-1 shadow-md ring-2 ring-surface dark:ring-surface-dark"
                    >
                      <PremiumIcon className="w-3 h-3 text-white" />
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-surface dark:bg-surface-dark border border-primary-200/50 dark:border-border-dark rounded-xl shadow-xl dark:shadow-2xl z-20 overflow-hidden animate-fade-in">
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-950/30 dark:to-transparent border-b border-primary-200/50 dark:border-border-dark">
                      <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark truncate">{user.email}</p>
                      {isPremium && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold rounded-full">
                          <PremiumIcon className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                </div>
        </header>
    );
                    <div className="p-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-primary-100/70 dark:hover:bg-surface-highlight-dark rounded-lg transition-all duration-200 transform hover:translate-x-1"
                        type="button"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold py-2.5 px-5 sm:px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                type="button"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
