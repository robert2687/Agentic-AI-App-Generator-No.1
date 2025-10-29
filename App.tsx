import React from 'react';
import { useWorkflow } from './hooks/useWorkflow';
import { useUI } from './hooks/useUI';
import Header from './components/Header';
import PreviewModal from './components/PreviewModal';
import DeploymentModal from './components/DeploymentModal';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import { withPremiumGate } from './hoc/withPremiumGate';
import GeneratorWorkspace from './components/GeneratorWorkspace';
import { AgentStatus } from './types';

const GatedGeneratorWorkspace = withPremiumGate(GeneratorWorkspace);

const AppContent: React.FC = () => {
  const {
    agents,
    projectGoal,
    setProjectGoal,
    refinementPrompt,
    setRefinementPrompt,
    isGenerating,
    isComplete,
    isError,
    errorText,
    finalCode,
    auditLog,
    recoveryContext,
    startGeneration,
    startRefinement,
    startDeployment,
    resetState,
    setAgents,
  } = useWorkflow();

  const {
    selectedAgentId,
    isZenMode,
    showPreviewModal,
    showDeploymentModal,
    showAuthModal,
    mobileView,
    handleSelectAgent,
    setIsZenMode,
    setShowPreviewModal,
    setShowDeploymentModal,
    setShowAuthModal,
    setMobileView,
    resetUI,
    setSelectedAgentId,
  } = useUI();

  const handleReset = () => {
    resetState();
    resetUI();
  }

  const handleStartGeneration = () => {
    resetUI();
    startGeneration();
  }

  const handleStartRefinement = () => {
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
    startRefinement();
  }

  const handleStartDeployment = () => {
    setShowDeploymentModal(true);
    startDeployment();
  }

  const currentAgent = agents.find(a => a.status === AgentStatus.RUNNING) || null;
  const deployerAgent = agents.find(a => a.name === 'Deployer');

  return (
    <div className="bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark min-h-screen font-sans pb-20 lg:pb-0 transition-colors duration-300">
      <Header onSignIn={() => setShowAuthModal(true)} />
      <main className="max-w-screen-3xl mx-auto p-4 sm:p-6">
        <GatedGeneratorWorkspace
          agents={agents}
          selectedAgentId={selectedAgentId}
          currentAgent={currentAgent}
          recoveryContext={recoveryContext}
          setSelectedAgentId={setSelectedAgentId}
          isZenMode={isZenMode}
          projectGoal={projectGoal}
          setProjectGoal={setProjectGoal}
          startGeneration={handleStartGeneration}
          resetState={handleReset}
          setShowPreviewModal={setShowPreviewModal}
          isGenerating={isGenerating}
          isComplete={isComplete}
          refinementPrompt={refinementPrompt}
          setRefinementPrompt={setRefinementPrompt}
          startRefinement={handleStartRefinement}
          isError={isError}
          errorText={errorText}
          finalCode={finalCode}
          setIsZenMode={setIsZenMode}
          startDeployment={handleStartDeployment}
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
