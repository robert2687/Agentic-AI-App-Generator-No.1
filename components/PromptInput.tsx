import React from 'react';
import EyeIcon from './icons/EyeIcon';
import ErrorIcon from './icons/ErrorIcon';

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
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  projectGoal, setProjectGoal, onStart, onReset, onPreview, isGenerating, isComplete,
  refinementPrompt, setRefinementPrompt, onRefine, isError, errorText, 
}) => {

  if (isError) {
    return (
      <div className="bg-status-error-muted border border-status-error rounded-lg p-4 flex flex-col gap-3 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2">
          <ErrorIcon className="w-6 h-6 text-status-error" />
          <h2 className="text-lg font-bold text-status-error">Generation Failed</h2>
        </div>
        <p className="text-status-error/90 text-sm">
          {errorText || 'An unexpected error occurred during agent execution.'}
        </p>
        <button
          onClick={onReset}
          className="w-full bg-text-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-text-tertiary transition-colors mt-2"
        >
          Reset and Try Again
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
    <div className="bg-surface-lighter rounded-lg p-4 flex flex-col gap-4">
      <div>
        <label htmlFor="project-goal" className="font-bold text-accent-primary">
          1. Define Your Project Goal
        </label>
        <textarea
          id="project-goal"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
          placeholder="e.g., A web app for tracking personal fitness goals with data visualization..."
          className="w-full h-32 p-2 bg-surface rounded-md border border-border focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/20 focus:outline-none resize-none transition-colors mt-2"
          disabled={isGenerating || isComplete}
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={handlePrimaryAction}
            disabled={isGenerating || (!isComplete && !projectGoal.trim())}
            className="flex-grow bg-accent-primary text-white font-bold py-2 px-4 rounded-md hover:bg-accent-primary-hover disabled:bg-surface-highlight disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isComplete && <EyeIcon className="w-5 h-5" />}
            {primaryButtonText}
          </button>
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="bg-text-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-text-tertiary disabled:bg-surface-highlight disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="border-t border-border pt-4 flex flex-col gap-2 animate-fade-in">
          <label htmlFor="refinement-prompt" className="font-bold text-accent-secondary">
            2. Debug & Refine
          </label>
          <textarea
            id="refinement-prompt"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="e.g., The 'Delete' button isn't working. OR Change the title color to orange."
            className="w-full h-20 p-2 bg-surface rounded-md border border-border focus:border-accent-secondary focus:ring-4 focus:ring-accent-secondary/20 focus:outline-none resize-none transition-colors"
            disabled={isGenerating}
          />
          <button
            onClick={onRefine}
            disabled={isGenerating || !refinementPrompt.trim()}
            className="w-full bg-accent-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-surface-highlight disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Refining...' : 'Submit Refinement'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptInput;
