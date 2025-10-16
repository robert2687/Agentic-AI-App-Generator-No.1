import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

let hasErrors = false;
let hasWarnings = false;

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
  hasErrors = true;
}

function logWarning(message) {
  console.warn(`${colors.yellow}⚠${colors.reset} ${message}`);
  hasWarnings = true;
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

console.log('\n🔍 Verifying project setup...\n');

// 1. Check Node.js version
const nodeVersion = process.version;
const nodeMajorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (nodeMajorVersion >= 18) {
  logSuccess(`Node.js version: ${nodeVersion} (>= v18 required)`);
} else {
  logError(`Node.js version: ${nodeVersion} (v18 or higher required)`);
}

// 2. Check if node_modules exists
const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  logSuccess('Dependencies installed (node_modules found)');
} else {
  logError('Dependencies not installed. Run: npm install');
}

// 3. Check for .env.local file
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  logSuccess('.env.local file exists');
  
  // Check if GEMINI_API_KEY is set
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  if (envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=your_gemini_api_key_here')) {
    logSuccess('GEMINI_API_KEY appears to be configured');
  } else {
    logWarning('GEMINI_API_KEY may not be properly configured in .env.local');
  }
} else {
  logError('.env.local file not found. Copy .env.local.template and add your API key');
}

// 4. Check for essential project files
const essentialFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'App.tsx',
];

essentialFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    logSuccess(`${file} exists`);
  } else {
    logError(`${file} not found`);
  }
});

// 5. Check for essential directories
const essentialDirs = [
  'components',
  'services',
  'scripts',
];

essentialDirs.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    logSuccess(`${dir}/ directory exists`);
  } else {
    logError(`${dir}/ directory not found`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  logError('Setup verification failed. Please fix the errors above.');
  process.exit(1);
} else if (hasWarnings) {
  logWarning('Setup verification completed with warnings.');
  logInfo('You may proceed, but consider addressing the warnings.');
  process.exit(0);
} else {
  logSuccess('All checks passed! Your environment is ready.');
  logInfo('Run "npm run dev" to start the development server.');
  process.exit(0);
}
