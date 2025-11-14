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
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 shadow-sm" role="region" aria-label="Generation progress">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          Generation Progress
        </h3>
        <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
          {completedCount} / {totalCount} Agents Complete
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-surface-highlight dark:bg-surface-highlight-dark rounded-full overflow-hidden mb-3">
        <div 
          className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-500 ease-out"
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
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 font-semibold text-xs">
            {currentStepNumber}
          </span>
          <span className="text-text-secondary dark:text-text-secondary-dark">
            Currently running: <strong className="text-text-primary dark:text-text-primary-dark">{currentAgent.name}</strong>
          </span>
        </div>
      )}
      
      {/* Completion message */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Generation complete!</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
