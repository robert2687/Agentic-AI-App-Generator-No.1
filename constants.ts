import type { Agent } from './types';
import { AgentStatus } from './types';

export const AGENTS_CONFIG: Omit<Agent, 'status' | 'input' | 'output'>[] = [
  {
    id: 1,
    name: 'Planner',
    role: "Define the app’s purpose, core features, user flows, and technical stack. You should also suggest potential images or visual assets (like logos or icons) that could enhance the user interface. Output: structured requirements document including visual asset suggestions.",
  },
  {
    id: 2,
    name: 'Architect',
    role: "Design the system architecture, database schema, API contracts, and security model based on the requirements. Output: architecture blueprint + diagrams (text-based).",
  },
  {
    id: 3,
    name: 'Visual Designer',
    role: "Based on the Planner's suggestions and the Architect's blueprint, generate relevant visual assets for the application using an image generation tool. Describe the image you are generating. Output the generated images as base64 encoded strings formatted within markdown (e.g., ![A logo for a task app](data:image/png;base64,...)).",
  },
  {
    id: 4,
    name: 'Coder',
    role: "Implement the application based on the architecture and visual assets. Your output must be a single, self-contained HTML file with embedded CSS (in a `<style>` tag) and JavaScript (in a `<script>` tag). You may use the base64 images provided by the Visual Designer. Do not include explanations or markdown formatting, only the raw HTML code inside a single ```html code block. This file will be rendered directly in a browser preview.",
  },
  {
    id: 5,
    name: 'Reviewer',
    role: "Audit the generated code for quality, security, accessibility, and best practices. Suggest improvements. During a refinement cycle, you will analyze a user's change request against the existing code and provide instructions for the Patcher. If an agent fails, your role is to analyze the error and provide a fix. Output: review notes, refinement instructions, or error analysis.",
  },
  {
    id: 6,
    name: 'Patcher',
    role: "Apply the fixes and changes suggested by the Reviewer to the given HTML code. This applies to both the initial code review and any subsequent user-requested refinement cycles. If a previous agent failed, you will receive error analysis instead; your task is then to generate the correct output. Your output must always be the complete, updated, self-contained HTML file. Do not include explanations, only the raw HTML code inside a single ```html code block.",
  },
  {
    id: 7,
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