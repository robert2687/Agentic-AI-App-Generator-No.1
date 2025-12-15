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
        border: 'border-red-500 shadow-glow-error',
        bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10',
        text: 'text-red-600 dark:text-red-400',
        ring: 'ring-red-500/20'
      };
    }
    if (agent.status === AgentStatus.CANCELLED) {
      return {
        border: 'border-gray-400',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10',
        text: 'text-gray-600 dark:text-gray-400',
        ring: 'ring-gray-500/20'
      };
    }
    if (isRecoveringAgent) {
      return {
        border: 'border-orange-500 shadow-glow',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10',
        text: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-orange-500/20'
      };
    }
    switch (agent.status) {
      case AgentStatus.RUNNING:
        return {
          border: 'border-primary-500 shadow-glow',
          bg: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10',
          text: 'text-primary-600 dark:text-primary-400',
          ring: 'ring-primary-500/20'
        };
      case AgentStatus.COMPLETED:
        return {
          border: 'border-green-500 shadow-glow-success',
          bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10',
          text: 'text-green-600 dark:text-green-400',
          ring: 'ring-green-500/20'
        };
      case AgentStatus.PENDING:
      default:
        return {
          border: 'border-border dark:border-border-dark',
          bg: 'bg-surface dark:bg-surface-dark',
          text: 'text-text-tertiary dark:text-text-tertiary-dark',
          ring: 'ring-primary-500/20'
        };
    }
  };

  const { border, bg, text, ring } = getStatusClasses();
  const selectedClass = isSelected ? `ring-4 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ${ring}` : '';
  const hoverClass = 'hover:scale-105 hover:-translate-y-1 hover:shadow-2xl';
  const activeClass = agent.status === AgentStatus.RUNNING ? 'animate-pulse-fast' : '';
  
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
      className={`relative overflow-hidden rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark focus-visible:ring-primary-500 ${border} ${bg} ${selectedClass} ${hoverClass} ${activeClass} p-4`}
    >
      {/* Shimmer effect for running state */}
      {agent.status === AgentStatus.RUNNING && (
        <div className="absolute inset-0 animate-shimmer opacity-30" />
      )}
      
      <div className={`relative flex-shrink-0 p-3 rounded-xl bg-white dark:bg-surface-dark shadow-lg ${text}`}>
        {renderIcon()}
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-base text-text-primary dark:text-text-primary-dark">{agent.name}</h3>
        <p className={`text-sm font-semibold capitalize ${text}`}>
          {agent.status.toLowerCase()}
        </p>
      </div>
      
      {/* Status indicator dot */}
      <div className="flex-shrink-0">
        {agent.status === AgentStatus.RUNNING && (
          <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse shadow-glow" />
        )}
        {agent.status === AgentStatus.COMPLETED && (
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-glow-success" />
        )}
        {agent.status === AgentStatus.ERROR && (
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-glow-error" />
        )}
      </div>
    </article>
  );
};

export default React.memo(AgentCard);
