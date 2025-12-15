import React from 'react';
import PromptInput from './PromptInput';
import AgentCard from './AgentCard';
import AgentDetailView from './AgentDetailView';
import PreviewPanel from './PreviewPanel';
import ProgressIndicator from './ProgressIndicator';
import ErrorRecoveryPanel from './ErrorRecoveryPanel';
import type { Agent, AuditLogEntry, AgentName } from '../types';

interface DesktopLayoutProps {
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
  cancelGeneration: () => void;
  retryFromFailedAgent: () => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  agents, selectedAgentId, currentAgent, recoveryContext, setSelectedAgentId,
  isZenMode, projectGoal, setProjectGoal, startGeneration, resetState, setShowPreviewModal,
  isGenerating, isComplete, refinementPrompt, setRefinementPrompt, startRefinement,
  isError, errorText, finalCode, setIsZenMode, startDeployment, deployerAgent,
  auditLog, cancelGeneration, retryFromFailedAgent
}) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const desktopGridClasses = isZenMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)]';

  return (
    <div className={`hidden lg:grid ${desktopGridClasses} gap-6`}>
      {/* Left Panel */}
      <div className={`flex flex-col gap-6 transition-all duration-300 ${isZenMode ? 'lg:hidden' : ''}`}>
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
                onClick={() => setSelectedAgentId(agent.id)}
              />
            ))}
          </div>
        </div>
        <div className="card-modern min-h-[500px]">
          <AgentDetailView agent={selectedAgent} recoveryContext={recoveryContext} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="card-modern h-full min-h-[80vh]">
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
    </div>
  );
};

export default DesktopLayout;
