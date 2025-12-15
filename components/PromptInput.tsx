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
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-2 border-status-error rounded-xl p-6 flex flex-col gap-4 text-center animate-scale-in shadow-glow-error">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-red-500 p-2.5 rounded-xl shadow-lg">
            <ErrorIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-status-error">Generation Failed</h2>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm font-medium">
          {errorText || 'An unexpected error occurred during agent execution.'}
        </p>
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 mt-2 shadow-lg"
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
    <div className="card-modern p-6 flex flex-col gap-5 animate-scale-in">
      <div>
        <label htmlFor="project-goal" className="font-bold text-lg text-text-primary dark:text-text-primary-dark flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg">1</span>
          Define Your Project Goal
        </label>
        <textarea
          id="project-goal"
          value={projectGoal}
          onChange={(e) => setProjectGoal(e.target.value)}
          placeholder="e.g., A web app for tracking personal fitness goals with data visualization..."
          className="input-modern mt-3 h-36 text-base"
          disabled={isGenerating || isComplete}
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={handlePrimaryAction}
            disabled={isGenerating || (!isComplete && !projectGoal.trim())}
            className="flex-grow btn-primary flex items-center justify-center gap-2"
          >
            {isComplete && <EyeIcon className="w-5 h-5" />}
            {primaryButtonText}
          </button>
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="btn-secondary px-8"
          >
            Reset
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="border-t-2 border-border dark:border-border-dark pt-5 flex flex-col gap-3 animate-scale-in">
          <label htmlFor="refinement-prompt" className="font-bold text-lg text-text-primary dark:text-text-primary-dark flex items-center gap-2">
            <span className="bg-gradient-to-r from-green-600 to-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg">2</span>
            Debug & Refine
          </label>
          <textarea
            id="refinement-prompt"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="e.g., The 'Delete' button isn't working. OR Change the title color to orange."
            className="input-modern h-24 text-base"
            disabled={isGenerating}
          />
          <button
            onClick={onRefine}
            disabled={isGenerating || !refinementPrompt.trim()}
            className="btn-primary w-full"
          >
            {isGenerating ? 'Refining...' : 'Submit Refinement'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptInput;
