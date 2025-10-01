
import React, { useState } from 'react';
import ZenOnIcon from './icons/ZenOnIcon';
import ZenOffIcon from './icons/ZenOffIcon';
import CodePreviewPanel from './CodePreviewPanel';

interface PreviewPanelProps {
  code: string | null;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, isZenMode, onToggleZenMode }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg">
      <header className="flex items-center justify-between p-3 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-base text-slate-200">Live Application</h2>
          <div className="flex items-center bg-slate-800 rounded-md p-1 text-sm">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              aria-pressed={activeTab === 'preview'}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'code' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              aria-pressed={activeTab === 'code'}
            >
              Code
            </button>
          </div>
        </div>
        <button
          onClick={onToggleZenMode}
          className="text-slate-400 hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
        >
          {isZenMode ? <ZenOffIcon className="w-5 h-5" /> : <ZenOnIcon className="w-5 h-5" />}
        </button>
      </header>
      <div className="flex-grow rounded-b-lg overflow-hidden">
        {activeTab === 'preview' ? (
          <iframe
            srcDoc={code || '<!DOCTYPE html><html><head></head><body style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fff; font-family: sans-serif; color: #666;">Waiting for Coder agent...</body></html>'}
            title="Application Preview"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-modals"
          />
        ) : (
          <CodePreviewPanel code={code} />
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
