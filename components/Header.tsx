
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/70 backdrop-blur-sm p-4 border-b border-slate-700/50 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-400">
          Agentic AI App Generator
        </h1>
        <p className="text-sm text-slate-400">A collaborative AI team for building applications, from concept to deployment.</p>
      </div>
    </header>
  );
};

export default Header;
