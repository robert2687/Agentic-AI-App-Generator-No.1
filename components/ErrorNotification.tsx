import React, { useEffect } from 'react';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-scale-in max-w-md">
      <div className="glass shadow-2xl rounded-xl border-2 border-red-500 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-red-500 p-2 rounded-lg shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">Error</h4>
            <p className="text-sm text-text-primary dark:text-text-primary-dark">{message}</p>
          </div>
          <button 
            onClick={onClose} 
            className="flex-shrink-0 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors p-1 hover:bg-surface-highlight dark:hover:bg-surface-highlight-dark rounded-lg"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
