import React from 'react';
import { diffLines, type Change } from 'diff';

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

  const changes: Change[] = diffLines(oldText, newText);

  return (
    <div className="mt-lg text-sm rounded-lg overflow-hidden border border-border-dark">
      <h4 className="text-xs font-bold bg-surface-dark px-sm py-xs text-text-secondary-dark border-b border-border-dark font-sans">
        Code Difference from Previous Step
      </h4>
      <div className="font-mono text-xs bg-background-dark p-sm overflow-x-auto">
        {changes.flatMap((part, partIndex) => {
          const partClasses = part.added
            ? 'bg-status-success-muted'
            : part.removed
            ? 'bg-status-error-muted'
            : '';
          const prefix = part.added ? '+' : part.removed ? '-' : ' ';
          const prefixClasses = part.added
            ? 'text-status-success'
            : part.removed
            ? 'text-status-error'
            : 'text-text-tertiary-dark';

          // `diffLines` includes the newline in `part.value`.
          // We remove the last empty string if the value ends with a newline.
          const lines = part.value.endsWith('\n') ? part.value.slice(0, -1).split('\n') : part.value.split('\n');

          return lines.map((line, lineIndex) => (
            <div key={`${partIndex}-${lineIndex}`} className={`flex ${partClasses}`}>
              <span className={`w-6 text-center select-none flex-shrink-0 ${prefixClasses}`}>{prefix}</span>
              <span className="whitespace-pre-wrap flex-grow">{line}</span>
            </div>
          ));
        })}
      </div>
    </div>
  );
};

export default DiffViewer;