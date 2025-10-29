import React from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import ErrorIcon from './icons/ErrorIcon';
import AgentIcon from './icons/AgentIcon';
import PatcherIcon from './icons/PatcherIcon';
import Button from './ui/Button';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  isCurrent: boolean;
  isInRecoveryMode: boolean;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, isCurrent, onClick, isInRecoveryMode }) => {
  
  const isRecoveringAgent = isInRecoveryMode && (agent.name === 'Reviewer' || agent.name === 'Patcher');
  const pulseClass = isCurrent ? 'animate-pulse' : '';

  const getStatusClasses = () => {
    if (agent.status === AgentStatus.ERROR) {
      return {
        border: 'border-status-error dark:border-status-error-dark',
        bg: 'bg-status-error-muted',
        text: 'text-status-error dark:text-status-error-dark'
      };
    }
    if (isRecoveringAgent) {
      return {
        border: 'border-status-warning dark:border-status-warning',
        bg: 'bg-status-warning/10',
        text: 'text-status-warning'
      };
    }
    switch (agent.status) {
      case AgentStatus.RUNNING:
        return {
          border: 'border-accent-primary dark:border-accent-primary-dark',
          bg: 'bg-accent-primary/10 dark:bg-accent-primary-dark/10',
          text: 'text-accent-primary dark:text-accent-primary-dark'
        };
      case AgentStatus.COMPLETED:
        return {
          border: 'border-status-success dark:border-status-success-dark',
          bg: 'bg-status-success/10 dark:bg-status-success-dark/10',
          text: 'text-status-success dark:text-status-success-dark'
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
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-accent-indigo dark:ring-accent-indigo-dark' : '';
  
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
      className={`card p-3 rounded-lg border flex items-center gap-4 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark focus-visible:ring-accent-indigo ${border} ${bg} ${selectedClass} ${pulseClass}`}
    >
      <div className={`flex-shrink-0 ${text}`}>
        {renderIcon()}
      </div>
      <div>
        <h3 className="font-bold text-text-primary dark:text-text-primary-dark">{agent.name}</h3>
        <p className="text-xs text-text-tertiary dark:text-text-tertiary-dark capitalize">{agent.status}</p>
      </div>
    </article>
  );
};

export default React.memo(AgentCard);
