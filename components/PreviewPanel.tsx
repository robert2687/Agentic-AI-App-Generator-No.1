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
import DownloadIcon from './icons/DownloadIcon';
import { logger } from '../services/loggerInstance';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import PremiumIcon from './icons/PremiumIcon';
import ErrorIcon from './icons/ErrorIcon';

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
  disabled?: boolean;
  isPremium: boolean;
  premiumCheckError: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  code, isZenMode, onToggleZenMode, isGenerating, currentAgent, totalAgents,
  isWorkflowComplete, onDeploy, deployerAgent, auditLog, disabled = false, isPremium,
  premiumCheckError
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'logs'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fullscreenTargetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const showZenGenerationOverlay = isZenMode && isGenerating && currentAgent;

  const isDeployerRunning = deployerAgent?.status === AgentStatus.RUNNING;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  
  const handleExportLogs = () => {
      const jsonString = logger.exportJSON();
      if (!jsonString || jsonString === '[]') return;

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-audit-log-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const actionButtons = (
    <>
      <button
        onClick={onDeploy}
        disabled={!isWorkflowComplete || isDeployerRunning || isGenerating || disabled || !isPremium || !!premiumCheckError}
        className="flex items-center gap-2 bg-accent-indigo text-white font-bold py-1.5 px-3 rounded-md text-sm hover:bg-accent-indigo-hover disabled:bg-surface-highlight-dark disabled:text-text-tertiary-dark disabled:cursor-not-allowed transition-colors w-full lg:w-auto"
        aria-label={isWorkflowComplete ? "Deploy application" : "Complete generation to enable deployment"}
      >
        {isDeployerRunning ? (
          <SpinnerIcon className="w-4 h-4" />
        ) : (
          <RocketIcon className="w-4 h-4" />
        )}
        <span>{isDeployerRunning ? 'Deploying...' : 'Deploy'}</span>
      </button>
      <button
        onClick={handleExportLogs}
        disabled={auditLog.length === 0 || disabled}
        className="flex items-center gap-2 text-text-secondary-dark hover:bg-surface-highlight-dark p-2 rounded-md transition-colors disabled:text-text-tertiary-dark disabled:cursor-not-allowed w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label="Export audit logs as JSON"
      >
        <DownloadIcon className="w-5 h-5" />
        <span className="lg:hidden">Export Logs</span>
      </button>

      <button
        onClick={handleToggleFullscreen}
        className="flex items-center gap-2 text-text-secondary-dark hover:bg-surface-highlight-dark p-2 rounded-md transition-colors w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
      >
        {isFullscreen ? <FullScreenOffIcon className="w-5 h-5" /> : <FullScreenOnIcon className="w-5 h-5" />}
        <span className="lg:hidden">{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
      </button>
      
      <button
        onClick={onToggleZenMode}
        className="flex items-center gap-2 text-text-secondary-dark hover:bg-surface-highlight-dark p-2 rounded-md transition-colors w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
      >
        {isZenMode ? <ZenOffIcon className="w-5 h-5" /> : <ZenOnIcon className="w-5 h-5" />}
        <span className="lg:hidden">{isZenMode ? "Exit Zen Mode" : "Zen Mode"}</span>
      </button>
    </>
  );

  const getTabClassName = (tabName: 'preview' | 'code' | 'logs'): string => {
    const baseClasses = 'py-2xs px-sm rounded-md transition-colors flex items-center gap-xs text-sm';
    if (activeTab === tabName) {
      return `${baseClasses} bg-accent-primary-hover text-white`;
    }
    return `${baseClasses} text-text-secondary-dark hover:bg-surface-highlight-dark`;
  };

  let overlayContent: React.ReactNode | null = null;
  if (disabled) {
      overlayContent = (
          <p className="text-text-secondary-dark text-center">Please sign in to view the application preview.</p>
      );
  } else if (premiumCheckError) {
      overlayContent = (
          <div className="text-center flex flex-col items-center gap-3">
              <ErrorIcon className="w-10 h-10 text-amber-400" />
              <h3 className="text-xl font-bold text-amber-300">Database Setup Required</h3>
              <p className="text-slate-400/90 text-sm max-w-sm">
                  The preview is disabled because the 'entitlements' table is missing. Please see the main panel for setup instructions.
              </p>
          </div>
      );
  } else if (!isPremium) {
      overlayContent = (
          <div className="text-center flex flex-col items-center gap-3">
              <PremiumIcon className="w-10 h-10 text-amber-400" />
              <h3 className="text-xl font-bold text-amber-300">Premium Feature</h3>
              <p className="text-slate-400/90 text-sm max-w-sm">
                  Application generation and preview are available for premium members.
              </p>
              <button className="mt-2 bg-amber-500 text-slate-900 font-bold py-2 px-5 rounded-md hover:bg-amber-400 transition-colors">
                  Upgrade Now
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-background-dark rounded-lg">
      <header className="flex flex-wrap items-center justify-between gap-y-2 p-sm border-b border-border-light-dark flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="font-bold text-base text-text-primary-dark hidden sm:block">Live Application</h2>
          <div className="flex items-center rounded-md p-2xs text-sm bg-surface-dark">
            <button
              className={getTabClassName('preview')}
              onClick={() => setActiveTab('preview')}
              aria-pressed={activeTab === 'preview'}
            >
              <EyeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              className={getTabClassName('code')}
              onClick={() => setActiveTab('code')}
              aria-pressed={activeTab === 'code'}
            >
              <CodeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Code</span>
            </button>
             <button
              className={getTabClassName('logs')}
              onClick={() => setActiveTab('logs')}
              aria-pressed={activeTab === 'logs'}
            >
              <LogIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {actionButtons}
        </div>
        
        {/* Mobile Kebab Menu */}
        <div ref={menuRef} className="relative lg:hidden">
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="text-text-secondary-dark hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-label="More options"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-dark border border-border-dark rounded-md shadow-lg z-20 p-2 flex flex-col gap-1">
              {React.Children.map(actionButtons, (button) => {
                const buttonElement = button as React.ReactElement<any>;
                if (buttonElement.props.onClick === onDeploy) {
                  return null;
                }
                return React.cloneElement(buttonElement, {
                  onClick: () => {
                    if (buttonElement.props.onClick) {
                      buttonElement.props.onClick();
                    }
                    setIsMenuOpen(false);
                  },
                })
              })}
            </div>
          )}
        </div>

      </header>
      <div ref={fullscreenTargetRef} className="flex-grow rounded-b-lg overflow-hidden relative bg-background-dark">
         {showZenGenerationOverlay && (
            <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in transition-opacity duration-300">
                <div className="text-center p-8 rounded-lg">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <AgentIcon name={currentAgent.name} className="w-10 h-10 text-accent-primary" />
                        <h3 className="text-3xl font-bold text-text-primary-dark">{currentAgent.name}</h3>
                    </div>
                    <p className="text-text-secondary-dark text-lg mb-6">
                        Step {currentAgent.id} of {totalAgents -1}: Generating...
                    </p>
                    <SpinnerIcon className="w-12 h-12 text-accent-primary-hover mx-auto" />
                </div>
            </div>
        )}

        {overlayContent && (
          <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-4">
            {overlayContent}
          </div>
        )}
        
        <div className={overlayContent ? 'opacity-0' : ''}>
          {activeTab === 'preview' && (
            <iframe
              srcDoc={code || '<!DOCTYPE html><html><head></head><body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fff; font-family: sans-serif; color: #666;">Waiting for Coder agent...</body></html>'}
              title="Application Preview"
              className={`w-full h-full border-0 bg-white`}
              sandbox="allow-scripts allow-forms allow-modals"
            />
          )}
          {activeTab === 'code' && <CodePreviewPanel code={code} />}
          {activeTab === 'logs' && <AuditInspector logs={auditLog} />}
        </div>
      </div>
      
      {/* Mobile Floating Action Button for Deploy */}
      {isWorkflowComplete && activeTab === 'preview' && (
        <button
          onClick={onDeploy}
          disabled={isDeployerRunning || isGenerating || disabled || !isPremium || !!premiumCheckError}
          className="lg:hidden fixed bottom-24 right-6 bg-accent-indigo text-white rounded-full p-4 shadow-lg hover:bg-accent-indigo-hover disabled:bg-surface-highlight-dark disabled:text-text-tertiary-dark disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 z-30"
          aria-label="Deploy application"
        >
          <RocketIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default React.memo(PreviewPanel);