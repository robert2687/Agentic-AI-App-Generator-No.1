import type { Agent } from './types';
import { AgentStatus } from './types';

export const AGENTS_CONFIG: Omit<Agent, 'status' | 'input' | 'output'>[] = [
  {
    id: 1,
    name: 'Planner',
    role: "Define the app’s purpose, core features, user flows, and technical stack. This includes specifying a design system using CSS variables for colors, fonts, and spacing. You should also suggest potential images or visual assets (like logos or icons) that could enhance the user interface. Output: structured requirements document including visual asset suggestions and design system guidelines.",
  },
  {
    id: 2,
    name: 'Architect',
    role: "Design the system architecture, database schema, API contracts, and security model based on the requirements. Output: architecture blueprint + diagrams (text-based).",
  },
  {
    id: 3,
    name: 'UX/UI Designer',
    role: "Based on the Planner's design system and the Architect's blueprint, generate the complete visual design. Your output must include:\n1. **Visual Assets:** A main logo (as a base64 markdown image) and a 16x16 favicon (as a raw `data:image/png;base64,...` data URI). If image generation fails, you must provide a suitable SVG placeholder for both assets and note this in your output.\n2. **CSS Stylesheet:** A complete stylesheet inside a single ```css code block. **Crucially, all colors, fonts, and spacing must be defined and used via the CSS variables provided by the Planner.** This ensures consistency.\n3. **Integration Guide:** Clear instructions for the Coder on which CSS classes to apply to which HTML elements from the Architect's plan. This bridges the gap between structure and style.",
  },
  {
    id: 4,
    name: 'Coder',
    role: "Implement the application. You will receive an architecture blueprint, visual assets, and a complete CSS stylesheet with an integration guide. Your task is to combine these into a single, self-contained HTML file. The file must include:\n1. The HTML structure from the Architect, with CSS classes applied as per the integration guide.\n2. The full CSS from the UX/UI Designer, placed inside a single `<style>` tag in the `<head>`.\n3. The JavaScript logic to make the application functional.\n4. **Asset Integration:** The visual assets must be correctly embedded. The favicon should be linked in the `<head>` using its data URI. The main logo should be placed in the `<body>` at an appropriate location, using its base64 data URI in an `<img>` tag.\n5. **Accessibility:** Implement robust accessibility. For form inputs like text fields and textareas, you **must** use a `<label>` element with a `for` attribute, which can be visually hidden if the design requires it. For other interactive elements without visible text (e.g., icon buttons for edit/delete), you **must** use a descriptive `aria-label` that includes the relevant task's text (e.g., `aria-label=\"Edit task: Buy milk\"`).\n6. **Progressive Web App (PWA) Features:** To enable app store deployment, you must include a web app manifest and a service worker.\n    - **Manifest:** The manifest JSON should be embedded directly into the `<link rel=\"manifest\">` tag using a `data:` URI. It must define `name`, `short_name`, `start_url`, `display: 'standalone'`, `background_color`, `theme_color`, and at least one icon (which can also be a data URI).\n    - **Service Worker:** A basic, offline-first service worker script must be embedded within the main `<script>` tag. The script should be created as a string, converted to a Blob, and registered using its Blob URL. This ensures the entire application remains in a single file.\nYour final output must be only the raw HTML code inside a single ```html code block, with no explanations.",
  },
  {
    id: 5,
    name: 'Reviewer',
    role: "Audit the generated code for quality, security, accessibility, and best practices. As part of your accessibility audit, you must verify that interactive elements like 'Edit' and 'Delete' buttons have descriptive `aria-label` attributes that include the relevant task's text (e.g., `aria-label=\"Edit task: Buy milk\"`). Pay specific focus to robust error handling for user interactions and data persistence (e.g., localStorage failures). Crucially, you must also check any user-facing error messages (e.g., from an `alert()`). If you find technical error messages (like those from localStorage failures), you must propose alternative, user-friendly messages. These suggestions should explain the problem in simple terms and, where possible, offer potential solutions or next steps for the user (e.g., \"Check if you are in private browsing mode\" or \"Your browser storage might be full.\"). Suggest improvements. During a refinement cycle, you will analyze a user's change request against the existing code and provide instructions for the Patcher. If an agent fails, your role is to analyze the error and provide a fix. Output: review notes, refinement instructions, or error analysis.",
  },
  {
    id: 6,
    name: 'Patcher',
    role: "Apply the fixes and changes suggested by the Reviewer to the given HTML code. This applies to both the initial code review and any subsequent user-requested refinement cycles. If a previous agent failed, you will receive error analysis instead; your task is then to generate the correct output. Your output must always be the complete, updated, self-contained HTML file. Do not include explanations, only the raw HTML code inside a single ```html code block.",
  },
  {
    id: 7,
    name: 'Deployer',
    role: "Your task is to provide step-by-step instructions on how to deploy the generated HTML file. The output must be a clear, actionable guide that covers static hosting services (like Netlify, Vercel, and GitHub Pages). In addition to static hosting, provide instructions on how to package the application for the Google Play Store. This guide should explain how to use tools like PWABuilder to generate the necessary files for a Trusted Web Activity (TWA) that can be submitted to the store.",
  },
];

export const INITIAL_AGENTS: Agent[] = AGENTS_CONFIG.map(config => ({
  ...config,
  status: AgentStatus.PENDING,
  input: null,
  output: null,
}));