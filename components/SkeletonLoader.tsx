import React from 'react';

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-scale-in" aria-live="polite" aria-label="Loading content">
    {/* Header skeleton */}
    <div className="card-modern p-6 space-y-4">
      <div className="skeleton h-8 w-3/4 rounded-xl"></div>
      <div className="skeleton h-32 w-full rounded-xl"></div>
      <div className="flex gap-3">
        <div className="skeleton h-12 flex-1 rounded-xl"></div>
        <div className="skeleton h-12 w-24 rounded-xl"></div>
      </div>
    </div>
    
    {/* Agent cards skeleton */}
    <div className="card-modern p-5 space-y-4">
      <div className="skeleton h-6 w-1/3 rounded-xl"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl"></div>
        ))}
      </div>
    </div>
    
    {/* Detail view skeleton */}
    <div className="card-modern p-5 space-y-3">
      <div className="skeleton h-6 w-1/2 rounded-xl"></div>
      <div className="skeleton h-4 w-full rounded-lg"></div>
      <div className="skeleton h-4 w-5/6 rounded-lg"></div>
      <div className="skeleton h-4 w-3/4 rounded-lg"></div>
    </div>
  </div>
);

export default SkeletonLoader;
