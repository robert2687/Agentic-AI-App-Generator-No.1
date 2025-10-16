# Quick Start Guide

Get up and running with the Agentic AI App Generator in 5 minutes.

## Prerequisites

- Node.js v18+ installed ([Download here](https://nodejs.org/))
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.local.template .env.local

# Edit .env.local and replace 'your_gemini_api_key_here' with your actual API key
```

On macOS/Linux:
```bash
sed -i 's/your_gemini_api_key_here/YOUR_ACTUAL_KEY/' .env.local
```

On Windows (PowerShell):
```powershell
(Get-Content .env.local) -replace 'your_gemini_api_key_here', 'YOUR_ACTUAL_KEY' | Set-Content .env.local
```

### 3. Verify Setup

```bash
npm run verify-setup
```

This will check that everything is configured correctly.

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## First Use

1. **Enter a prompt** in the text area, for example:
   - "Create a todo list app with dark mode"
   - "Build a weather dashboard"
   - "Make a recipe finder with search"

2. **Click "Generate App"** and watch the AI agents work:
   - Planner defines requirements
   - Architect designs the system
   - UX/UI Designer creates the visual design
   - Coder implements the application
   - Reviewer audits the code
   - Patcher applies improvements
   - Deployer provides deployment instructions

3. **Preview your app** by clicking the "Preview" button when generation is complete

4. **Refine your app** by entering additional instructions and clicking "Refine"

5. **Deploy your app** by following the instructions from the Deployer agent

## What You Can Build

The generator creates single-file HTML applications that include:
- Complete HTML structure
- Embedded CSS styling with design system
- JavaScript functionality
- Progressive Web App (PWA) features
- Service worker for offline support
- Responsive design
- Accessibility features

## Common Issues

### "GEMINI_API_KEY not found"
- Make sure `.env.local` exists and contains your API key
- Restart the dev server after creating/editing `.env.local`

### Build Warnings
- Large chunk size warnings are normal
- The app will still work correctly

### Port Already in Use
- Vite will automatically use the next available port
- Check the terminal output for the actual port

## Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Explore the codebase starting with `App.tsx` and `constants.ts`

## Example Prompts to Try

Here are some example prompts to get you started:

### Simple Apps
- "Create a calculator app with a modern design"
- "Build a note-taking app with local storage"
- "Make a countdown timer with customizable settings"

### Medium Complexity
- "Create a budget tracker with expense categories"
- "Build a habit tracker with daily check-ins"
- "Make a markdown editor with live preview"

### Advanced
- "Create a recipe organizer with search and filters"
- "Build a workout tracker with progress charts"
- "Make a personal dashboard with widgets"

## Architecture Overview

```
User Input → Orchestrator → Agents (sequential execution)
                           ↓
                    1. Planner (requirements)
                           ↓
                    2. Architect (design)
                           ↓
                    3. UX/UI Designer (styling)
                           ↓
                    4. Coder (implementation)
                           ↓
                    5. Reviewer (quality check)
                           ↓
                    6. Patcher (improvements)
                           ↓
                    7. Deployer (instructions)
                           ↓
                    Final HTML Output
```

## Support

- **Issues**: [GitHub Issues](https://github.com/robert2687/Agentic-AI-App-Generator-No.1/issues)
- **Documentation**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **AI Studio**: https://ai.studio/apps/drive/13z9RgvMFPcqGZ70huEXfVkUS8keVjKMS

## Tips for Best Results

1. **Be specific** in your prompts - include desired features, style preferences, and functionality
2. **Start simple** - complex apps may take longer and use more API tokens
3. **Use refinement** - after initial generation, you can refine the app with additional instructions
4. **Check the audit log** - see what each agent is doing in real-time
5. **Preview frequently** - check the output as agents complete their work

Happy building! 🚀
