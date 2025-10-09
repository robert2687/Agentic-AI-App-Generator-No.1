import React, { useEffect } from 'react';
import type { Agent } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import SpinnerIcon from './icons/SpinnerIcon';
import { AgentStatus } from '../types';
import ErrorIcon from './icons/ErrorIcon';
import DeployerIcon from './icons/DeployerIcon';

interface DeploymentModalProps {
  agent: Agent | undefined;
  onClose: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ agent, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const renderContent = () => {
    if (!agent || agent.status === AgentStatus.PENDING) {
      return <div className="text-slate-400">Waiting for deployment process to start...</div>;
    }

    if (agent.status === AgentStatus.RUNNING) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <SpinnerIcon className="w-10 h-10 text-sky-400" />
          <p className="text-slate-300 mb-4">Generating deployment instructions...</p>
          {/* Show streamed output if available */}
          {agent.output && <div className="w-full"><MarkdownRenderer content={agent.output} /></div>}
        </div>
      );
    }
    
    if (agent.status === AgentStatus.ERROR) {
      return (
        <div className="text-red-400">
            <div className="flex items-center gap-2 font-bold mb-2">
                <ErrorIcon className="w-5 h-5" />
                <span>Deployment Failed</span>
            </div>
            <p className="whitespace-pre-wrap bg-slate-800 p-3 rounded-md">{agent.output}</p>
        </div>
      )
    }

    if (agent.status === AgentStatus.COMPLETED && agent.output) {
      return <MarkdownRenderer content={agent.output} />;
    }

    return <div className="text-slate-400">No instructions were generated.</div>;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="bg-slate-900 rounded-lg shadow-2xl w-[95%] max-w-3xl h-[90%] max-h-[800px] flex flex-col ring-1 ring-slate-700/50" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="font-bold text-lg text-slate-200 flex items-center gap-2">
            <DeployerIcon className="w-5 h-5 text-sky-400" />
            Deployment Instructions
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close deployment instructions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex-grow overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
