#!/usr/bin/env node
// To run this script directly, ensure it is executable: chmod +x scripts/verify-setup.js

/**
 * Setup Verification Script
 * Checks if the development environment is properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Constants
const GEMINI_API_KEY_PLACEHOLDER = 'your_gemini_api_key_here';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

const checks = [];
let hasErrors = false;
let hasWarnings = false;

function success(message) {
  checks.push({ status: 'success', message });
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
  checks.push({ status: 'error', message });
  console.log(`${colors.red}✗${colors.reset} ${message}`);
  hasErrors = true;
}

function warning(message) {
  checks.push({ status: 'warning', message });
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  hasWarnings = true;
}

function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function header(message) {
  console.log(`\n${colors.bold}${message}${colors.reset}`);
}

console.log(`${colors.bold}${colors.blue}Agentic AI App Generator - Setup Verification${colors.reset}\n`);

// Check Node.js version
header('Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  success(`Node.js ${nodeVersion} (required: v18+)`);
} else {
  error(`Node.js ${nodeVersion} is too old. Please upgrade to v18 or higher.`);
}

// Check npm version
header('Checking npm version...');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  const npmMajor = parseInt(npmVersion.split('.')[0]);
  if (npmMajor >= 8) {
    success(`npm ${npmVersion} (required: v8+)`);
  } else {
    warning(`npm ${npmVersion} is quite old. Consider upgrading to v8 or higher.`);
  }
} catch (err) {
  error('npm is not installed or not in PATH');
}

// Check if node_modules exists
header('Checking dependencies...');
const nodeModulesPath = resolve(rootDir, 'node_modules');
if (existsSync(nodeModulesPath)) {
  success('node_modules directory exists');
  
  // Check key dependencies
  const keyDeps = ['react', 'react-dom', '@google/genai', '@supabase/supabase-js', 'vite'];
  let allDepsInstalled = true;
  
  for (const dep of keyDeps) {
    const depPath = resolve(nodeModulesPath, dep);
    if (!existsSync(depPath)) {
      error(`Missing dependency: ${dep}`);
      allDepsInstalled = false;
    }
  }
  
  if (allDepsInstalled) {
    success('All key dependencies are installed');
  }
} else {
  error('node_modules directory not found. Run "npm install" first.');
}

// Check environment file
header('Checking environment configuration...');
const envPath = resolve(rootDir, '.env.local');
if (existsSync(envPath)) {
  success('.env.local file exists');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    if (envContent.includes('GEMINI_API_KEY')) {
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match && match[1] && match[1].trim() !== GEMINI_API_KEY_PLACEHOLDER && match[1].trim() !== '') {
        success('GEMINI_API_KEY is configured');
      } else {
        warning('GEMINI_API_KEY is not set or using placeholder value');
        info('  Get your API key from: https://makersuite.google.com/app/apikey');
      }
    } else {
      error('GEMINI_API_KEY not found in .env.local');
    }
  } catch (err) {
    error(`Error reading .env.local: ${err.message}`);
  }
} else {
  warning('.env.local file not found');
  info('  Create it by running: cp .env.local.template .env.local');
  info('  Then add your Gemini API key');
}

// Check package.json
header('Checking project configuration...');
const packageJsonPath = resolve(rootDir, 'package.json');
if (existsSync(packageJsonPath)) {
  success('package.json exists');
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.dev) {
      success('dev script is configured');
    } else {
      error('dev script not found in package.json');
    }
    
    if (packageJson.scripts && packageJson.scripts.build) {
      success('build script is configured');
    } else {
      error('build script not found in package.json');
    }
  } catch (err) {
    error(`Error reading package.json: ${err.message}`);
  }
} else {
  error('package.json not found');
}

// Check TypeScript configuration
header('Checking TypeScript configuration...');
const tsconfigPath = resolve(rootDir, 'tsconfig.json');
if (existsSync(tsconfigPath)) {
  success('tsconfig.json exists');
} else {
  error('tsconfig.json not found');
}

// Check Vite configuration
header('Checking Vite configuration...');
const viteConfigPath = resolve(rootDir, 'vite.config.ts');
if (existsSync(viteConfigPath)) {
  success('vite.config.ts exists');
} else {
  error('vite.config.ts not found');
}

// Check key source files
header('Checking source files...');
const keyFiles = [
  'index.tsx',
  'App.tsx',
  'constants.ts',
  'types.ts',
  'index.html',
];

for (const file of keyFiles) {
  const filePath = resolve(rootDir, file);
  if (existsSync(filePath)) {
    success(`${file} exists`);
  } else {
    error(`${file} not found`);
  }
}

// Check key directories
header('Checking directory structure...');
const keyDirs = [
  'components',
  'services',
  'hooks',
  'contexts',
  'hoc',
];

for (const dir of keyDirs) {
  const dirPath = resolve(rootDir, dir);
  if (existsSync(dirPath)) {
    success(`${dir}/ directory exists`);
  } else {
    error(`${dir}/ directory not found`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
header('Summary');

const successCount = checks.filter(c => c.status === 'success').length;
const errorCount = checks.filter(c => c.status === 'error').length;
const warningCount = checks.filter(c => c.status === 'warning').length;

console.log(`${colors.green}✓ ${successCount} passed${colors.reset}`);
if (warningCount > 0) {
  console.log(`${colors.yellow}⚠ ${warningCount} warnings${colors.reset}`);
}
if (errorCount > 0) {
  console.log(`${colors.red}✗ ${errorCount} errors${colors.reset}`);
}

if (hasErrors) {
  console.log(`\n${colors.red}${colors.bold}Setup is incomplete. Please fix the errors above.${colors.reset}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`\n${colors.yellow}${colors.bold}Setup is mostly complete, but there are some warnings.${colors.reset}`);
  console.log('You can proceed with development, but consider addressing the warnings.\n');
  process.exit(0);
} else {
  console.log(`\n${colors.green}${colors.bold}✓ All checks passed! Your development environment is ready.${colors.reset}`);
  console.log('\nYou can now run:');
  console.log(`  ${colors.blue}npm run dev${colors.reset}     - Start the development server`);
  console.log(`  ${colors.blue}npm run build${colors.reset}   - Build for production`);
  console.log(`  ${colors.blue}npm run preview${colors.reset} - Preview production build\n`);
  process.exit(0);
}
