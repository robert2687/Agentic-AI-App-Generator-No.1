import React from 'react';
import EyeIcon from './icons/EyeIcon';
import ErrorIcon from './icons/ErrorIcon';
import UserIcon from './icons/UserIcon';
import PremiumIcon from './icons/PremiumIcon';

interface PromptInputProps {
  projectGoal: string;
  setProjectGoal: (goal: string) => void;
  onStart: () => void;
  onReset: () => void;
  onPreview: () => void;
  isGenerating: boolean;
  isComplete: boolean;
  refinementPrompt: string;
  setRefinementPrompt: (prompt: string) => void;
  onRefine: () => void;
  isError: boolean;
  errorText: string | null;
  disabled?: boolean;
  isPremium: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  projectGoal, setProjectGoal, onStart, onReset, onPreview, isGenerating, isComplete,
  refinementPrompt, setRefinementPrompt, onRefine, isError, errorText, disabled = false, isPremium
}) => {
  
  if (isError) {
    return (
      <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 flex flex-col gap-3 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2">
          <ErrorIcon className="w-6 h-6 text-red-400" />
          <h2 className="text-lg font-bold text-red-300">Generation Failed</h2>
        </div>
        <p className="text-red-300/90 text-sm">
          {errorText || 'An unexpected error occurred during agent execution.'}
        </p>
        <button
          onClick={onReset}
          className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors mt-2"
        >
          Reset and Try Again
        </button>
      </div>
    );
  }

  if (disabled) {
    return (
        <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-3 text-center items-center">
            <UserIcon className="w-8 h-8 text-sky-400" />
            <h2 className="text-lg font-bold text-sky-300">Sign In to Begin</h2>
            <p className="text-slate-400/90 text-sm max-w-sm">
                Please sign in to start generating applications. Your projects will be saved to your account.
            </p>
        </div>
    );
  }
  
  if (!isPremium) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col gap-3 text-center items-center border-2 border-amber-500/30">
        <PremiumIcon className="w-10 h-10 text-amber-400" />
        <h2 className="text-xl font-bold text-amber-300">Upgrade to Premium</h2>
        <p className="text-slate-400/90 text-sm max-w-md mt-1">
            Unlock the full power of the AI Agent team. Upgrade now to generate, refine, and deploy unlimited applications with priority access.
        </p>
        <button
          className="mt-4 bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md hover:bg-amber-400 transition-colors"
        >
            Go Premium
        </button>
      </div>
    );
  }

  const handlePrimaryAction = () => {
    if (isComplete) {
      onPreview();
    } else {
      onStart();
    }
  };

  const primaryButtonText = isGenerating 
    ? 'Generating...' 
    : isComplete 
    ? 'Preview Application' 
    : 'Start Generation';
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col gap-4">
      <div>
        <label htmlFor="project-goal" className="font-bold text-sky-400">
          1. Define Your Project Goal
        </label>
        <textarea
          id="project-goal"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
          placeholder="e.g., A web app for tracking personal fitness goals with data visualization..."
          className="w-full h-32 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/30 focus:outline-none resize-none transition-colors mt-2"
          disabled={isGenerating || isComplete}
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={handlePrimaryAction}
            disabled={isGenerating || (!isComplete && !projectGoal.trim())}
            className="flex-grow bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isComplete && <EyeIcon className="w-5 h-5" />}
            {primaryButtonText}
          </button>
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="border-t border-slate-700/50 pt-4 flex flex-col gap-2 animate-fade-in">
          <label htmlFor="refinement-prompt" className="font-bold text-teal-400">
            2. Debug & Refine
          </label>
          <textarea
            id="refinement-prompt"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="e.g., The 'Delete' button isn't working. OR Change the title color to orange."
            className="w-full h-20 p-2 bg-slate-700/50 rounded-md border border-slate-600 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/30 focus:outline-none resize-none transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={onRefine}
            disabled={isGenerating || !refinementPrompt.trim()}
            className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Refining...' : 'Submit Refinement'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptInput;