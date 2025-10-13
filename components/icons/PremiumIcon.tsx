import React from 'react';

const PremiumIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-10 5z"></path>
        <path d="M12 16L6 22l-4-3"></path>
        <path d="M12 16l6 6 4-3"></path>
    </svg>
);

export default PremiumIcon;
