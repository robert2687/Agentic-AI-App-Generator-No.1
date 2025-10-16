// FIX: Add type declarations for the Node.js `process` global to resolve TypeScript errors.
// This is necessary because the TS environment doesn't seem to have Node.js types configured.
declare const process: {
  argv: string[];
  cwd: () => string;
  exit: (code?: number) => never;
};

import fs from 'fs';
import path from 'path';
import { validateCssOutput } from '../services/orchestrator/cssValidator.js';

/**
 * This script is intended for CI/CD to validate a standalone CSS file.
 *
 * Usage:
 *   node <path-to-compiled-script>.js <path-to-css-file>
 *
 * Example:
 *   node dist/scripts/validateCss.js artifacts/styles.css
 */
function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Error: Please provide the path to the CSS file to validate.');
    console.error('Usage: node <script>.js <path-to-css-file>');
    process.exit(1);
  }
  
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log(`🔍 Validating CSS file at: ${absolutePath}`);
    
    const cssContent = fs.readFileSync(absolutePath, 'utf8');
    const errors = validateCssOutput(cssContent);
    
    if (errors.length > 0) {
      console.error('❌ CSS Validation Failed:\n' + errors.map(e => `  - ${e}`).join('\n'));
      process.exit(1);
    } else {
      console.log('✅ CSS Validation Passed!');
    }
  } catch (error: any) {
    console.error(`❌ An error occurred: ${error.message}`);
    process.exit(1);
  }
}

main();
