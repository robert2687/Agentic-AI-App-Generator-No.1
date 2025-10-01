
import React from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';
import PlannerIcon from './icons/PlannerIcon';
import ArchitectIcon from './icons/ArchitectIcon';
import VisualDesignerIcon from './icons/VisualDesignerIcon';
import CoderIcon from './icons/CoderIcon';
import ReviewerIcon from './icons/ReviewerIcon';
import PatcherIcon from './icons/PatcherIcon';
import DeployerIcon from './icons/DeployerIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ErrorIcon from './icons/ErrorIcon';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  isCurrent: boolean;
  isInRecoveryMode: boolean;
  onClick: () => void;
}

const statusStyles: Record<AgentStatus | 'RECOVERING', { border: string; bg: string; text: string }> = {
  [AgentStatus.PENDING]: { border: 'border-slate-600', bg: 'bg-slate-700/30', text: 'text-slate-400' },
  [AgentStatus.RUNNING]: { border: 'border-sky-500', bg: 'bg-sky-900/30', text: 'text-sky-300' },
  [AgentStatus.COMPLETED]: { border: 'border-green-500', bg: 'bg-green-900/30', text: 'text-green-300' },
  [AgentStatus.ERROR]: { border: 'border-red-500', bg: 'bg-red-900/30', text: 'text-red-300' },
  'RECOVERING': { border: 'border-amber-500', bg: 'bg-amber-900/30', text: 'text-amber-300' },
};

const AgentIcon = ({ name }: { name: string }) => {
    const iconProps = { className: "w-6 h-6" };
    switch (name) {
        case 'Planner': return <PlannerIcon {...iconProps} />;
        case 'Architect': return <ArchitectIcon {...iconProps} />;
        case 'Visual Designer': return <VisualDesignerIcon {...iconProps} />;
        case 'Coder': return <CoderIcon {...iconProps} />;
        case 'Reviewer': return <ReviewerIcon {...iconProps} />;
        case 'Patcher': return <PatcherIcon {...iconProps} />;
        case 'Deployer': return <DeployerIcon {...iconProps} />;
        default: return null;
    }
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, isCurrent, onClick, isInRecoveryMode }) => {
  
  const isRecoveringAgent = isInRecoveryMode && (agent.name === 'Reviewer' || agent.name === 'Patcher');

  const effectiveStatusKey: AgentStatus | 'RECOVERING' = 
    isRecoveringAgent && agent.status !== AgentStatus.PENDING && agent.status !== AgentStatus.ERROR
    ? 'RECOVERING' 
    : agent.status;
  
  const styles = statusStyles[effectiveStatusKey] || statusStyles[AgentStatus.PENDING];
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-400' : '';
  
  const renderIcon = () => {
    const iconProps = { className: "w-6 h-6" };
    if (agent.status === AgentStatus.ERROR) {
      // Show error icon for the failing agent
      if (!isInRecoveryMode || agent.name === 'Reviewer' || agent.name === 'Patcher') {
         return <ErrorIcon {...iconProps} />;
      }
    }
    
    const showSpinner = agent.status === AgentStatus.RUNNING || (isCurrent && agent.status !== AgentStatus.COMPLETED && agent.status !== AgentStatus.ERROR);

    if (showSpinner) {
      if (isRecoveringAgent) {
        return <PatcherIcon className="w-6 h-6 animate-spin" />;
      }
      return <SpinnerIcon {...iconProps} />;
    }
    
    return <AgentIcon name={agent.name} />;
  };

  const getCardStyles = () => {
      // If an agent has failed, it gets an error style
      if (agent.status === AgentStatus.ERROR && isInRecoveryMode) {
          return statusStyles[AgentStatus.ERROR];
      }
      // If we are in recovery mode, Reviewer and Patcher get recovery styles
      if (isRecoveringAgent) {
          return statusStyles['RECOVERING'];
      }
      // Otherwise, normal status styles apply
      return statusStyles[agent.status];
  };

  const finalStyles = getCardStyles();

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border flex items-center gap-4 cursor-pointer transition-all duration-200 ${finalStyles.border} ${finalStyles.bg} ${selectedClass}`}
    >
      <div className={`flex-shrink-0 ${finalStyles.text}`}>
        {renderIcon()}
      </div>
      <div>
        <h3 className={`font-bold ${finalStyles.text}`}>{agent.name}</h3>
        <p className="text-xs text-slate-500 capitalize">{agent.status}</p>
      </div>
    </div>
  );
};

export default AgentCard;