import React, { useState, useRef, useEffect } from 'react';
import type { AuditLogEntry } from '../types';
import DiffViewer from './DiffViewer';
import CheckIcon from './icons/CheckIcon';
import ErrorIcon from './icons/ErrorIcon';
import LogIcon from './icons/LogIcon';
import MarkdownRenderer from './MarkdownRenderer';

type FilterType = 'all' | 'success' | 'error';

const typeStyles = {
    end: { icon: <CheckIcon className="w-4 h-4" />, color: 'text-status-success dark:text-status-success-dark', border: 'border-border dark:border-border-dark' },
    error: { icon: <ErrorIcon className="w-4 h-4" />, color: 'text-status-error dark:text-status-error-dark', border: 'border-status-error dark:border-status-error-dark' },
    info: { icon: <LogIcon className="w-4 h-4" />, color: 'text-accent-indigo dark:text-accent-indigo-dark', border: 'border-border dark:border-border-dark' },
    default: { icon: <LogIcon className="w-4 h-4" />, color: 'text-accent-primary dark:text-accent-primary-dark', border: 'border-border dark:border-border-dark' },
};

const FilterChip: React.FC<{ label: string; filter: FilterType; activeFilter: FilterType; onClick: () => void; }> = ({ label, filter, activeFilter, onClick }) => {
    const isActive = activeFilter === filter;
    const activeClasses = 'bg-accent-primary dark:bg-accent-primary-hover text-white';
    const inactiveClasses = 'bg-surface-lighter dark:bg-surface-lighter-dark text-text-primary dark:text-text-primary-dark';
    return (
        <button
            onClick={onClick}
            className={`py-2xs px-sm rounded-full text-xs font-semibold transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            aria-pressed={isActive}
        >
            {label}
        </button>
    );
};

const AuditInspector: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs.length]);

    const relevantLogs = logs.filter(log => log.type === 'end' || log.type === 'error');
    
    const filteredLogs = relevantLogs.filter(log => {
        if (filter === 'success') return log.type === 'end';
        if (filter === 'error') return log.type === 'error';
        return true;
    });

    const findPreviousOutputLog = (currentIndexInRelevantLogs: number): AuditLogEntry | null => {
        for (let i = currentIndexInRelevantLogs - 1; i >= 0; i--) {
            if (relevantLogs[i].output) {
                return relevantLogs[i];
            }
        }
        return null;
    };

    return (
        <div className="h-full bg-surface dark:bg-background-dark flex flex-col font-sans text-sm">
             <div className="p-xs border-b border-border-light dark:border-border-dark flex-shrink-0 flex items-center gap-xs">
                <FilterChip label="All" filter="all" activeFilter={filter} onClick={() => setFilter('all')} />
                <FilterChip label="Success" filter="success" activeFilter={filter} onClick={() => setFilter('success')} />
                <FilterChip label="Error" filter="error" activeFilter={filter} onClick={() => setFilter('error')} />
            </div>

            <div ref={scrollRef} className="flex-grow p-sm overflow-y-auto">
                {filteredLogs.length === 0 && (
                    <div className="text-text-tertiary dark:text-text-tertiary-dark text-center py-xl">
                        No logs match the current filter.
                    </div>
                )}
                <ul className="list-none p-0 m-0 flex flex-col gap-sm">
                    {filteredLogs.map((log) => {
                        const originalIndex = relevantLogs.findIndex(l => l.timestamp === log.timestamp && l.agentName === log.agentName);
                        const isExpanded = expandedIndex === originalIndex;
                        const styles = typeStyles[log.type as keyof typeof typeStyles] ?? typeStyles.default;
                        const previousLog = findPreviousOutputLog(originalIndex);
                        
                        return (
                            <li key={log.timestamp + log.agentName} className={`bg-surface dark:bg-surface-dark/70 rounded-md border ${isExpanded ? 'border-accent-indigo dark:border-accent-indigo-dark' : styles.border} transition-colors ease-in-out`}>
                                <div
                                    className="p-sm cursor-pointer"
                                    onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                                    role="button"
                                    aria-expanded={isExpanded}
                                >
                                    <div className="md:hidden">
                                        <div className="flex justify-between items-center">
                                            <span className={`font-bold ${log.agentName === 'Orchestrator' ? 'text-accent-indigo dark:text-accent-indigo-dark' : 'text-text-primary dark:text-text-primary-dark'}`}>
                                                {log.agentName}
                                            </span>
                                             <div className={`flex items-center gap-1.5 text-xs font-semibold ${styles.color}`}>
                                                {styles.icon}
                                                <span>{log.type === 'end' ? 'Success' : 'Failed'}</span>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary dark:text-text-secondary-dark text-xs mt-2xs truncate">{log.message}</p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-3">
                                        <div className={styles.color}>{styles.icon}</div>
                                        <span className={`font-bold w-32 flex-shrink-0 ${log.agentName === 'Orchestrator' ? 'text-accent-indigo dark:text-accent-indigo-dark' : 'text-text-primary dark:text-text-primary-dark'}`}>
                                            {log.agentName}
                                        </span>
                                        <span className="truncate flex-grow text-text-secondary dark:text-text-secondary-dark">{log.message}</span>
                                        <span className="flex-shrink-0 text-xs text-text-tertiary dark:text-text-tertiary-dark">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-border-light dark:border-border-light-dark p-md bg-surface-lighter dark:bg-surface-dark/30">
                                        {log.prompt && (
                                            <div className="mb-md">
                                                <h4 className="font-bold text-accent-indigo dark:text-accent-indigo-dark text-xs mb-2xs uppercase">Prompt</h4>
                                                <div className="bg-background dark:bg-background-dark p-sm rounded-md text-xs text-text-primary dark:text-text-primary-dark whitespace-pre-wrap font-mono max-h-48 overflow-y-auto border border-border dark:border-border-dark">
                                                    {log.prompt}
                                                </div>
                                            </div>
                                        )}
                                        {log.output && (
                                            <div className="mb-md">
                                                <h4 className="font-bold text-accent-indigo dark:text-accent-indigo-dark text-xs mb-2xs uppercase">Output</h4>
                                                <div className="bg-background dark:bg-background-dark p-sm rounded-md max-h-72 overflow-y-auto border border-border dark:border-border-dark">
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
        </div>
    );
};

export default React.memo(AuditInspector);
