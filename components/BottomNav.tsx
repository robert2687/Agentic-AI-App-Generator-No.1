import React from 'react';
import HomeIcon from './icons/HomeIcon';
import LogIcon from './icons/LogIcon';
import EyeIcon from './icons/EyeIcon';
import SettingsIcon from './icons/SettingsIcon';

type MobileView = 'home' | 'audit' | 'preview';

interface BottomNavProps {
  activeView: MobileView;
  setActiveView: (view: MobileView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
    { id: 'audit', label: 'Details', icon: <LogIcon className="w-6 h-6" /> },
    { id: 'preview', label: 'Preview', icon: <EyeIcon className="w-6 h-6" /> },
    // { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> }, // Placeholder for future use
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t-2 border-border dark:border-border-dark flex justify-around p-3 z-20 shadow-2xl">
      {navItems.map(item => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as MobileView)}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 h-16 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg scale-105' 
                : 'text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark hover:scale-105'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-semibold ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
