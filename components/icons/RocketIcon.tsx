import React from 'react';

const RocketIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.18-.65-.87-2.2-.86-3.18.05Z"/>
        <path d="m12 15-3-3a9 9 0 0 1 3-12 9 9 0 0 1 12 3l-3 3"/>
        <path d="M17.5 5.5 9 14"/>
        <path d="M9 12a4.5 4.5 0 0 0-3 1.5"/>
    </svg>
);

export default RocketIcon;
