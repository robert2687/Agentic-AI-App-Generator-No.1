---
# Instructions specific to backend services and API integration
applies_to:
  - "services/**/*.ts"
  - "services/**/*.tsx"
---

# Services and API Development Instructions

## Service-Specific Guidelines

When working with services in this repository:

### File Organization
- Keep business logic separate from UI components
- One service per file
- Use descriptive names (e.g., `geminiClient.ts`, `auditLogger.ts`)
- Group related services in subdirectories (e.g., `/services/orchestrator/`)

### Service Pattern
```typescript
import { logger } from '@/services/loggerInstance';

export class MyService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async performAction(params: ActionParams): Promise<ActionResult> {
    try {
      // Service logic here
      logger.info('Action performed successfully');
      return result;
    } catch (error) {
      logger.error('Action failed', error);
      throw error;
    }
  }
}
```

### Error Handling
- Always wrap API calls in try-catch blocks
- Log errors using the logger service
- Throw meaningful error messages
- Handle network failures gracefully
- Implement retry logic for transient failures

### Google Gemini AI Integration
When working with Gemini API:
- Use the client from `/services/geminiClient.ts`
- Access API key via `import.meta.env.GEMINI_API_KEY`
- Handle rate limiting and quota errors
- Implement proper timeout handling
- Stream responses when appropriate
- Include safety settings in API calls

Example:
```typescript
import { genAI } from '@/services/geminiClient';

async function generateWithGemini(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error('Gemini API error', error);
    throw new Error('Failed to generate content');
  }
}
```

### Supabase Integration
When working with Supabase:
- Use the client from `/services/supabaseClient.ts`
- Handle authentication state properly
- Use proper TypeScript types for database queries
- Implement proper error handling for auth errors (see `/services/authErrors.ts`)
- Clean up subscriptions when components unmount

Example:
```typescript
import { supabase } from '@/services/supabaseClient';

async function fetchData() {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) {
    logger.error('Database error', error);
    throw error;
  }
  
  return data;
}
```

### Agent Orchestration
When working with agent orchestration:
- Services are in `/services/orchestrator/`
- Each agent has a specific role (Planning, UI/UX, Frontend, Backend, Testing, Deployment)
- Maintain audit logs for all agent activities
- Implement proper state management across agents
- Handle agent failures with recovery mechanisms

### Logging
Always use the logger service:
```typescript
import { logger } from '@/services/loggerInstance';

logger.info('Operation started');
logger.warn('Warning message');
logger.error('Error occurred', error);
```

### Environment Variables
- Access via `import.meta.env` (Vite-specific)
- Never commit API keys or secrets
- Use `.env.local` for local development
- Document required environment variables in `.env.local.template`

### TypeScript
- Define proper types for API responses
- Use interfaces for service contracts
- Avoid `any` type
- Export types that might be used by components

### Async Patterns
- Use async/await over promises
- Handle promise rejections
- Implement proper loading states
- Use Promise.all for parallel operations when safe

## Testing Services
- Mock external API calls in tests
- Test error handling paths
- Verify logging is called appropriately
- Test retry logic and timeouts

## Common Pitfalls to Avoid
- Don't expose API keys in client-side code
- Don't forget to handle loading and error states
- Don't make API calls without error handling
- Don't forget to clean up listeners and subscriptions
- Don't use synchronous operations for I/O
- Don't log sensitive information (passwords, tokens)
