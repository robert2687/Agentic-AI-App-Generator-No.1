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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 flex justify-around p-2 z-20">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id as MobileView)}
          className={`flex flex-col items-center justify-center gap-1 w-24 h-14 rounded-md transition-colors duration-200 ${
            activeView === item.id ? 'text-sky-400 bg-sky-900/30' : 'text-slate-400 hover:text-sky-300'
          }`}
          aria-current={activeView === item.id ? 'page' : undefined}
        >
          {item.icon}
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;