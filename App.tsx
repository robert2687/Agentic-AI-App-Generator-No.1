import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Agent, AgentName, AuditLogEntry } from './types';
import { AgentStatus } from './types';
import { INITIAL_AGENTS } from './constants';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import AgentCard from './components/AgentCard';
import AgentDetailView from './components/AgentDetailView';
import PreviewPanel from './components/PreviewPanel';
import PreviewModal from './components/PreviewModal';
import DeploymentModal from './components/DeploymentModal';
import { Orchestrator } from './services/orchestrator';
import { logger } from './services/loggerInstance';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<number>(1);
  const [projectGoal, setProjectGoal] = useState<string>('');
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const [finalCode, setFinalCode] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState<boolean>(false);

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [recoveryContext, setRecoveryContext] = useState<{ failingAgentName: AgentName; errorMessage: string } | null>(null);

  const orchestratorRef = useRef<Orchestrator | null>(null);

  const handleAgentUpdate = useCallback((updatedAgent: Agent) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === updatedAgent.id ? { ...agent, ...updatedAgent } : agent
      )
    );
  }, []);
  
  const handleFinalCode = useCallback((code: string) => {
    setFinalCode(code);
    setIsComplete(true);
  }, []);

  const handleWorkflowComplete = useCallback(() => {
    setIsGenerating(false);
  }, []);
  
  const handleWorkflowError = useCallback((error: Error, failingAgent: Agent) => {
    console.error("Workflow error:", error);
    setErrorText(error.message);
    setIsError(true);
    setIsGenerating(false);
    setRecoveryContext({
      failingAgentName: failingAgent.name,
      errorMessage: error.message,
    });
    handleAgentUpdate({ ...failingAgent, status: AgentStatus.ERROR, output: error.message, completedAt: Date.now() });
  }, [handleAgentUpdate]);

  useEffect(() => {
    // Subscribe to the singleton logger instance
    const handleLog = (event: Event) => {
      const entry = (event as CustomEvent<AuditLogEntry>).detail;
      setAuditLog(prevLog => [...prevLog, entry]);
    };
    logger.addEventListener('log', handleLog);

    return () => {
      logger.removeEventListener('log', handleLog);
    };
  }, []);

  useEffect(() => {
    if (!orchestratorRef.current) {
      orchestratorRef.current = new Orchestrator({
        onAgentUpdate: handleAgentUpdate,
        onFinalCode: handleFinalCode,
        onWorkflowComplete: handleWorkflowComplete,
        onWorkflowError: handleWorkflowError,
      });
    }
  }, [handleAgentUpdate, handleFinalCode, handleWorkflowComplete, handleWorkflowError]);

  const resetState = useCallback(() => {
    setAgents(INITIAL_AGENTS);
    setSelectedAgentId(1);
    // Do not reset project goal so user can easily retry
    // setProjectGoal(''); 
    setRefinementPrompt('');
    setIsGenerating(false);
    setIsComplete(false);
    setFinalCode(null);
    setAuditLog([]);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    setShowDeploymentModal(false);
    logger.clear();
  }, []);
  
  const startGeneration = useCallback(async () => {
    if (!projectGoal.trim() || !orchestratorRef.current) return;
    // Instead of full reset, just clear the results of the previous run
    setAgents(INITIAL_AGENTS);
    setSelectedAgentId(1);
    setRefinementPrompt('');
    setIsGenerating(true);
    setIsComplete(false);
    setFinalCode(null);
    setAuditLog([]);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    setShowDeploymentModal(false);

    await orchestratorRef.current.run(projectGoal);
  }, [projectGoal]);

  const startRefinement = useCallback(async () => {
    if (!refinementPrompt.trim() || !finalCode || !orchestratorRef.current) return;

    setIsGenerating(true);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    
    // Reset Reviewer, Patcher, Deployer for the new cycle
    setAgents(prev => prev.map(a => {
      if (a.name === 'Reviewer' || a.name === 'Patcher' || a.name === 'Deployer') {
        return { ...a, status: AgentStatus.PENDING, input: null, output: null, startedAt: undefined, completedAt: undefined };
      }
      return a;
    }));
    setSelectedAgentId(5); // Focus on Reviewer

    await orchestratorRef.current.runRefinement(refinementPrompt, finalCode);
    setRefinementPrompt('');
  }, [refinementPrompt, finalCode]);

  const deployerAgent = agents.find(a => a.name === 'Deployer');
  
  const startDeployment = useCallback(async () => {
    if (!finalCode || !orchestratorRef.current || !deployerAgent) return;
    setShowDeploymentModal(true);
    if (deployerAgent.status === AgentStatus.COMPLETED) return; // Don't re-run if already done

    await orchestratorRef.current.runDeployment(finalCode);
  }, [finalCode, deployerAgent]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const currentAgent = agents.find(a => a.status === AgentStatus.RUNNING) || null;

  const mainGridClasses = isZenMode
    ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-[4fr,3fr] xl:grid-cols-[1fr,2fr]';

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <Header />
      <main className={`grid ${mainGridClasses} gap-6 p-6 max-w-screen-3xl mx-auto`}>
        {/* Left Panel */}
        <div className={`flex flex-col gap-6 transition-all duration-300 ${isZenMode ? 'hidden' : ''}`}>
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
          <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-sky-400">Agent Workflow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="bg-slate-800/50 rounded-lg h-[500px]">
            <AgentDetailView agent={selectedAgent} recoveryContext={recoveryContext} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="bg-slate-800/50 rounded-lg h-full min-h-[80vh]">
          <PreviewPanel
            code={finalCode}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(prev => !prev)}
            isGenerating={isGenerating}
            currentAgent={currentAgent}
            totalAgents={agents.length}
            isWorkflowComplete={isComplete}
            onDeploy={startDeployment}
            deployerAgent={deployerAgent}
            auditLog={auditLog}
          />
        </div>
      </main>

      {showPreviewModal && finalCode && (
        <PreviewModal code={finalCode} onClose={() => setShowPreviewModal(false)} />
      )}
      {showDeploymentModal && (
         <DeploymentModal agent={deployerAgent} onClose={() => setShowDeploymentModal(false)} />
      )}
    </div>
  );
};

export default App;