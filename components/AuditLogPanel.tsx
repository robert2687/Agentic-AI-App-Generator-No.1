
import React from 'react';
import type { AuditLogEntry } from '../types';
import AgentIcon from './icons/AgentIcon';
import CheckIcon from './icons/CheckIcon';
import ErrorIcon from './icons/ErrorIcon';
import LogIcon from './icons/LogIcon';
import SpinnerIcon from './icons/SpinnerIcon';

const LogIconForType: React.FC<{ type: AuditLogEntry['type'], className?: string }> = ({ type, className="w-4 h-4" }) => {
    switch (type) {
        case 'start':
            return <SpinnerIcon className={`${className} animate-spin`} />;
        case 'end':
            return <CheckIcon className={className} />;
        case 'error':
            return <ErrorIcon className={className} />;
        case 'info':
        default:
            return <LogIcon className={className} />;
    }
}

const typeStyles: Record<AuditLogEntry['type'], string> = {
    start: 'text-sky-400',
    end: 'text-green-400',
    error: 'text-red-400',
    info: 'text-slate-400',
    chunk: 'text-slate-500',
}

const AuditLogPanel: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div ref={scrollRef} className="h-full bg-slate-950 p-4 overflow-y-auto font-mono text-xs">
            {logs.length === 0 && <div className="text-slate-500">Logs will appear here...</div>}
            <ul className="space-y-3">
                {logs.map((log, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="text-slate-600 flex-shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <div className={`flex-shrink-0 pt-0.5 ${typeStyles[log.type]}`}>
                            <LogIconForType type={log.type} />
                        </div>
                        <div className="flex-grow">
                            <span className={`font-bold mr-2 ${log.agentName === 'Orchestrator' ? 'text-indigo-400' : 'text-slate-300'}`}>
                                {log.agentName}
                            </span>
                            <span className="text-slate-400 whitespace-pre-wrap">{log.message}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default React.memo(AuditLogPanel);
