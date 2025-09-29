import React from 'react';

const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse" aria-live="polite" aria-label="Loading content">
    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
  </div>
);

export default SkeletonLoader;
