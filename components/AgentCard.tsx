import React from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import ErrorIcon from './icons/ErrorIcon';
import AgentIcon from './icons/AgentIcon';
import PatcherIcon from './icons/PatcherIcon';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  isCurrent: boolean;
  isInRecoveryMode: boolean;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, isCurrent, onClick, isInRecoveryMode }) => {
  
  const isRecoveringAgent = isInRecoveryMode && (agent.name === 'Reviewer' || agent.name === 'Patcher');
  const pulseClass = isCurrent ? 'animate-pulse-fast' : '';

  const getStatusClasses = () => {
    if (agent.status === AgentStatus.ERROR) {
      return {
        border: 'border-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-500'
      };
    }
    if (agent.status === AgentStatus.CANCELLED) {
      return {
        border: 'border-gray-500',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-500'
      };
    }
    if (isRecoveringAgent) {
      return {
        border: 'border-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-500'
      };
    }
    switch (agent.status) {
      case AgentStatus.RUNNING:
        return {
          border: 'border-primary-500',
          bg: 'bg-primary-50 dark:bg-primary-900/20',
          text: 'text-primary-500'
        };
      case AgentStatus.COMPLETED:
        return {
          border: 'border-green-500',
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-500'
        };
      case AgentStatus.PENDING:
      default:
        return {
          border: 'border-border dark:border-border-dark',
          bg: 'bg-surface dark:bg-surface-dark',
          text: 'text-text-tertiary dark:text-text-tertiary-dark'
        };
    }
  };

  const { border, bg, text } = getStatusClasses();
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-primary-500' : '';
  
  const renderIcon = () => {
    const iconProps = { className: "w-6 h-6" };
    if (agent.status === AgentStatus.ERROR) {
      return <ErrorIcon {...iconProps} />;
    }
    
    const showSpinner = agent.status === AgentStatus.RUNNING;

    if (showSpinner) {
      if (isRecoveringAgent) {
        return <PatcherIcon className="w-6 h-6 animate-spin" />;
      }
      return <SpinnerIcon {...iconProps} />;
    }
    
    return <AgentIcon name={agent.name} className="w-6 h-6" />;
  };

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Select agent ${agent.name}, status: ${agent.status}`}
      aria-live="polite"
      className={`card p-4 rounded-lg border flex items-center gap-4 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark focus-visible:ring-primary-500 ${border} ${bg} ${selectedClass} ${pulseClass} hover:scale-105 hover:shadow-lg`}
    >
      <div className={`flex-shrink-0 p-2 rounded-full bg-white dark:bg-surface-dark ${text}`}>
        {renderIcon()}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">{agent.name}</h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark capitalize">{agent.status.toLowerCase()}</p>
      </div>
    </article>
  );
};

export default React.memo(AgentCard);
