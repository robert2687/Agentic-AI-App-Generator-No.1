import type { Agent } from './types';
import { AgentStatus } from './types';

export const AGENTS_CONFIG: Omit<Agent, 'status' | 'input' | 'output'>[] = [
  {
    id: 1,
    name: 'Planner',
    role: "Define the app’s purpose, core features, user flows, and technical stack. Output: structured requirements document.",
  },
  {
    id: 2,
    name: 'Architect',
    role: "Design the system architecture, database schema, API contracts, and security model based on the requirements. Output: architecture blueprint + diagrams (text-based).",
  },
  {
    id: 3,
    name: 'Coder',
    role: "Implement the application based on the architecture. Your output must be a single, self-contained HTML file with embedded CSS (in a `<style>` tag) and JavaScript (in a `<script>` tag). Do not include explanations or markdown formatting, only the raw HTML code inside a single ```html code block. This file will be rendered directly in a browser preview.",
  },
  {
    id: 4,
    name: 'Reviewer',
    role: "Audit the generated code for quality, security, accessibility, and best practices. Suggest improvements. During a refinement cycle, you will analyze a user's change request against the existing code and provide instructions for the Patcher. If an agent fails, your role is to analyze the error and provide a fix. Output: review notes, refinement instructions, or error analysis.",
  },
  {
    id: 5,
    name: 'Patcher',
    role: "Apply the fixes and changes suggested by the Reviewer to the given HTML code. This applies to both the initial code review and any subsequent user-requested refinement cycles. If a previous agent failed, you will receive error analysis instead; your task is then to generate the correct output. Your output must always be the complete, updated, self-contained HTML file. Do not include explanations, only the raw HTML code inside a single ```html code block.",
  },
  {
    id: 6,
    name: 'Deployer',
    role: "The Patcher agent has produced a final, self-contained HTML file. Provide deployment instructions for this file (e.g., using a static web host like Firebase Hosting, Netlify, or Vercel). Output: step-by-step deployment guide.",
  },
];

export const INITIAL_AGENTS: Agent[] = AGENTS_CONFIG.map(config => ({
  ...config,
  status: AgentStatus.PENDING,
  input: null,
  output: null,
}));