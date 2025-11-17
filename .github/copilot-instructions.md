---
# Global instructions for the entire repository
# These instructions apply to all files unless overridden by more specific instructions
applies_to:
  - "**/*"
---

# Copilot Instructions for Agentic AI App Generator

## Project Overview
This is an AI-powered app generator featuring a multi-agent system that collaborates to generate complete, production-ready applications. The application uses React 19, TypeScript, Vite, and Google Gemini AI.

## Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Backend**: Supabase (`@supabase/supabase-js`)
- **Styling**: Modern CSS with responsive design
- **Dev Server**: Vite dev server on port 3000

## Development Environment Setup

### Prerequisites
- Node.js v18 or higher
- npm package manager

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` file in the root directory with:
```
GEMINI_API_KEY=your_api_key_here
```

### Running the Application
- Development: `npm run dev` (runs on http://localhost:3000)
- Build: `npm run build`
- Preview: `npm run preview`

## Project Structure

### File Organization
- `/components/` - React components
  - All UI components including Agent cards, modals, panels
  - Use `.tsx` extension for TypeScript React components
- `/services/` - Business logic and API services
  - Agent services, API clients, orchestration logic
- `/hooks/` - Custom React hooks
  - `usePremiumStatus.ts`, `useTheme.ts`
- `/contexts/` - React context providers
  - Authentication and state management
- `/hoc/` - Higher-order components
  - Premium gating and feature flags
- `/types.ts` - TypeScript type definitions
- `/constants.ts` - Application constants
- `App.tsx` - Main application component

### Import Path Aliases
The project uses `@/` as an alias for the root directory:
```typescript
import { Agent } from '@/types';
import Header from '@/components/Header';
```

## Coding Standards

### TypeScript
- Always use TypeScript for new files (`.ts` or `.tsx`)
- Define proper types/interfaces, avoid `any`
- Use type imports with `import type` when only importing types
- Target: ES2022, using modern JavaScript features

### React Patterns
- Use functional components with hooks
- Prefer `React.FC` for component types
- Use `useState`, `useCallback`, `useRef`, `useEffect` appropriately
- Extract reusable logic into custom hooks
- Follow the existing component structure patterns

### Component Guidelines
- Place each component in its own file
- Use descriptive component and file names (PascalCase)
- Export components as default exports
- Keep components focused and single-responsibility

### State Management
- Use React Context for global state (see `/contexts/`)
- Use local state for component-specific data
- Implement proper state lifting when needed

### Naming Conventions
- Components: PascalCase (e.g., `AgentCard`, `PreviewModal`)
- Files: Match component name (e.g., `AgentCard.tsx`)
- Variables/functions: camelCase (e.g., `handleAgentUpdate`, `isGenerating`)
- Constants: UPPER_SNAKE_CASE (e.g., `INITIAL_AGENTS`)
- Types/Interfaces: PascalCase (e.g., `Agent`, `AgentName`)

## Accessibility (A11y) Requirements

All code changes must maintain accessibility standards:
- All interactive elements must be keyboard-navigable
- Images must have appropriate `alt` text
- Forms must use semantic HTML with `<label>` elements and `for` attributes
- Interactive elements without visible text (icon buttons) need descriptive `aria-label` attributes
- Color contrast must meet WCAG AA standards
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)

## Testing and Quality

### Pre-commit Hooks
The project uses pre-commit hooks configured in `.pre-commit-config.yaml`:
- YAML and JSON validation
- End-of-file fixer
- Trailing whitespace removal
- ESLint for JavaScript/TypeScript files
- Stylelint for CSS files
- Design tokens validation

### Code Quality Checks
- Ensure all linting checks pass
- Build must complete successfully
- Remove console.log statements and commented-out code
- Follow the project's coding style and conventions
- Make code modular and easy to understand

### Testing
- Add or update tests when adding new functionality
- Ensure all tests pass locally before submitting changes
- Follow existing test patterns in the repository

## API and Services

### Gemini AI Integration
- API client located in `/services/geminiClient.ts`
- API key accessed via environment variable
- Handle API errors gracefully

### Agent System
- Agents defined in `/constants.ts` as `INITIAL_AGENTS`
- Agent orchestration in `/services/orchestrator`
- Agent types defined in `/types.ts`
- Each agent has specific roles: Planning, UI/UX Design, Frontend Dev, Backend Dev, Testing, Deployment

### Supabase Integration
- Authentication and data storage
- Client setup in services directory
- Handle authentication state properly

## Common Patterns

### Modal Components
- Use consistent modal patterns (see `PreviewModal`, `DeploymentModal`, `AuthModal`)
- Include proper close handlers and escape key support
- Maintain focus management for accessibility

### Premium Features
- Use `withPremiumGate` HOC for gating premium features
- Check premium status with `usePremiumStatus` hook
- Display appropriate paywall when needed

### Logging and Debugging
- Use the logger service from `/services/loggerInstance`
- Maintain audit log entries for agent activities
- Structure logs consistently

## Documentation

### Code Documentation
- Add JSDoc comments for complex functions and components
- Document component props using JSDoc
- Include inline comments for complex logic
- Keep documentation up-to-date with changes

### README Updates
- Update README.md if changes affect setup or usage
- Document new features or configuration options
- Keep installation and usage instructions current

## Build Configuration

### Vite Configuration
- Configuration in `vite.config.ts`
- Server runs on port 3000
- Environment variables passed through Vite's define
- Uses `@vitejs/plugin-react`

### TypeScript Configuration
- Configuration in `tsconfig.json`
- Target: ES2022
- JSX: react-jsx
- Path aliases configured for `@/`

## Contributing Guidelines

Before submitting changes:
1. Test for accessibility compliance
2. Add or update tests
3. Ensure CI checks pass (linting, build, tests)
4. Update documentation
5. Perform self-review
6. Remove debug code and comments

Refer to `CONTRIBUTING.md` for the complete contributor checklist.

## Best Practices for AI-Generated Code

When working with this codebase:
- Maintain consistency with existing patterns
- Preserve the multi-agent architecture design
- Keep components modular and reusable
- Ensure responsive design for mobile and desktop
- Handle loading and error states appropriately
- Implement proper TypeScript types
- Follow React best practices and hooks rules
- Consider performance implications (large bundle size noted in build)

## Resources and Documentation

### Official Documentation
- [React 19 Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Project Documentation
- `README.md` - Setup and usage instructions
- `CONTRIBUTING.md` - Contribution guidelines and checklist
- `docs/architecture.md` - System architecture and design
- `.github/ISSUE_TEMPLATE/` - Issue templates
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template

### Development Resources
- Environment variables: Use `.env.local` (see `.env.local.template`)
- Pre-commit hooks: Configured in `.pre-commit-config.yaml`
- Design tokens: `design-tokens.json`
- Type definitions: `types.ts`
- Application constants: `constants.ts`

### External Links
- [AI Studio App](https://ai.studio/apps/drive/13z9RgvMFPcqGZ70huEXfVkUS8keVjKMS) - View the app in AI Studio
