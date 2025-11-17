# Quick Start Guide

This guide will help you get the Agentic AI App Generator up and running in minutes.

## Prerequisites

- Node.js v18 or higher
- npm package manager
- A Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including React 19, TypeScript, Vite, and the Google Gemini SDK.

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.template .env.local
```

Then edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env.local` file to version control. It's already in `.gitignore`.

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Using the App

1. **Enter Your Project Goal**: In the text area, describe the application you want to generate (e.g., "Create a todo list app with local storage")

2. **Click Generate**: The AI agents will start working sequentially:
   - **Planner**: Defines requirements and features
   - **Architect**: Designs system architecture
   - **UX/UI Designer**: Creates visual design and assets
   - **Coder**: Implements the application
   - **Reviewer**: Audits for quality and accessibility
   - **Patcher**: Applies fixes and improvements

3. **Preview Your App**: Once complete, click the "Preview" button to see your generated application

4. **Refine**: Use the refinement prompt to request changes or improvements

5. **Deploy**: Click "Deploy" for step-by-step deployment instructions

## Features Overview

### Multi-Agent System
- Seven specialized AI agents work together
- Each agent has a specific role and expertise
- Real-time progress tracking

### Generated Applications
- Complete, self-contained HTML files
- Responsive design
- Accessibility features built-in
- PWA capabilities for app store deployment

### Image Generation
- Automatic logo and favicon generation
- Falls back to SVG placeholders if API unavailable
- Supports multiple image providers (Gemini Imagen, Stability AI, Placeholder)

## Troubleshooting

### API Key Issues

If you see warnings about missing API key:
- Verify your `.env.local` file exists and has the correct variable name
- Make sure there are no quotes around the key in the `.env.local` file
- Restart the dev server after adding/changing the API key

### Build Errors

If you encounter build errors:
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If port 3000 is already in use:
- Stop the process using port 3000, or
- Edit `vite.config.ts` to use a different port

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run verify-setup` - Check your setup configuration

## Next Steps

- Read the full [README.md](README.md) for more details
- Check [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
- Review the [architecture documentation](docs/architecture.md)
- See [Android build guide](docs/ANDROID_BUILD_GUIDE.md) for mobile app deployment

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review the audit log panel in the app
3. Make sure all dependencies are installed correctly
4. Verify your API key is valid and has the necessary permissions

## Notes

- The app works offline in "mock mode" if no API key is provided (for development/testing)
- Large bundle size warning during build is expected due to AI SDK dependencies
- First generation may take 30-60 seconds depending on complexity
