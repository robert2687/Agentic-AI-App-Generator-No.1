---
# Instructions specific to documentation
applies_to:
  - "**/*.md"
  - "docs/**/*"
---

# Documentation Instructions

## Documentation Guidelines

When writing or updating documentation:

### Documentation Types

#### README.md
- Keep setup instructions clear and concise
- Include prerequisites and dependencies
- Document all environment variables
- Provide examples of common use cases
- Keep the getting started section up-to-date

#### CONTRIBUTING.md
- Outline the contribution process
- Include coding standards and style guides
- Document testing requirements
- Explain the PR review process
- Reference other relevant documentation

#### Code Documentation
Use JSDoc comments for:
- Complex functions
- Component props
- Service APIs
- Type definitions

Example:
```typescript
/**
 * Generates content using the Gemini API
 * @param prompt - The input prompt for content generation
 * @param options - Optional configuration for the API call
 * @returns Promise resolving to generated content
 * @throws Error if API call fails or quota is exceeded
 */
async function generateContent(prompt: string, options?: GenerateOptions): Promise<string> {
  // Implementation
}
```

### Style Guidelines

#### Formatting
- Use proper markdown syntax
- Include code examples in fenced code blocks with language tags
- Use tables for structured data
- Add section headers for organization
- Keep line lengths reasonable (80-100 characters when possible)

#### Tone
- Be clear and concise
- Use active voice
- Write in present tense
- Be inclusive and welcoming
- Assume the reader is intelligent but unfamiliar with the project

#### Links
- Use descriptive link text (not "click here")
- Prefer relative links for internal documentation
- Keep external links up-to-date
- Include context about where links lead

### Code Examples

Always include:
- Syntax highlighting (specify language)
- Complete, runnable examples when possible
- Comments explaining non-obvious parts
- Expected output or results

Example:
```typescript
// Import required dependencies
import { genAI } from '@/services/geminiClient';

// Generate content using Gemini API
async function example() {
  const result = await genAI.generateContent('Hello, world!');
  console.log(result); // Expected output: AI-generated response
}
```

### Technical Documentation

When documenting technical features:
- Explain the "why" not just the "what"
- Include architecture diagrams if helpful
- Document assumptions and limitations
- Provide troubleshooting tips
- Link to related resources

### API Documentation

When documenting APIs:
- List all parameters with types
- Describe return values
- Document error conditions
- Provide usage examples
- Include authentication requirements

### Configuration Documentation

When documenting configuration:
- Explain what each setting does
- Provide example values
- Note required vs. optional settings
- Document environment-specific differences
- Warn about security implications

### Updating Documentation

When making code changes:
- Update affected documentation
- Check for outdated information
- Verify all links still work
- Update version numbers if applicable
- Review related documentation files

### Documentation Structure

Organize documentation with:
- Clear hierarchy (H1 → H2 → H3)
- Table of contents for long documents
- Consistent formatting throughout
- Logical flow of information

### Common Sections

Most documentation should include:
- **Overview**: What is this?
- **Installation/Setup**: How to get started?
- **Usage**: How to use it?
- **Configuration**: How to configure it?
- **Examples**: Show real-world usage
- **Troubleshooting**: Common issues and solutions
- **Contributing**: How to help improve it

### Version-Specific Information

When documenting version-specific features:
- Clearly mark version requirements
- Note deprecated features
- Document migration paths
- Link to changelogs

### Visual Aids

Consider including:
- Screenshots for UI features
- Architecture diagrams for system design
- Flow charts for complex processes
- Tables for comparison or reference

### Accessibility in Documentation

Ensure documentation is accessible:
- Use descriptive alt text for images
- Maintain proper heading hierarchy
- Use semantic markup
- Avoid relying solely on color to convey meaning
- Provide text alternatives for visual content

## Best Practices

- **Accuracy**: Ensure all information is correct and current
- **Completeness**: Cover all aspects users need to know
- **Clarity**: Write clearly and avoid jargon when possible
- **Consistency**: Use consistent terminology and formatting
- **Maintenance**: Regularly review and update documentation
- **Examples**: Include practical, working examples
- **Navigation**: Make it easy to find information

## Documentation Review Checklist

Before submitting documentation changes:
- [ ] All links work correctly
- [ ] Code examples are tested and working
- [ ] Spelling and grammar are correct
- [ ] Formatting is consistent
- [ ] Screenshots are up-to-date (if applicable)
- [ ] Technical accuracy verified
- [ ] Related docs are also updated
