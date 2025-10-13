
import { AgentName, AuditLogEntry, AuditLogEntryType } from '../../../types';

export class AuditLogger {
  private logUpdater: (entry: AuditLogEntry) => void;
  private logs: AuditLogEntry[] = [];

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
    this.logs.push(entry);
    this.logUpdater(entry);
  }

  info(agentName: AgentName | 'Orchestrator', message: string) {
    this.log(agentName, 'info', message);
  }
  
  start(agentName: AgentName, message: string, provider: string) {
    this.log(agentName, 'start', message, { provider });
  }

  chunk(agentName: AgentName, message:string) {
    // For performance, we don't log every chunk to the main audit log UI,
    // but this hook is available for more detailed debugging if needed.
    // console.log(`[CHUNK: ${agentName}]: ${message}`);
  }

  end(agentName: AgentName, message: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'end', message, details);
  }

  error(agentName: AgentName | 'Orchestrator', message: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'error', message, details);
  }

  /**
   * Returns all recorded log entries as a JSON string, formatted for readability.
   * This is intended for use in CI/CD pipelines to create build artifacts.
   * @returns A string containing the JSON representation of the audit log.
   */
  public exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clears all logs from the logger's internal storage. This should be
   * called at the beginning of a new, independent workflow run.
   */
  public clear(): void {
    this.logs = [];
  }
}
