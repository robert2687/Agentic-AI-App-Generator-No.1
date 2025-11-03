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
import DesktopIcon from './icons/DesktopIcon';
import TabletIcon from './icons/TabletIcon';
import MobileIcon from './icons/MobileIcon';

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
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fullscreenTargetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showZenGenerationOverlay = isZenMode && isGenerating && currentAgent;

  const isDeployerRunning = deployerAgent?.status === AgentStatus.RUNNING;

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

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
        disabled={!isWorkflowComplete || isDeployerRunning || isGenerating}
        className="flex items-center gap-2 bg-primary-600 text-white font-bold py-1.5 px-3 rounded-md text-sm hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors w-full lg:w-auto"
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
        disabled={auditLog.length === 0}
        className="flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark p-2 rounded-md transition-colors disabled:text-text-tertiary dark:disabled:text-text-tertiary-dark disabled:cursor-not-allowed w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label="Export audit logs as JSON"
      >
        <DownloadIcon className="w-5 h-5" />
        <span className="lg:hidden">Export Logs</span>
      </button>

      <button
        onClick={handleToggleFullscreen}
        className="flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark p-2 rounded-md transition-colors w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
      >
        {isFullscreen ? <FullScreenOffIcon className="w-5 h-5" /> : <FullScreenOnIcon className="w-5 h-5" />}
        <span className="lg:hidden">{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
      </button>

      <button
        onClick={onToggleZenMode}
        className="flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark p-2 rounded-md transition-colors w-full lg:w-auto lg:p-1.5 lg:rounded-full lg:bg-transparent"
        aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
      >
        {isZenMode ? <ZenOffIcon className="w-5 h-5" /> : <ZenOnIcon className="w-5 h-5" />}
        <span className="lg:hidden">{isZenMode ? "Exit Zen Mode" : "Zen Mode"}</span>
      </button>
    </>
  );

  const getTabClassName = (tabName: 'preview' | 'code' | 'logs'): string => {
    const baseClasses = 'py-2 px-3 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium';
    if (activeTab === tabName) {
      return `${baseClasses} bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300`;
    }
    return `${baseClasses} text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark`;
  };

  const getDeviceButtonClassName = (deviceName: typeof device) => {
    const base = 'p-1.5 rounded-md transition-colors';
    if(device === deviceName) {
      return `${base} bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300`;
    }
    return `${base} text-text-secondary dark:text-text-secondary-dark hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark`;
  }

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface-dark rounded-lg">
      <header className="flex flex-wrap items-center justify-between gap-y-2 p-2 border-b border-border dark:border-border-dark flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="font-bold text-base text-text-primary dark:text-text-primary-dark hidden sm:block">Live Application</h2>
          <div className="flex items-center rounded-md p-1 text-sm bg-surface-highlight dark:bg-surface-highlight-dark">
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
            className="text-text-secondary dark:text-text-secondary-dark hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="More options"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md shadow-lg z-20 p-2 flex flex-col gap-1">
              {React.Children.map(actionButtons, (button) => {
                const buttonElement = button as React.ReactElement<any>;
                // Don't show deploy button inside mobile menu, it has a FAB
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
      <div ref={fullscreenTargetRef} className="flex-grow rounded-b-lg overflow-hidden relative bg-background dark:bg-background-dark flex flex-col">
         {showZenGenerationOverlay && (
            <div className="absolute inset-0 bg-background/90 dark:bg-background-dark/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in transition-opacity duration-300">
                <div className="text-center p-8 rounded-lg">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <AgentIcon name={currentAgent.name} className="w-10 h-10 text-primary-500" />
                        <h3 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">{currentAgent.name}</h3>
                    </div>
                    <p className="text-text-secondary dark:text-text-secondary-dark text-lg mb-6">
                        Step {currentAgent.id} of {totalAgents -1}: Generating...
                    </p>
                    <SpinnerIcon className="w-12 h-12 text-primary-600 mx-auto" />
                </div>
            </div>
        )}

        <div className="flex-grow h-0">
          {activeTab === 'preview' && (
            <div className="w-full h-full bg-surface-highlight dark:bg-black/20 p-4 transition-all duration-300">
                <div
                    style={{ width: deviceWidths[device] }}
                    className="h-full mx-auto bg-white rounded-md shadow-lg transition-all duration-300 ease-in-out flex flex-col"
                >
                    <iframe
                        srcDoc={code || "<!DOCTYPE html><html><head></head><body style=\"display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fff; font-family: sans-serif; color: #666;\">Waiting for Coder agent...</body></html>"}
                        title="Application Preview"
                        className={`w-full h-full border-0 rounded-md`}
                        sandbox="allow-scripts allow-forms allow-modals"
                    />
                </div>
            </div>
          )}
          {activeTab === 'code' && <CodePreviewPanel code={code} />}
          {activeTab === 'logs' && <AuditInspector logs={auditLog} />}
        </div>

        {activeTab === 'preview' && (
             <div className="flex-shrink-0 p-2 border-t border-border dark:border-border-dark flex justify-center">
                 <div className="flex items-center gap-1 p-1 rounded-md bg-surface-highlight dark:bg-surface-highlight-dark">
                     <button title="Desktop Preview" className={getDeviceButtonClassName('desktop')} onClick={() => setDevice('desktop')}><DesktopIcon className="w-5 h-5"/></button>
                     <button title="Tablet Preview" className={getDeviceButtonClassName('tablet')} onClick={() => setDevice('tablet')}><TabletIcon className="w-5 h-5"/></button>
                     <button title="Mobile Preview" className={getDeviceButtonClassName('mobile')} onClick={() => setDevice('mobile')}><MobileIcon className="w-5 h-5"/></button>
                 </div>
             </div>
         )}
      </div>

      {/* Mobile Floating Action Button for Deploy */}
      {isWorkflowComplete && activeTab === 'preview' && (
        <button
          onClick={onDeploy}
          disabled={isDeployerRunning || isGenerating}
          className="lg:hidden fixed bottom-24 right-6 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-text-tertiary disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 z-30"
          aria-label="Deploy application"
        >
          <RocketIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default React.memo(PreviewPanel);
