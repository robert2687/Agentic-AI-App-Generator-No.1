
export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type AgentName = 'Planner' | 'Architect' | 'Coder' | 'Reviewer' | 'Patcher' | 'Deployer';

export interface Agent {
  id: number;
  name: AgentName;
  role: string;
  status: AgentStatus;
  input: string | null;
  output: string | null;
}
