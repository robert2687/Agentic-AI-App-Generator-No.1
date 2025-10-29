
import { readFileSync } from 'fs';
import { strict as assert } from 'assert';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

assert.strictEqual(packageJson.name, 'agentic-ai-app-generator-fork', 'Test Failed: name should be agentic-ai-app-generator-fork');
assert.strictEqual(packageJson.private, true, 'Test Failed: private should be true');
assert.strictEqual(packageJson.type, 'module', 'Test Failed: type should be module');

assert.ok(packageJson.scripts, 'Test Failed: scripts should exist');
assert.strictEqual(packageJson.scripts.dev, 'vite', 'Test Failed: dev script should be "vite"');
assert.strictEqual(packageJson.scripts.build, 'vite build', 'Test Failed: build script should be "vite build"');
assert.strictEqual(packageJson.scripts.preview, 'vite preview', 'Test Failed: preview script should be "vite preview"');
assert.strictEqual(packageJson.scripts['verify-setup'], 'node scripts/verify-setup.js', 'Test Failed: verify-setup script should be "node scripts/verify-setup.js"');

assert.ok(packageJson.dependencies.react, 'Test Failed: react should be a dependency');
assert.ok(packageJson.devDependencies.vite, 'Test Failed: vite should be a dev dependency');

console.log('All package.json tests passed!');
