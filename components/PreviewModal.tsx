import React, { useEffect } from 'react';

interface PreviewModalProps {
  code: string;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ code, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-surface dark:bg-surface-dark rounded-lg shadow-2xl w-[95%] h-[90%] flex flex-col ring-1 ring-border dark:ring-border-dark">
        <header className="flex items-center justify-between p-3 border-b border-border dark:border-border-dark flex-shrink-0">
          <h2 className="font-bold text-lg text-text-primary dark:text-text-primary-dark">Application Preview</h2>
          <button 
            onClick={onClose} 
            className="text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-accent-primary dark:focus:ring-accent-primary-dark"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex-grow bg-white rounded-b-lg overflow-hidden">
          <iframe
            srcDoc={code}
            title="Application Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-modals"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
