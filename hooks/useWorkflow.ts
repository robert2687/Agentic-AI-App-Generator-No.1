import { useState, useCallback, useRef, useEffect } from 'react';
import type { Agent, AgentName, AuditLogEntry } from '../types';
import { AgentStatus } from '../types';
import { INITIAL_AGENTS } from '../constants';
import { Orchestrator } from '../services/orchestrator';
import { logger } from '../services/loggerInstance';

export const useWorkflow = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [projectGoal, setProjectGoal] = useState<string>('');
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const [finalCode, setFinalCode] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [recoveryContext, setRecoveryContext] = useState<{ failingAgentName: AgentName; errorMessage: string } | null>(null);

  const orchestratorRef = useRef<Orchestrator | null>(null);

  const handleAgentUpdate = useCallback((updatedAgent: Agent) => {
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
    setRefinementPrompt('');
    setIsGenerating(false);
    setIsComplete(false);
    setFinalCode(null);
    setAuditLog([]);
    setIsError(false);
    setErrorText(null);
    setRecoveryContext(null);
    logger.clear();
  }, []);

  const clearError = useCallback(() => {
    setIsError(false);
    setErrorText(null);
  }, []);
  
  const startGeneration = useCallback(async () => {
    if (!projectGoal.trim() || !orchestratorRef.current) return;
    resetState();
    setIsGenerating(true);

    await orchestratorRef.current.run(projectGoal);
  }, [projectGoal, resetState]);

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

    await orchestratorRef.current.runRefinement(refinementPrompt, finalCode);
    setRefinementPrompt('');
  }, [refinementPrompt, finalCode]);

  const startDeployment = useCallback(async () => {
    const deployerAgent = agents.find(a => a.name === 'Deployer');
    if (!finalCode || !orchestratorRef.current || !deployerAgent) return;
    if (deployerAgent.status === AgentStatus.COMPLETED) return;

    await orchestratorRef.current.runDeployment(finalCode);
  }, [finalCode, agents]);

  return {
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
    clearError,
  };
};