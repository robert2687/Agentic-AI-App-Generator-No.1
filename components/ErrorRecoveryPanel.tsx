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
        bg-surface dark:bg-surface-dark 
        border rounded-lg p-4 shadow-sm
        ${isError ? 'border-red-500' : 'border-yellow-500'}
      `}
      role="alert"
      aria-live="assertive"
    >
      {isError ? (
        <>
          <div className="flex items-start gap-3 mb-4">
            <svg 
              className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" 
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
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">
                Generation Failed
                {failingAgentName && ` at ${failingAgentName}`}
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                {errorText || 'An unexpected error occurred during generation.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 bg-primary-600 text-white font-medium py-2 px-4 rounded-md text-sm hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Retry generation from the failed agent"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry from Failed Agent
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 bg-surface-highlight dark:bg-surface-highlight-dark text-text-primary dark:text-text-primary-dark font-medium py-2 px-4 rounded-md text-sm hover:bg-surface dark:hover:bg-surface-dark border border-border dark:border-border-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
          <div className="flex items-start gap-3">
            <svg 
              className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5 animate-spin" 
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
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-1">
                Generation in Progress
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3">
                The agents are working on your request. This may take a few minutes.
              </p>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 bg-red-600 text-white font-medium py-2 px-4 rounded-md text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
