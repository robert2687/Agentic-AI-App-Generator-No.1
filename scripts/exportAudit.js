import fs from 'fs';
import path from 'path';
import { logger } from '../dist/node/services/loggerInstance.js';

// This script is intended to be run from the project root in a Node.js environment.
const outDir = path.resolve(process.cwd(), 'artifacts');
const outFile = path.join(outDir, 'audit.json');

try {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const json = logger.exportJSON();
  fs.writeFileSync(outFile, json, 'utf-8');

  console.log(`✅ Audit log exported to ${outFile}`);
} catch (error) {
  console.error('❌ Failed to export audit log:', error);
  process.exit(1);
}
