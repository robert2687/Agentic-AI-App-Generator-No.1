import React from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';

interface ProgressIndicatorProps {
  agents: Agent[];
  currentAgent: Agent | null;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ agents, currentAgent }) => {
  // Filter out deployer from progress calculation since it's optional
  const workflowAgents = agents.filter(a => a.name !== 'Deployer');
  const completedCount = workflowAgents.filter(a => a.status === AgentStatus.COMPLETED).length;
  const totalCount = workflowAgents.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  
  const currentStepNumber = currentAgent ? workflowAgents.findIndex(a => a.id === currentAgent.id) + 1 : null;

  return (
    <div className="card-modern p-5 animate-scale-in" role="region" aria-label="Generation progress">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-1.5 rounded-lg shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Generation Progress
        </h3>
        <span className="badge-status bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold">
          {completedCount} / {totalCount}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-surface-highlight dark:bg-surface-highlight-dark rounded-full overflow-hidden mb-4 shadow-inner">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500 ease-out rounded-full shadow-glow"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} agents completed`}
        />
      </div>
      
      {/* Current Agent Info */}
      {currentAgent && currentStepNumber && (
        <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white font-bold text-sm shadow-lg animate-pulse">
            {currentStepNumber}
          </span>
          <div className="flex-grow">
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">Currently running</p>
            <p className="text-sm font-bold text-text-primary dark:text-text-primary-dark">{currentAgent.name}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-glow" />
          </div>
        </div>
      )}
      
      {/* Completion message */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800 animate-scale-in">
          <div className="flex-shrink-0 bg-green-500 p-1.5 rounded-lg shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-green-600 dark:text-green-400">Generation complete!</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
