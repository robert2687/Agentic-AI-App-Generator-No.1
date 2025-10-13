
import React, { useState, useRef, useEffect } from 'react';
import type { AuditLogEntry } from '../types';
import DiffViewer from './DiffViewer';
import CheckIcon from './icons/CheckIcon';
import ErrorIcon from './icons/ErrorIcon';
import LogIcon from './icons/LogIcon';
import MarkdownRenderer from './MarkdownRenderer';

const typeStyles: Record<AuditLogEntry['type'], { icon: React.ReactNode; text: string; border: string }> = {
    start: { icon: <LogIcon className="w-4 h-4" />, text: 'text-sky-400', border: 'border-slate-700' },
    end: { icon: <CheckIcon className="w-4 h-4" />, text: 'text-green-400', border: 'border-slate-700' },
    error: { icon: <ErrorIcon className="w-4 h-4" />, text: 'text-red-400', border: 'border-red-700/50' },
    info: { icon: <LogIcon className="w-4 h-4" />, text: 'text-indigo-400', border: 'border-slate-700' },
    chunk: { icon: <LogIcon className="w-4 h-4" />, text: 'text-slate-500', border: 'border-slate-700' },
};

const AuditInspector: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        // Auto-scroll to the bottom when new logs are added
        if (scrollRef.current && listRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs.length]);

    // Filter for logs that represent significant agent steps
    const relevantLogs = logs.filter(log => log.type === 'end' || log.type === 'error');

    const findPreviousOutputLog = (currentIndex: number): AuditLogEntry | null => {
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (relevantLogs[i].output) {
                return relevantLogs[i];
            }
        }
        return null;
    };

    return (
        <div ref={scrollRef} className="h-full bg-slate-950 p-4 overflow-y-auto font-sans text-sm">
            {relevantLogs.length === 0 && (
                <div className="text-slate-500 text-center py-8">
                    Detailed agent logs will appear here...
                </div>
            )}
            <ul ref={listRef} className="space-y-2">
                {relevantLogs.map((log, index) => {
                    const isExpanded = expandedIndex === index;
                    const styles = typeStyles[log.type];
                    const previousLog = findPreviousOutputLog(index);
                    
                    return (
                        <li key={log.timestamp + log.agentName} className={`bg-slate-900/70 rounded-md border ${isExpanded ? 'ring-2 ring-indigo-500' : ''} ${styles.border} transition-all duration-200`}>
                            <div
                                className="flex items-center gap-3 p-2 cursor-pointer"
                                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                role="button"
                                aria-expanded={isExpanded}
                            >
                                <div className={`flex-shrink-0 pt-0.5 ${styles.text}`}>{styles.icon}</div>
                                <span className={`font-bold mr-2 ${log.agentName === 'Orchestrator' ? 'text-indigo-400' : 'text-slate-300'}`}>
                                    {log.agentName}
                                </span>
                                <span className="text-slate-400 truncate flex-grow">{log.message}</span>
                                <span className="text-slate-500 flex-shrink-0 text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                                    {log.prompt && (
                                        <div className="mb-4">
                                            <h4 className="font-bold text-indigo-400 text-xs mb-1 uppercase">Prompt</h4>
                                            <div className="bg-slate-900 p-3 rounded-md text-xs text-slate-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto ring-1 ring-slate-700">
                                                {log.prompt}
                                            </div>
                                        </div>
                                    )}
                                    {log.output && (
                                        <div className="mb-4">
                                            <h4 className="font-bold text-indigo-400 text-xs mb-1 uppercase">Output</h4>
                                            <div className="bg-slate-900 p-3 rounded-md max-h-72 overflow-y-auto ring-1 ring-slate-700">
                                                <MarkdownRenderer content={log.output} />
                                            </div>
                                        </div>
                                    )}
                                    {previousLog?.output && log.output && (
                                        <DiffViewer oldValue={previousLog.output} newValue={log.output} />
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default React.memo(AuditInspector);