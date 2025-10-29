import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import UserIcon from './icons/UserIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import PremiumIcon from './icons/PremiumIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

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
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setMenuOpen(false);
    }

    return (
        <header className="bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-lg p-4 border-b border-border dark:border-border-dark sticky top-0 z-20">
            <div className="max-w-screen-3xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-500 text-white p-2 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                        Agentic AI
                    </h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={toggleTheme}
                        className="text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark p-2 rounded-full transition-colors"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                    {loading ? (
                        <SpinnerIcon className="w-6 h-6 text-text-secondary" />
                    ) : user ? (
                        <div ref={menuRef} className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 text-text-primary dark:text-text-primary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark p-2 rounded-full transition-colors"
                            >
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary-500 dark:text-primary-300" />
                                    </div>
                                )}
                                {isPremium && (
                                    <span title="Premium Member" className="absolute -bottom-1 -right-1 bg-surface dark:bg-surface-dark rounded-full p-0.5">
                                        <PremiumIcon className="w-4 h-4 text-yellow-400" />
                                    </span>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-20 p-2">
                                    <div className="p-2 border-b border-border dark:border-border-dark">
                                        <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left mt-2 px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark rounded-md transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onSignIn}
                            className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default React.memo(Header);