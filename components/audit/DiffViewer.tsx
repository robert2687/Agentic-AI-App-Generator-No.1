
import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';

interface DiffViewerProps {
  oldValue: string;
  newValue: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldValue, newValue }) => {
  const oldText = oldValue ?? '';
  const newText = newValue ?? '';
  
  if (oldText === newText) {
    return null;
  }

  return (
    <div className="mt-4 text-sm rounded-lg overflow-hidden border border-slate-700/70">
      <h4 className="text-xs font-bold bg-slate-800/80 px-3 py-1.5 text-slate-400 border-b border-slate-700/70">Code Difference from Previous Step</h4>
      <ReactDiffViewer
        oldValue={oldText}
        newValue={newText}
        splitView={false}
        showDiffOnly={true}
        styles={{
          variables: {
            dark: {
              color: '#e2e8f0',
              background: '#0f172a', // slate-950
              emptyBackground: '#1e293b', // slate-800
              addedBackground: 'rgba(16, 185, 129, 0.15)', // emerald-500
              addedColor: '#e2e8f0',
              removedBackground: 'rgba(244, 63, 94, 0.15)', // rose-500
              removedColor: '#e2e8f0',
              wordAddedBackground: 'rgba(16, 185, 129, 0.3)',
              wordRemovedBackground: 'rgba(244, 63, 94, 0.3)',
            },
          },
          diffContainer: {
            backgroundColor: '#0f172a',
            border: 'none',
          },
          gutter: {
            backgroundColor: '#1e293b',
            minWidth: '50px',
            padding: '0 10px',
            '&:hover': {
                backgroundColor: '#334155',
            }
          },
          line: {
              lineHeight: '1.6em',
              fontFamily: 'monospace',
          }
        }}
        useDarkTheme={true}
        compareMethod="diffWords"
      />
    </div>
  );
};

export default DiffViewer;
