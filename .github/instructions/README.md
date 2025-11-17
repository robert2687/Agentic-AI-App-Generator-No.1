# Copilot Instructions Overview

This directory contains targeted instructions for GitHub Copilot to provide better, context-aware code suggestions for different parts of the codebase.

## Structure

### Global Instructions
- **[../.github/copilot-instructions.md](../copilot-instructions.md)** - Main instructions that apply to the entire repository

### Targeted Instructions
Files in this directory provide specialized guidance for specific file patterns:

- **[components.instructions.md](components.instructions.md)** - React component development guidelines
  - Applies to: `components/**/*.tsx`, `components/**/*.ts`
  - Covers: Component patterns, accessibility, state management, performance

- **[services.instructions.md](services.instructions.md)** - Backend services and API integration
  - Applies to: `services/**/*.ts`, `services/**/*.tsx`
  - Covers: Gemini API, Supabase, agent orchestration, error handling

- **[testing.instructions.md](testing.instructions.md)** - Testing patterns and best practices
  - Applies to: `tests/**/*`, `**/*.test.ts`, `**/*.spec.ts`
  - Covers: Test structure, patterns, and current testing approach

- **[documentation.instructions.md](documentation.instructions.md)** - Documentation writing guidelines
  - Applies to: `**/*.md`, `docs/**/*`
  - Covers: Documentation style, code examples, accessibility

## Custom Agents

The repository also includes specialized custom agents in [../.github/agents/](../agents/):

- **react-typescript-expert.agent.md** - Expert in React 19 and TypeScript development
- **ai-backend-expert.agent.md** - Expert in AI integration and backend services

## How It Works

GitHub Copilot uses these instructions to:
1. Understand the project structure and conventions
2. Provide context-aware suggestions based on file location
3. Apply best practices specific to each area of the codebase
4. Route complex tasks to specialized custom agents

## Contributing

When adding new areas of functionality:
1. Consider creating a new `.instructions.md` file for that area
2. Use YAML frontmatter with `applies_to` patterns to target specific files
3. Keep instructions clear, actionable, and focused
4. Update this README to document the new instructions

## Best Practices

These instructions follow GitHub's best practices for Copilot coding agent:
- ✅ Well-organized with clear structure
- ✅ Uses YAML frontmatter for fine-grained targeting
- ✅ Includes custom agents for specialized tasks
- ✅ Provides actionable, specific guidance
- ✅ Covers critical aspects: accessibility, testing, documentation, security
- ✅ Maintains consistency across the codebase

## Resources

- [GitHub Copilot Coding Agent Documentation](https://docs.github.com/en/copilot/tutorials/coding-agent)
- [Best Practices for Custom Instructions](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Custom Agent Configuration](https://gh.io/customagents/config)
