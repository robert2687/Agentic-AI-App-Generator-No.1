---
# Instructions specific to testing
applies_to:
  - "tests/**/*.js"
  - "tests/**/*.ts"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing Instructions

## Testing Guidelines

When writing tests for this repository:

### Test Structure
- Place tests in the `/tests/` directory
- Use descriptive test names
- Follow the existing test patterns
- Keep tests simple and focused

### Current Test Pattern
The repository uses Node.js assert module for testing:

```javascript
import { strict as assert } from 'assert';
import { readFileSync } from 'fs';

// Test implementation
const data = JSON.parse(readFileSync('./file.json', 'utf-8'));

assert.strictEqual(data.property, 'expected', 'Test Failed: description');
assert.ok(data.exists, 'Test Failed: should exist');

console.log('All tests passed!');
```

### What to Test
- Configuration files (like `package.json`)
- Core business logic in services
- Component rendering and behavior
- API integration points
- Error handling scenarios
- Edge cases and boundary conditions

### Test Organization
- Group related assertions together
- Use descriptive error messages
- Test both success and failure paths
- Verify expected state changes

### Running Tests
Currently the repository doesn't have a dedicated test command, but tests can be run directly:
```bash
node tests/package.test.js
```

### Best Practices
- **Isolation**: Tests should not depend on each other
- **Clarity**: Test names should describe what is being tested
- **Completeness**: Cover happy path and error cases
- **Maintainability**: Keep tests simple and easy to update
- **Speed**: Tests should run quickly

### Testing Components
When testing React components (if test framework is added):
- Test component rendering
- Test user interactions
- Test props handling
- Test accessibility features
- Mock external dependencies

### Testing Services
When testing services:
- Mock API calls and external dependencies
- Test error handling
- Test retry logic
- Verify logging is called correctly
- Test async operations

### Mocking
When mocking is needed:
- Mock external API calls (Gemini, Supabase)
- Mock file system operations
- Mock environment variables
- Keep mocks simple and focused

### Coverage Goals
- Focus on critical paths first
- Test error handling thoroughly
- Don't test third-party libraries
- Aim for meaningful coverage, not 100%

## Adding New Tests

When adding functionality, consider adding tests for:
1. Happy path scenarios
2. Error conditions
3. Edge cases
4. Integration points
5. Business logic

## Common Testing Patterns

### Testing Configuration
```javascript
import { strict as assert } from 'assert';

const config = loadConfig();
assert.strictEqual(config.name, 'expected-name');
assert.ok(config.required_field, 'Required field missing');
```

### Testing Async Functions
```javascript
import { strict as assert } from 'assert';

async function testAsyncOperation() {
  try {
    const result = await someAsyncFunction();
    assert.strictEqual(result.status, 'success');
  } catch (error) {
    assert.fail('Should not throw error');
  }
}
```

## Test Maintenance
- Update tests when changing functionality
- Remove obsolete tests
- Refactor duplicated test code
- Keep test data realistic but minimal
