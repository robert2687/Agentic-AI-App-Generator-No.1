
import React from 'react';
import type { AgentName } from '../../types';
import PlannerIcon from './PlannerIcon';
import ArchitectIcon from './ArchitectIcon';
import VisualDesignerIcon from './VisualDesignerIcon';
import CoderIcon from './CoderIcon';
import ReviewerIcon from './ReviewerIcon';
import PatcherIcon from './PatcherIcon';
import DeployerIcon from './DeployerIcon';

const AgentIcon: React.FC<{ name: AgentName, className?: string }> = ({ name, className }) => {
    const iconProps = { className: className || "w-6 h-6" };
    switch (name) {
        case 'Planner': return <PlannerIcon {...iconProps} />;
        case 'Architect': return <ArchitectIcon {...iconProps} />;
        case 'UX/UI Designer': return <VisualDesignerIcon {...iconProps} />;
        case 'Coder': return <CoderIcon {...iconProps} />;
        case 'Reviewer': return <ReviewerIcon {...iconProps} />;
        case 'Patcher': return <PatcherIcon {...iconProps} />;
        case 'Deployer': return <DeployerIcon {...iconProps} />;
        default: return null;
    }
};

export default AgentIcon;
