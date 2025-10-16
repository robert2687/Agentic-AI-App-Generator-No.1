import { AgentName, AuditLogEntry, AuditLogEntryType } from '../types.js';

export class AuditLogger extends EventTarget {
  private logs: AuditLogEntry[] = [];

  constructor() {
    super();
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
    this.dispatchEvent(new CustomEvent('log', { detail: entry }));
  }

  info(agentName: AgentName | 'Orchestrator', message: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'info', message, details);
  }
  
  start(agentName: AgentName, message: string, provider: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'start', message, { provider, ...details });
  }

  chunk(agentName: AgentName, message:string) {
    // For performance, we don't dispatch events for every chunk,
    // as it could flood the React state updates. This hook is available
    // for more detailed debugging if needed via console logs.
    // console.log(`[CHUNK: ${agentName}]: ${message}`);
  }

  end(agentName: AgentName, message: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'end', message, details);
  }

  error(agentName: AgentName | 'Orchestrator', message: string, details: Partial<Omit<AuditLogEntry, 'timestamp' | 'agentName' | 'type' | 'message'>> = {}) {
    this.log(agentName, 'error', message, details);
  }

  /**
   * Returns a copy of all recorded log entries.
   * @returns An array of AuditLogEntry objects.
   */
  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
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
