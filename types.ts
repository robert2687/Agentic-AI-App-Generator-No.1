
export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type AgentName = 'Planner' | 'Architect' | 'Visual Designer' | 'Coder' | 'Reviewer' | 'Patcher' | 'Deployer';

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