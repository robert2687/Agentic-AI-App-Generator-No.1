import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Agent, AgentName, AuditLogEntry } from './types';
import { AgentStatus } from './types';
import { INITIAL_AGENTS } from './constants';
import Header from './components/Header';
import PreviewModal from './components/PreviewModal';
import DeploymentModal from './components/DeploymentModal';
import { Orchestrator } from './services/orchestrator';
import { logger } from './services/loggerInstance';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import { withPremiumGate } from './hoc/withPremiumGate';
import GeneratorWorkspace from './components/GeneratorWorkspace';

const GatedGeneratorWorkspace = withPremiumGate(GeneratorWorkspace);

const AppContent: React.FC = () => {
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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [recoveryContext, setRecoveryContext] = useState<{ failingAgentName: AgentName; errorMessage: string } | null>(null);
  const [mobileView, setMobileView] = useState<'home' | 'audit' | 'preview'>('home');

  const orchestratorRef = useRef<Orchestrator | null>(null);

  const handleAgentUpdate = useCallback((updatedAgent: Agent) => {
    // A bit of a hack to handle the orchestrator clearing the agent state
    if (!updatedAgent.id) {
       setAgents(INITIAL_AGENTS);
       return;
    }
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
    setRefinementPrompt('');
    setIsGenerating(false);
    setIsComplete(false);
    setFinalCode(null);
    setAuditLog([]);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    setShowDeploymentModal(false);
    setMobileView('home');
    logger.clear();
  }, []);
  
  const startGeneration = useCallback(async () => {
    if (!projectGoal.trim() || !orchestratorRef.current) return;
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
    setMobileView('home');

    await orchestratorRef.current.run(projectGoal);
  }, [projectGoal]);

  const startRefinement = useCallback(async () => {
    if (!refinementPrompt.trim() || !finalCode || !orchestratorRef.current) return;

    setIsGenerating(true);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    
    setAgents(prev => prev.map(a => {
      if (a.name === 'Reviewer' || a.name === 'Patcher' || a.name === 'Deployer') {
        return { ...a, status: AgentStatus.PENDING, input: null, output: null, startedAt: undefined, completedAt: undefined };
      }
      return a;
    }));
    setSelectedAgentId(5);
    if (window.innerWidth < 1024) {
      setMobileView('audit');
    }

    await orchestratorRef.current.runRefinement(refinementPrompt, finalCode);
    setRefinementPrompt('');
  }, [refinementPrompt, finalCode]);

  const deployerAgent = agents.find(a => a.name === 'Deployer');
  
  const startDeployment = useCallback(async () => {
    if (!finalCode || !orchestratorRef.current || !deployerAgent) return;
    setShowDeploymentModal(true);
    if (deployerAgent.status === AgentStatus.COMPLETED) return;

    await orchestratorRef.current.runDeployment(finalCode);
  }, [finalCode, deployerAgent]);

  const currentAgent = agents.find(a => a.status === AgentStatus.RUNNING) || null;

  const handleSelectAgent = (agentId: number) => {
    setSelectedAgentId(agentId);
    if (window.innerWidth < 1024) { // Tailwind's lg breakpoint
      setMobileView('audit');
    }
  };
    
  return (
    <div className="bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark min-h-screen font-sans pb-20 lg:pb-0 transition-colors duration-300">
      <Header onSignIn={() => setShowAuthModal(true)} />
      <main className="max-w-screen-3xl mx-auto p-lg">
        <GatedGeneratorWorkspace
          agents={agents}
          selectedAgentId={selectedAgentId}
          currentAgent={currentAgent}
          recoveryContext={recoveryContext}
          setSelectedAgentId={setSelectedAgentId}
          isZenMode={isZenMode}
          projectGoal={projectGoal}
          setProjectGoal={setProjectGoal}
          startGeneration={startGeneration}
          resetState={resetState}
          setShowPreviewModal={setShowPreviewModal}
          isGenerating={isGenerating}
          isComplete={isComplete}
          refinementPrompt={refinementPrompt}
          setRefinementPrompt={setRefinementPrompt}
          startRefinement={startRefinement}
          isError={isError}
          errorText={errorText}
          finalCode={finalCode}
          setIsZenMode={setIsZenMode}
          startDeployment={startDeployment}
          deployerAgent={deployerAgent}
          auditLog={auditLog}
          handleSelectAgent={handleSelectAgent}
          mobileView={mobileView}
        />
      </main>

      <BottomNav activeView={mobileView} setActiveView={setMobileView} />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPreviewModal && finalCode && (
        <PreviewModal code={finalCode} onClose={() => setShowPreviewModal(false)} />
      )}
      {showDeploymentModal && (
         <DeploymentModal agent={deployerAgent} onClose={() => setShowDeploymentModal(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);


export default App;