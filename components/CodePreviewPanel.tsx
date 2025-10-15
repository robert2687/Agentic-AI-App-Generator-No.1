import React, { useEffect, useRef, useState } from 'react';
import CopyIcon from './icons/CopyIcon';

// Make Prism available in the component's scope from the global window object
declare const Prism: any;

interface CodePreviewPanelProps {
  code: string | null;
}

const CodePreviewPanel: React.FC<CodePreviewPanelProps> = ({ code }) => {
  const codeRef = useRef<HTMLElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && typeof Prism !== 'undefined' && Prism.highlightElement) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!code) {
    return (
        <div className="h-full bg-surface dark:bg-surface-dark p-4 flex items-center justify-center text-text-tertiary dark:text-text-tertiary-dark">
            No code to display.
        </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 relative">
       <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 transition-colors flex items-center gap-1.5 p-2 rounded-md z-10 text-xs"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? (
            <span className="text-green-400">Copied!</span>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>

      {/* The 'prism-okaidia.css' theme sets the background, so we just need the container */}
      <pre className="h-full overflow-auto !m-0 !p-4 !rounded-none text-sm">
        <code ref={codeRef} className="language-html">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodePreviewPanel;
