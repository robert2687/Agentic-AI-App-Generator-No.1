import React from 'react';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
import type { Agent, AuditLogEntry, AgentName } from '../types';

interface GeneratorWorkspaceProps {
  agents: Agent[];
  selectedAgentId: number;
  currentAgent: Agent | null;
  recoveryContext: { failingAgentName: AgentName; errorMessage: string } | null;
  setSelectedAgentId: (id: number) => void;
  isZenMode: boolean;
  projectGoal: string;
  setProjectGoal: (goal: string) => void;
  startGeneration: () => void;
  resetState: () => void;
  setShowPreviewModal: (show: boolean) => void;
  isGenerating: boolean;
  isComplete: boolean;
  refinementPrompt: string;
  setRefinementPrompt: (prompt: string) => void;
  startRefinement: () => void;
  isError: boolean;
  errorText: string | null;
  finalCode: string | null;
  setIsZenMode: (isZen: boolean) => void;
  startDeployment: () => void;
  deployerAgent?: Agent;
  auditLog: AuditLogEntry[];
  handleSelectAgent: (id: number) => void;
  mobileView: 'home' | 'audit' | 'preview';
}

const GeneratorWorkspace: React.FC<GeneratorWorkspaceProps> = (props) => {
  return (
    <>
      <DesktopLayout {...props} />
      <MobileLayout {...props} />
    </>
  );
};

export default GeneratorWorkspace;
