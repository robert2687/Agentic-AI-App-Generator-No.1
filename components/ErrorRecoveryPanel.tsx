import React from 'react';
import type { AgentName } from '../types';

interface ErrorRecoveryPanelProps {
  isError: boolean;
  errorText: string | null;
  failingAgentName?: AgentName;
  isGenerating: boolean;
  onRetry: () => void;
  onCancel: () => void;
  onReset: () => void;
}

const ErrorRecoveryPanel: React.FC<ErrorRecoveryPanelProps> = ({
  isError,
  errorText,
  failingAgentName,
  isGenerating,
  onRetry,
  onCancel,
  onReset,
}) => {
  if (!isError && !isGenerating) return null;

  return (
    <div 
      className={`
        card-modern p-5 animate-scale-in
        ${isError ? 'border-2 border-red-500 shadow-glow-error' : 'border-2 border-yellow-500'}
      `}
      role="alert"
      aria-live="assertive"
    >
      {isError ? (
        <>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 bg-red-500 p-2 rounded-lg shadow-lg">
              <svg 
                className="w-6 h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-red-600 dark:text-red-400 mb-2">
                Generation Failed
                {failingAgentName && ` at ${failingAgentName}`}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4 leading-relaxed">
                {errorText || 'An unexpected error occurred during generation.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onRetry}
                  className="btn-primary flex items-center gap-2 text-sm"
                  aria-label="Retry generation from the failed agent"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry from Failed Agent
                </button>
                <button
                  onClick={onReset}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  aria-label="Start over with a new generation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-yellow-500 p-2 rounded-lg shadow-lg">
              <svg 
                className="w-6 h-6 text-white animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-text-primary dark:text-text-primary-dark mb-2">
                Generation in Progress
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4 leading-relaxed">
                The agents are working on your request. This may take a few minutes.
              </p>
              <button
                onClick={onCancel}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm"
                aria-label="Cancel the current generation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Generation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ErrorRecoveryPanel;
