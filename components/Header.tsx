import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-surface-dark/70 backdrop-blur-sm p-md border-b border-border-light-dark sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold text-accent-primary">
          Agentic AI App Generator
        </h1>
        <p className="text-sm text-text-secondary-dark">A collaborative AI team for building applications, from concept to deployment.</p>
      </div>
    </header>
  );
};

export default React.memo(Header);