import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserIcon from './icons/UserIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import PremiumIcon from './icons/PremiumIcon';

interface HeaderProps {
    onSignIn: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn }) => {
    const { user, signOut, loading, isPremium } = useAuth();
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
        <header className="bg-surface-dark/70 backdrop-blur-sm p-md border-b border-border-light-dark sticky top-0 z-10">
            <div className="max-w-screen-3xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-accent-primary">
                        Agentic AI App Generator
                    </h1>
                    <p className="text-sm text-text-secondary-dark hidden sm:block">A collaborative AI team for building applications, from concept to deployment.</p>
                </div>
                <div className="flex items-center gap-4">
                    {loading ? (
                        <SpinnerIcon className="w-6 h-6 text-text-secondary-dark" />
                    ) : user ? (
                        <div ref={menuRef} className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 text-text-primary-dark hover:bg-surface-highlight-dark p-2 rounded-md transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                                <span className="text-sm hidden md:inline">{user.email}</span>
                                {isPremium && (
                                    <span title="Premium Member" className="text-status-warning">
                                        <PremiumIcon className="w-4 h-4" />
                                    </span>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-md shadow-lg z-20 p-2">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-3 py-2 text-sm text-text-primary-dark hover:bg-surface-highlight-dark rounded-md transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onSignIn}
                            className="bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md hover:bg-accent-primary transition-colors text-sm"
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
