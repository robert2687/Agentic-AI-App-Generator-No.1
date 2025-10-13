import React, { useState, useRef, useEffect } from 'react';
import ZenOnIcon from './icons/ZenOnIcon';
import ZenOffIcon from './icons/ZenOffIcon';
import CodePreviewPanel from './CodePreviewPanel';
import type { Agent, AuditLogEntry } from '../types';
import { AgentStatus } from '../types';
import AgentIcon from './icons/AgentIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import RocketIcon from './icons/RocketIcon';
import FullScreenOnIcon from './icons/FullScreenOnIcon';
import FullScreenOffIcon from './icons/FullScreenOffIcon';
import EyeIcon from './icons/EyeIcon';
import CodeIcon from './icons/CodeIcon';
import LogIcon from './icons/LogIcon';
import AuditInspector from './AuditInspector';


interface PreviewPanelProps {
  code: string | null;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isGenerating: boolean;
  currentAgent: Agent | null;
  totalAgents: number;
  isWorkflowComplete: boolean;
  onDeploy: () => void;
  deployerAgent?: Agent;
  auditLog: AuditLogEntry[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  code, isZenMode, onToggleZenMode, isGenerating, currentAgent, totalAgents,
  isWorkflowComplete, onDeploy, deployerAgent, auditLog
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'logs'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenTargetRef = useRef<HTMLDivElement>(null);
  
  const showZenGenerationOverlay = isZenMode && isGenerating && currentAgent;

  const isDeployerRunning = deployerAgent?.status === AgentStatus.RUNNING;

  const handleToggleFullscreen = () => {
    if (!fullscreenTargetRef.current) return;

    if (!document.fullscreenElement) {
      fullscreenTargetRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg">
      <header className="flex items-center justify-between p-3 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-base text-slate-200">Live Application</h2>
          <div className="flex items-center bg-slate-800 rounded-md p-1 text-sm">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              aria-pressed={activeTab === 'preview'}
            >
              <EyeIcon className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'code' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              aria-pressed={activeTab === 'code'}
            >
              <CodeIcon className="w-4 h-4" />
              Code
            </button>
             <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              aria-pressed={activeTab === 'logs'}
            >
              <LogIcon className="w-4 h-4" />
              Logs
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onDeploy}
                disabled={!isWorkflowComplete || isDeployerRunning || isGenerating}
                className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-1.5 px-3 rounded-md text-sm hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                aria-label={isWorkflowComplete ? "Deploy application" : "Complete generation to enable deployment"}
            >
                {isDeployerRunning ? (
                    <SpinnerIcon className="w-4 h-4" />
                ) : (
                    <RocketIcon className="w-4 h-4" />
                )}
                {isDeployerRunning ? 'Deploying...' : 'Deploy'}
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="text-slate-400 hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullscreen ? <FullScreenOffIcon className="w-5 h-5" /> : <FullScreenOnIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onToggleZenMode}
              className="text-slate-400 hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            >
              {isZenMode ? <ZenOffIcon className="w-5 h-5" /> : <ZenOnIcon className="w-5 h-5" />}
            </button>
        </div>
      </header>
      <div ref={fullscreenTargetRef} className="flex-grow rounded-b-lg overflow-hidden relative bg-slate-900">
         {showZenGenerationOverlay && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in transition-opacity duration-300">
                <div className="text-center p-8 rounded-lg">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <AgentIcon name={currentAgent.name} className="w-10 h-10 text-sky-400" />
                        <h3 className="text-3xl font-bold text-slate-100">{currentAgent.name}</h3>
                    </div>
                    <p className="text-slate-300 text-lg mb-6">
                        Step {currentAgent.id} of {totalAgents -1}: Generating...
                    </p>
                    <SpinnerIcon className="w-12 h-12 text-sky-500 mx-auto" />
                </div>
            </div>
        )}

        {activeTab === 'preview' && (
          <iframe
            srcDoc={code || '<!DOCTYPE html><html><head></head><body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fff; font-family: sans-serif; color: #666;">Waiting for Coder agent...</body></html>'}
            title="Application Preview"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-modals"
          />
        )}
        {activeTab === 'code' && <CodePreviewPanel code={code} />}
        {activeTab === 'logs' && <AuditInspector logs={auditLog} />}
      </div>
    </div>
  );
};

export default React.memo(PreviewPanel);
