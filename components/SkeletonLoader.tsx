import React from 'react';

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse" aria-live="polite" aria-label="Loading content">
    <div className="h-4 bg-surface-highlight dark:bg-surface-highlight-dark rounded w-3/4"></div>
    <div className="h-4 bg-surface-highlight dark:bg-surface-highlight-dark rounded w-full"></div>
    <div className="h-4 bg-surface-highlight dark:bg-surface-highlight-dark rounded w-5/6"></div>
    <div className="h-4 bg-surface-highlight dark:bg-surface-highlight-dark rounded w-1/2"></div>
  </div>
);

export default SkeletonLoader;
