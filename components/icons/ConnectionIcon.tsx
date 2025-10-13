import React from 'react';

const ConnectionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-5"/>
        <path d="M9 8V2"/>
        <path d="M15 8V2"/>
        <path d="M18 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
        <path d="M6 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
        <path d="M12 17a2 2 0 0 0 2-2v-4a2 2 0 0 0-4 0v4a2 2 0 0 0 2 2z"/>
    </svg>
);

export default ConnectionIcon;