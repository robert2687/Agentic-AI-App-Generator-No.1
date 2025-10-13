
export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type AgentName =
  | 'Planner'
  | 'Architect'
  | 'UX/UI Designer'
  | 'Coder'
  | 'Reviewer'
  | 'Patcher'
  | 'Deployer';

export interface Agent {
  id: number;
  name: AgentName;
  role: string;
  status: AgentStatus;
  input: string | null;
  output: string | null;
  startedAt?: number;
  completedAt?: number;
}

export type AuditLogEntryType = 'start' | 'chunk' | 'end' | 'error' | 'info';

export interface AuditLogEntry {
  timestamp: number;
  agentName: AgentName | 'Orchestrator';
  type: AuditLogEntryType;
  message: string;
  provider?: string;
  tokenCount?: number;
  prompt?: string;
  output?: string;
  valid?: boolean;
  retries?: number;
  validationError?: string;
}