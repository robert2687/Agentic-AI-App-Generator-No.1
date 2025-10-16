# Development Guide

This guide will help you set up your development environment and start contributing to the Agentic AI App Generator.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v8 or higher (comes with Node.js)
- **Git**: For version control
- **Google Gemini API Key**: Required for AI agent functionality

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/robert2687/Agentic-AI-App-Generator-No.1.git
cd Agentic-AI-App-Generator-No.1
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 19 and React DOM
- TypeScript
- Vite
- Google Gemini AI SDK
- Supabase client
- Other utilities

### 3. Set Up Environment Variables

1. Copy the template file:
   ```bash
   cp .env.local.template .env.local
   ```

2. Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (Vite's default port).

**Note:** The README mentions port 3000, but Vite actually runs on port 5173 by default.

## Development Workflow

### Building the Application

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Code Quality

The project uses pre-commit hooks to maintain code quality. Before committing, ensure:

1. **YAML/JSON files are valid**
2. **Files end with a newline**
3. **No trailing whitespace**
4. **ESLint checks pass** (for .js, .jsx, .ts, .tsx files)
5. **Stylelint checks pass** (for .css files)
6. **Design tokens are valid**

## Project Structure

```
/
├── components/           # React components
│   ├── AgentCard.tsx    # Individual agent display
│   ├── Header.tsx       # App header
│   ├── PreviewModal.tsx # Code preview modal
│   └── ...
├── services/            # Business logic and API services
│   ├── orchestrator/    # Agent orchestration logic
│   ├── geminiClient.ts  # Gemini API client
│   └── ...
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
├── hoc/                 # Higher-order components
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── constants.ts        # App constants and agent configurations
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration
```

## Key Concepts

### Multi-Agent System

The application uses 7 specialized AI agents that work sequentially:

1. **Planner**: Defines requirements and design system
2. **Architect**: Designs system architecture
3. **UX/UI Designer**: Creates visual design and CSS
4. **Coder**: Implements the application
5. **Reviewer**: Audits code quality and accessibility
6. **Patcher**: Applies fixes and improvements
7. **Deployer**: Provides deployment instructions

### Orchestrator

The `Orchestrator` service (in `/services/orchestrator/`) coordinates agent execution:
- Manages agent state and transitions
- Handles agent communication
- Processes errors and recovery
- Logs audit trail

### Agent Configuration

Agents are configured in `constants.ts` with their roles and responsibilities. Each agent:
- Has a unique ID and name
- Has a defined role/prompt
- Tracks status (pending, running, completed, error)
- Stores input and output

## Development Best Practices

### TypeScript

- Always use proper types, avoid `any`
- Use `import type` for type-only imports
- Define interfaces for component props
- Target ES2022 features

### React

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-responsibility
- Follow existing component patterns

### Accessibility

All changes must maintain WCAG AA accessibility standards:
- Keyboard navigation support
- Proper semantic HTML
- ARIA labels for icon buttons
- Form labels with `for` attributes
- Adequate color contrast

### Code Style

- Use descriptive variable names
- Add JSDoc comments for complex functions
- Follow the existing code structure
- Remove debug statements before committing

## Testing

Currently, the project does not have automated tests. When adding tests:
- Place test files alongside the code they test
- Use `.test.ts` or `.test.tsx` extensions
- Follow existing patterns in the repository

## Debugging

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Ensure `.env.local` exists with a valid API key
   - Restart the dev server after adding the key

2. **Build warnings about chunk size**
   - This is expected due to the large bundle size
   - Consider code-splitting if needed

3. **Port already in use**
   - Vite will automatically use the next available port
   - Or stop the conflicting process

### Using Browser DevTools

- React DevTools: Install the browser extension for debugging React components
- Network tab: Monitor API calls to Gemini
- Console: Check for runtime errors and agent logs

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Checklist Before Submitting

- [ ] Code builds successfully
- [ ] Pre-commit hooks pass
- [ ] Accessibility requirements met
- [ ] Documentation updated
- [ ] Self-reviewed code
- [ ] No commented-out code or console.logs

## Architecture Notes

### State Management

- Global state managed through React Context (`/contexts/`)
- Local component state using `useState`
- Agent state synchronized via Orchestrator callbacks

### API Integration

- Gemini API calls in `/services/geminiClient.ts`
- Environment variables accessed via Vite's `import.meta.env`
- Error handling with retry logic

### Styling

- TailwindCSS via CDN (in index.html)
- Custom design tokens in `design-tokens.json`
- Component-specific styles in component files
- Responsive design with mobile-first approach

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## Need Help?

If you encounter issues:
1. Check existing issues on GitHub
2. Review this documentation
3. Create a new issue with details about your problem
4. Include error messages and steps to reproduce

## License

This project is maintained as a fork of the original Agentic AI App Generator.
