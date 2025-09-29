
import React from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';
import PlannerIcon from './icons/PlannerIcon';
import ArchitectIcon from './icons/ArchitectIcon';
import CoderIcon from './icons/CoderIcon';
import ReviewerIcon from './icons/ReviewerIcon';
import PatcherIcon from './icons/PatcherIcon';
import DeployerIcon from './icons/DeployerIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

const statusStyles: Record<AgentStatus, { border: string; bg: string; text: string }> = {
  [AgentStatus.PENDING]: { border: 'border-slate-600', bg: 'bg-slate-700/30', text: 'text-slate-400' },
  [AgentStatus.RUNNING]: { border: 'border-sky-500', bg: 'bg-sky-900/30', text: 'text-sky-300' },
  [AgentStatus.COMPLETED]: { border: 'border-green-500', bg: 'bg-green-900/30', text: 'text-green-300' },
  [AgentStatus.ERROR]: { border: 'border-red-500', bg: 'bg-red-900/30', text: 'text-red-300' },
};

const AgentIcon = ({ name }: { name: string }) => {
    const iconProps = { className: "w-6 h-6" };
    switch (name) {
        case 'Planner': return <PlannerIcon {...iconProps} />;
        case 'Architect': return <ArchitectIcon {...iconProps} />;
        case 'Coder': return <CoderIcon {...iconProps} />;
        case 'Reviewer': return <ReviewerIcon {...iconProps} />;
        case 'Patcher': return <PatcherIcon {...iconProps} />;
        case 'Deployer': return <DeployerIcon {...iconProps} />;
        default: return null;
    }
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, isCurrent, onClick }) => {
  const styles = statusStyles[agent.status];
  const selectedClass = isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-400' : '';
  
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border flex items-center gap-4 cursor-pointer transition-all duration-200 ${styles.border} ${styles.bg} ${selectedClass}`}
    >
      <div className={`flex-shrink-0 ${styles.text}`}>
        {agent.status === AgentStatus.RUNNING || (isCurrent && agent.status !== AgentStatus.COMPLETED) ? <SpinnerIcon className="w-6 h-6" /> : <AgentIcon name={agent.name} />}
      </div>
      <div>
        <h3 className={`font-bold ${styles.text}`}>{agent.name}</h3>
        <p className="text-xs text-slate-500 capitalize">{agent.status}</p>
      </div>
    </div>
  );
};

export default AgentCard;
