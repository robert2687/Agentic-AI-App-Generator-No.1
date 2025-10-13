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
    <div className="mt-4 text-sm rounded-lg overflow-hidden border border-slate-700/70">
      <h4 className="text-xs font-bold bg-slate-800/80 px-3 py-1.5 text-slate-400 border-b border-slate-700/70 font-sans">
        Code Difference from Previous Step
      </h4>
      <div className="font-mono text-sm bg-slate-950 p-2">
        {changes.map((part, partIndex) => {
          const style = {
            background: part.added
              ? 'rgba(16, 185, 129, 0.15)'
              : part.removed
              ? 'rgba(244, 63, 94, 0.15)'
              : 'transparent',
          };
          const prefix = part.added ? '+' : part.removed ? '-' : ' ';
          // `diffLines` includes the newline in `part.value`, so we can split by it.
          // We remove the last empty string if the value ends with a newline.
          const lines = part.value.endsWith('\n') ? part.value.slice(0, -1).split('\n') : part.value.split('\n');

          return lines.map((line, lineIndex) => (
            <div key={`${partIndex}-${lineIndex}`} style={style} className="flex">
              <span className="w-8 text-center select-none opacity-50 flex-shrink-0">{prefix}</span>
              <span className="whitespace-pre-wrap flex-grow">{line}</span>
            </div>
          ));
        })}
      </div>
    </div>
  );
};

export default DiffViewer;
