
import { AGENTS_CONFIG } from '../../constants';
import type { Agent, AgentName } from '../../types';
import { AgentStatus } from '../../types';
import { activeImageProvider, activeImageProviderName, placeholderImageService } from '../imageProvider';
import { geminiProvider } from './providers/geminiProvider';
import { mockProvider } from './providers/mockProvider';
import type { Provider } from './types';
import { validateAgentOutput } from './validation';
import { AuditLogger } from './audit/auditLogger';

const extractCode = (markdown: string, lang: string = 'html'): string | null => {
  const regex = new RegExp("```" + lang + "\\n([\\s\\S]*?)```");
  const match = markdown.match(regex);
  if (match) return match[1].trim();
  // Fallback for cases where the language is not specified
  if (!lang) {
    const anyLangRegex = new RegExp("```(?:\\w*)\\n([\\s\\S]*?)```");
    const anyLangMatch = markdown.match(anyLangRegex);
    if (anyLangMatch) return anyLangMatch[1].trim();
  }
  return null;
};


interface OrchestratorCallbacks {
  onAgentUpdate: (agent: Agent) => void;
  onLogEntry: (entry: ReturnType<AuditLogger['info']>) => void;
  onFinalCode: (code: string) => void;
  onWorkflowComplete: () => void;
  onWorkflowError: (error: Error, failingAgent: Agent) => void;
}

export class Orchestrator {
  private agents: Agent[] = [];
  private provider: Provider;
  private logger: AuditLogger;
  private callbacks: OrchestratorCallbacks;

  constructor(callbacks: OrchestratorCallbacks) {
    this.callbacks = callbacks;
    this.logger = new AuditLogger(this.callbacks.onLogEntry as any);
    this.provider = process.env.API_KEY ? geminiProvider : mockProvider;
    this.logger.info('Orchestrator', `Initialized with provider: ${this.provider.name}`);
  }

  private updateAgentState(id: number, updates: Partial<Agent>) {
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      Object.assign(agent, updates);
      this.callbacks.onAgentUpdate(agent);
    }
  }

  private async executeAgent(agent: Agent, input: string): Promise<string> {
    this.updateAgentState(agent.id, { status: AgentStatus.RUNNING, input, output: '', startedAt: Date.now() });
    this.logger.start(agent.name, `Executing with provider ${this.provider.name}...`, this.provider.name);
    
    let fullOutput = "";
    try {
      fullOutput = await this.provider.call(input, (chunk) => {
        this.updateAgentState(agent.id, { output: (this.agents.find(a=>a.id === agent.id)?.output || '') + chunk });
        this.logger.chunk(agent.name, `Received chunk.`);
      });
      
      if (!validateAgentOutput(agent.name, fullOutput)) {
        throw new Error(`Agent output validation failed. The response may be incomplete or malformed.`);
      }

      this.updateAgentState(agent.id, { status: AgentStatus.COMPLETED, output: fullOutput, completedAt: Date.now() });
      this.logger.end(agent.name, `Execution finished.`, { prompt: input, output: fullOutput });
      return fullOutput;

    } catch (error: any) {
      this.logger.error(agent.name, `Execution failed: ${error.message}`, { prompt: input, output: error.message });
      throw error; // Re-throw to be caught by the run loop
    }
  }

  private async runWorkflow(initialPrompt: string, startingAgentName: AgentName) {
    const startIndex = this.agents.findIndex(a => a.name === startingAgentName);
    let currentInput = initialPrompt;

    for (let i = startIndex; i < this.agents.length; i++) {
      const agent = this.agents[i];
      if (agent.name === 'Deployer') continue; // Skip deployer in main flow
      
      try {
        currentInput = await this.executeAgent(agent, currentInput);

        if (agent.name === 'Coder' || agent.name === 'Patcher') {
          const code = extractCode(currentInput, 'html');
          if (code) {
            this.callbacks.onFinalCode(code);
          }
        }
      } catch (error: any) {
        this.callbacks.onWorkflowError(error, agent);
        return; // Halt workflow on error
      }
    }
    this.callbacks.onWorkflowComplete();
  }

  public async run(projectGoal: string) {
    this.logger.clear();
    this.agents = AGENTS_CONFIG.map(config => ({
      ...config,
      status: AgentStatus.PENDING,
      input: null,
      output: null,
    }));
    this.agents.forEach(agent => this.callbacks.onAgentUpdate(agent));
    this.logger.info('Orchestrator', `Starting new generation for goal: "${projectGoal}"`);

    const plannerPrompt = `**Project Goal:**\n${projectGoal}\n\n**Agent:** Planner\n**Task:**\n${AGENTS_CONFIG[0].role}`;
    await this.runWorkflow(plannerPrompt, 'Planner');
  }
  
  public async runRefinement(refinementPrompt: string, existingCode: string) {
    this.logger.info('Orchestrator', `Starting refinement cycle.`);
    const reviewerPrompt = `**Previous Code:**\n\`\`\`html\n${existingCode}\n\`\`\`\n\n**User's Refinement Request:**\n${refinementPrompt}\n\n**Agent:** Reviewer\n**Task:**\nAnalyze the user's request against the existing code and provide concise, actionable instructions for the Patcher agent.`;
    await this.runWorkflow(reviewerPrompt, 'Reviewer');
  }
  
  public async runDeployment(code: string) {
    const deployer = this.agents.find(a => a.name === 'Deployer');
    if (!deployer) return;

    this.logger.info('Deployer', 'Starting deployment instructions generation.');
    const prompt = `**Application Code:**\n\`\`\`html\n${code}\n\`\`\`\n\n**Agent:** Deployer\n**Task:**\n${deployer.role}`;
    await this.executeAgent(deployer, prompt);
  }

}
