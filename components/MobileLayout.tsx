import React from 'react';
import PromptInput from './PromptInput';
import AgentCard from './AgentCard';
import AgentDetailView from './AgentDetailView';
import PreviewPanel from './PreviewPanel';
import ProgressIndicator from './ProgressIndicator';
import ErrorRecoveryPanel from './ErrorRecoveryPanel';
import type { Agent, AuditLogEntry, AgentName } from '../types';

interface MobileLayoutProps {
  agents: Agent[];
  selectedAgentId: number;
  currentAgent: Agent | null;
  recoveryContext: { failingAgentName: AgentName; errorMessage: string } | null;
  handleSelectAgent: (id: number) => void;
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
  isZenMode: boolean;
  setIsZenMode: (isZen: boolean) => void;
  startDeployment: () => void;
  deployerAgent?: Agent;
  auditLog: AuditLogEntry[];
  mobileView: 'home' | 'audit' | 'preview';
  cancelGeneration: () => void;
  retryFromFailedAgent: () => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  agents, selectedAgentId, currentAgent, recoveryContext, handleSelectAgent,
  projectGoal, setProjectGoal, startGeneration, resetState, setShowPreviewModal,
  isGenerating, isComplete, refinementPrompt, setRefinementPrompt, startRefinement,
  isError, errorText, finalCode, isZenMode, setIsZenMode, startDeployment, deployerAgent,
  auditLog, mobileView, cancelGeneration, retryFromFailedAgent
}) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="lg:hidden">
      {mobileView === 'home' && (
        <div className="flex flex-col gap-6">
          <PromptInput
            projectGoal={projectGoal}
            setProjectGoal={setProjectGoal}
            onStart={startGeneration}
            onReset={resetState}
            onPreview={() => setShowPreviewModal(true)}
            isGenerating={isGenerating}
            isComplete={isComplete}
            refinementPrompt={refinementPrompt}
            setRefinementPrompt={setRefinementPrompt}
            onRefine={startRefinement}
            isError={isError}
            errorText={errorText}
          />
          
          {/* Progress Indicator */}
          {(isGenerating || isComplete) && (
            <ProgressIndicator agents={agents} currentAgent={currentAgent} />
          )}
          
          {/* Error Recovery Panel */}
          {(isError || isGenerating) && (
            <ErrorRecoveryPanel
              isError={isError}
              errorText={errorText}
              failingAgentName={recoveryContext?.failingAgentName}
              isGenerating={isGenerating}
              onRetry={retryFromFailedAgent}
              onCancel={cancelGeneration}
              onReset={resetState}
            />
          )}
          
          <div className="card-modern p-5 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Agent Workflow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent.id === agent.id}
                  isCurrent={currentAgent?.id === agent.id}
                  isInRecoveryMode={!!recoveryContext}
                  onClick={() => handleSelectAgent(agent.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {mobileView === 'audit' && (
         <div className="card-modern min-h-[calc(100vh-200px)]">
          <AgentDetailView agent={selectedAgent} recoveryContext={recoveryContext} />
        </div>
      )}
       {mobileView === 'preview' && (
         <div className="card-modern min-h-[calc(100vh-200px)]">
           <PreviewPanel
              code={finalCode}
              isZenMode={isZenMode}
              onToggleZenMode={() => setIsZenMode(!isZenMode)}
              isGenerating={isGenerating}
              currentAgent={currentAgent}
              totalAgents={agents.length}
              isWorkflowComplete={isComplete}
              onDeploy={startDeployment}
              deployerAgent={deployerAgent}
              auditLog={auditLog}
            />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
