
import { AgentName, AuditLogEntry, AuditLogEntryType } from '../types';

export class AuditLogger {
  private logUpdater: (entry: AuditLogEntry) => void;

  constructor(logUpdater: (entry: AuditLogEntry) => void) {
    this.logUpdater = logUpdater;
  }

  private log(
    agentName: AgentName | 'Orchestrator',
    type: AuditLogEntryType,
    message: string,
    details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}
  ) {
    const entry: AuditLogEntry = {
      timestamp: Date.now(),
      agentName,
      type,
      message,
      ...details,
    };
    this.logUpdater(entry);
  }

  info(agentName: AgentName | 'Orchestrator', message: string) {
    this.log(agentName, 'info', message);
  }
  
  start(agentName: AgentName, message: string, provider: string) {
    this.log(agentName, 'start', message, { provider });
  }

  chunk(agentName: AgentName, message: string) {
    // For performance, we don't log every chunk to the main audit log UI,
    // but this hook is available for more detailed debugging if needed.
    // console.log(`[CHUNK: ${agentName}]: ${message}`);
  }

  end(agentName: AgentName, message: string, tokenCount?: number) {
    this.log(agentName, 'end', message, { tokenCount });
  }

  error(agentName: AgentName | 'Orchestrator', message: string) {
    this.log(agentName, 'error', message);
  }
}
