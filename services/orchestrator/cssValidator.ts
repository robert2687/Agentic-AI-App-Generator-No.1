/**
 * A dedicated, robust CSS validator for the UX/UI Designer agent's output.
 * This can be used both in the browser for runtime validation and in Node.js for CI scripts.
 */
export function validateCssOutput(css: string): string[] {
  const errors: string[] = [];

  const requiredVariables = [
    '--background-color',
    '--surface-color',
    '--text-color',
    '--primary-color',
    '--delete-color',
    '--font-family-sans',
    '--spacing-md',
    '--spacing-lg',
    '--border-radius',
  ];

  // Check for :root block. It's essential for defining variables.
  if (!css.includes(':root')) {
    errors.push('Missing :root selector with CSS variable definitions.');
  }

  // Check that variables are actually used.
  const varUsagePattern = /var\(--[a-zA-Z0-9-_]+\)/;
  if (!varUsagePattern.test(css)) {
    errors.push('No CSS variables are being used with var(). They must be defined and used.');
  }

  // Check that each required variable is both defined and used.
  requiredVariables.forEach(variable => {
    const definitionPattern = new RegExp(`${variable}\\s*:`);
    if (!definitionPattern.test(css)) {
      errors.push(`Missing definition for ${variable} in :root.`);
    }
    
    // Using a robust regex to safely handle variable names in regex patterns.
    const usagePattern = new RegExp(`var\\(${variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`);
    if (!usagePattern.test(css)) {
      errors.push(`Variable ${variable} is defined but not used in CSS.`);
    }
  });

  return errors;
}
