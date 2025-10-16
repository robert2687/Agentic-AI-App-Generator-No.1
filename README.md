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

```bash
npm run build
npm run preview
```

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Styling**: Modern CSS with responsive design
