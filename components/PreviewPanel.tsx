import React from 'react';
import ZenOnIcon from './icons/ZenOnIcon';
import ZenOffIcon from './icons/ZenOffIcon';

interface PreviewPanelProps {
  code: string | null;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, isZenMode, onToggleZenMode }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg">
      <header className="flex items-center justify-between p-3 border-b border-slate-700/50 flex-shrink-0">
        <h2 className="font-bold text-base text-slate-200">Live Application Preview</h2>
        <button
          onClick={onToggleZenMode}
          className="text-slate-400 hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
        >
          {isZenMode ? <ZenOffIcon className="w-5 h-5" /> : <ZenOnIcon className="w-5 h-5" />}
        </button>
      </header>
      <div className="flex-grow bg-white rounded-b-lg overflow-hidden">
        <iframe
          srcDoc={code || '<!DOCTYPE html><html><head></head><body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; font-family: sans-serif; color: #666;">Waiting for Coder agent...</body></html>'}
          title="Application Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
