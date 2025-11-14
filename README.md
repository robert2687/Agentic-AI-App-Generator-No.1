<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agentic AI App Generator (Fork)

This is a fork/duplicate of the Agentic AI App Generator - a web application that simulates a team of specialized AI agents collaborating to generate complete, production-ready applications based on user prompts.

## About This Application

This contains everything you need to run your AI-powered app generator locally. The application features multiple AI agents working sequentially from planning to deployment.

View your app in AI Studio: https://ai.studio/apps/drive/13z9RgvMFPcqGZ70huEXfVkUS8keVjKMS

## Features

🤖 **Multi-Agent Collaboration**: Specialized AI agents work together sequentially
🎯 **Complete App Generation**: From planning to deployment based on user prompts  
⚡ **Modern Tech Stack**: React 19, TypeScript, Vite, Google Gemini AI
🎨 **Interactive UI**: Real-time agent status and live preview capabilities
📱 **Single-File Output**: Generates complete HTML applications
🔄 **Live Preview**: See generated applications in real-time

## Run Locally

**Prerequisites:**  Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

The build process compiles both the Vite application and any Node.js scripts.

Available npm scripts:

- `npm run build` — builds both the app and scripts (runs `build:app` and `build:scripts`)
- `npm run build:app` — builds only the Vite application
- `npm run build:scripts` — compiles only Node.js scripts
- `npm run preview` — preview production build

Example:

```bash
npm run build
npm run preview
```

### Build Output

- `dist/` — production application assets
- `dist/scripts/` — compiled Node.js scripts for CI/CD
- `dist/services/` — compiled service modules

Ensure your package.json defines the scripts, for example:

```json
"scripts": {
  "build": "npm run build:app && npm run build:scripts",
  "build:app": "vite build",
  "build:scripts": "tsc -p scripts || node scripts/build.js",
  "preview": "vite preview"
}
```

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Styling**: Modern CSS with responsive design
