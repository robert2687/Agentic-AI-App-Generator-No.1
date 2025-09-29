import React, { useRef, useEffect } from 'react';
import type { Agent } from '../types';
import { AgentStatus } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import SkeletonLoader from './SkeletonLoader';

interface AgentDetailViewProps {
  agent: Agent;
}

const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent }) => {
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
            <div className="inline-block animate-pulse bg-sky-400 w-2 h-5 ml-1" aria-label="Generating more content" />
          </>
        );

      case AgentStatus.COMPLETED:
        if (!agent.output) {
          return <p className="text-slate-500">Agent completed its task without generating any output.</p>;
        }
        return <MarkdownRenderer content={agent.output} />;

      case AgentStatus.ERROR:
        return (
          <div className="text-red-400 whitespace-pre-wrap">
            <p className="font-bold">An error occurred:</p>
            {agent.output}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
        <h2 className="text-xl font-bold text-sky-400">{agent.name} Agent</h2>
        <p className="text-sm text-slate-400">{agent.role}</p>
      </div>
      
      <div ref={scrollContainerRef} className="flex-grow p-4 overflow-y-auto bg-slate-900 rounded-b-lg">
        {agent.status === AgentStatus.PENDING && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Waiting for the workflow to start...</p>
          </div>
        )}

        {agent.status !== AgentStatus.PENDING && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Input</h3>
              <div className="bg-slate-800 p-3 rounded-md text-sm text-slate-300 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto ring-1 ring-slate-700">
                {agent.input || 'No input received yet.'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Output</h3>
              <div className="bg-slate-800 p-4 rounded-md min-h-[200px] ring-1 ring-slate-700">
                {renderOutputContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetailView;
