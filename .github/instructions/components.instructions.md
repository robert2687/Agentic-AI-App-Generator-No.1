---
# Instructions specific to React components
applies_to:
  - "components/**/*.tsx"
  - "components/**/*.ts"
---

# React Component Development Instructions

## Component-Specific Guidelines

When working with React components in this repository:

### File Structure
- Each component should be in its own file
- File name must match component name (PascalCase)
- Use `.tsx` extension for components with JSX
- Use `.ts` extension for utility functions

### Component Pattern
```typescript
import React from 'react';
import type { ComponentProps } from '@/types';

interface MyComponentProps {
  // Define all props with proper types
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // Component logic here
  return (
    <div>
      {/* JSX here */}
    </div>
  );
};

export default MyComponent;
```

### Accessibility Requirements
Every component must:
- Use semantic HTML (`<button>` not `<div onClick>`)
- Include `aria-label` for icon buttons
- Ensure keyboard navigation works
- Provide proper `alt` text for images
- Use `<label>` elements for form inputs
- Maintain WCAG AA color contrast

### State Management
- Use `useState` for local component state
- Use `useContext` for shared state (see `/contexts/`)
- Extract complex logic into custom hooks (see `/hooks/`)
- Use `useCallback` for memoized callbacks
- Use `useRef` for DOM references

### Performance
- Memoize expensive computations with `useMemo`
- Prevent unnecessary re-renders with `React.memo` when appropriate
- Keep components small and focused
- Extract reusable logic into custom hooks

### Import Paths
Always use the `@/` alias for imports:
```typescript
import { Agent } from '@/types';
import Header from '@/components/Header';
import { useTheme } from '@/hooks/useTheme';
```

### Modal Components
When creating modals:
- Follow patterns from `PreviewModal`, `DeploymentModal`, `AuthModal`
- Include proper close handlers
- Support Escape key to close
- Manage focus properly for accessibility
- Use a backdrop that can be clicked to close

### Error Handling
- Show user-friendly error messages
- Implement loading states
- Handle edge cases gracefully
- Log errors appropriately using the logger service

## Common Pitfalls to Avoid
- Don't use `any` type - define proper TypeScript types
- Don't forget to handle cleanup in `useEffect`
- Don't manipulate DOM directly - use React refs
- Don't use console.log in production code
- Don't skip accessibility attributes
