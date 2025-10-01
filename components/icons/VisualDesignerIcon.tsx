import React from 'react';

const VisualDesignerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 19.9V16h3"/>
      <path d="M12 2a4 4 0 0 0-4 4v1h8V6a4 4 0 0 0-4-4Z"/>
      <path d="M12 11c-1.66 0-3-1.34-3-3V5h6v3c0 1.66-1.34 3-3 3Z"/>
      <path d="M18 13c1.1 0 2-.9 2-2v-1H4v1c0 1.1.9 2 2 2h12Z"/>
      <path d="M17 16H7c-1.1 0-2 .9-2 2v2h14v-2c0-1.1-.9-2-2-2Z"/>
    </svg>
);

export default VisualDesignerIcon;