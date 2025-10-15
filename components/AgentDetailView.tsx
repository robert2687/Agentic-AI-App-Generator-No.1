import React, { useRef, useEffect, useState } from 'react';
import type { Agent, AgentName } from '../types';
import { AgentStatus } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import SkeletonLoader from './SkeletonLoader';
import PatcherIcon from './icons/PatcherIcon';

interface AgentDetailViewProps {
  agent: Agent;
  recoveryContext: {
    failingAgentName: AgentName;
    errorMessage: string;
  } | null;
}

const Timer: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (agent.status === AgentStatus.RUNNING && agent.startedAt) {
      const intervalId = setInterval(() => {
        setElapsed(Date.now() - (agent.startedAt as number));
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [agent.status, agent.startedAt]);

  if (agent.status === AgentStatus.COMPLETED && agent.startedAt && agent.completedAt) {
    const duration = agent.completedAt - agent.startedAt;
    return <span className="text-sm text-text-tertiary dark:text-text-tertiary-dark">Completed in {(duration / 1000).toFixed(1)}s</span>;
  }
  
  if (agent.status === AgentStatus.ERROR && agent.startedAt && agent.completedAt) {
    const duration = agent.completedAt - agent.startedAt;
    return <span className="text-sm text-status-error dark:text-status-error-dark">Failed after {(duration / 1000).toFixed(1)}s</span>;
  }

  if (agent.status === AgentStatus.RUNNING && agent.startedAt) {
    return <span className="text-sm text-accent-primary dark:text-accent-primary-dark">Running for {(elapsed / 1000).toFixed(1)}s...</span>;
  }
  
  return null;
};


const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, recoveryContext }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the output when it updates, especially during streaming
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [agent.output, agent.status]);
  
  const renderOutputContent = () => {
    switch (agent.status) {
      case AgentStatus.RUNNING:
        if (!agent.output) {
          return <SkeletonLoader />;
        }
        return (
          <>
            <MarkdownRenderer content={agent.output} />
            <div className="inline-block animate-pulse bg-accent-primary dark:bg-accent-primary-dark w-2 h-5 ml-1" aria-label="Generating more content" />
          </>
        );

      case AgentStatus.COMPLETED:
        if (!agent.output) {
          return <p className="text-text-tertiary dark:text-text-tertiary-dark">Agent completed its task without generating any output.</p>;
        }
        return <MarkdownRenderer content={agent.output} />;

      case AgentStatus.ERROR:
        return (
          <div className="text-status-error dark:text-status-error-dark whitespace-pre-wrap">
            <p className="font-bold">An error occurred:</p>
            {agent.output}
          </div>
        );
      
      default:
        return null;
    }
  };

  const isFailingAgentInRecovery = recoveryContext && agent.name === recoveryContext.failingAgentName;
  const isRecoveringAgent = recoveryContext && (agent.name === 'Reviewer' || agent.name === 'Patcher');
  const showRecoveryBanner = isFailingAgentInRecovery || isRecoveringAgent;

  return (
    <div className="flex flex-col h-full">
      {showRecoveryBanner && recoveryContext && (
        <div className="p-3 bg-status-warning/20 text-status-warning border-b border-status-warning/30 text-sm flex-shrink-0">
          <p className="font-bold flex items-center gap-2">
            <PatcherIcon className="w-4 h-4" />
            <span>Recovery Mode Active</span>
          </p>
          {isFailingAgentInRecovery && <p className="mt-1">This agent encountered an error. The Reviewer is analyzing the issue.</p>}
          {agent.name === 'Reviewer' && <p className="mt-1">Analyzing failure from the <strong>{recoveryContext.failingAgentName}</strong> agent to generate a fix.</p>}
          {agent.name === 'Patcher' && <p className="mt-1">Applying fix for the <strong>{recoveryContext.failingAgentName}</strong> agent.</p>}
        </div>
      )}

      <div className="p-4 border-b border-border dark:border-border-dark flex-shrink-0">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-accent-primary dark:text-accent-primary-dark">{agent.name} Agent</h2>
          <Timer agent={agent} />
        </div>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{agent.role}</p>
      </div>
      
      <div ref={scrollContainerRef} className="flex-grow p-4 overflow-y-auto bg-surface dark:bg-surface-dark rounded-b-lg">
        {agent.status === AgentStatus.PENDING && (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-tertiary dark:text-text-tertiary-dark">Waiting for the workflow to start...</p>
          </div>
        )}

        {agent.status !== AgentStatus.PENDING && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-accent-indigo dark:text-accent-indigo-dark mb-2">Input</h3>
              <div className="bg-surface-highlight dark:bg-surface-highlight-dark p-3 rounded-md text-sm text-text-primary dark:text-text-primary-dark whitespace-pre-wrap font-mono max-h-60 overflow-y-auto ring-1 ring-border dark:ring-border-dark">
                {agent.input || 'No input received yet.'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent-indigo dark:text-accent-indigo-dark mb-2">Output</h3>
              <div className="bg-surface-highlight dark:bg-surface-highlight-dark p-4 rounded-md min-h-[200px] ring-1 ring-border dark:ring-border-dark">
                {renderOutputContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AgentDetailView);
