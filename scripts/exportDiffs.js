import fs from 'fs';
import path from 'path';
import { createTwoFilesPatch } from 'diff';
import { getPrettyHtml } from 'diff2html';
import { logger } from '../runtime/loggerInstance.js';

// This script is intended to be run from the project root in a Node.js environment.
try {
  const outputLogs = logger.getLogs().filter(log => (log.type === 'end' || log.type === 'error') && log.output);
  
  if (outputLogs.length < 2) {
    console.log('⚠️ Not enough logs with output to generate diffs. Skipping.');
    process.exit(0);
  }

  const outDir = path.resolve(process.cwd(), 'artifacts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, 'diff.html');

  let diffsHtml = '';
  for (let i = 1; i < outputLogs.length; i++) {
    const prev = outputLogs[i - 1];
    const curr = outputLogs[i];

    const diff = createTwoFilesPatch(
      `${prev.agentName} (step ${i})`,
      `${curr.agentName} (step ${i + 1})`,
      prev.output || '',
      curr.output || '',
      '', 
      '', 
      { context: 5 }
    );

    // Only add a diff section if there are actual changes
    if (diff.includes('---') || diff.includes('+++')) {
      diffsHtml += `<h2>Diff: ${prev.agentName} ➔ ${curr.agentName}</h2>`;
      diffsHtml += getPrettyHtml(diff, { inputFormat: 'diff', showFiles: true, matching: 'lines' });
    }
  }
  
  if (!diffsHtml) {
    console.log('✅ No significant differences found between agent outputs.');
    process.exit(0);
  }

  const finalHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Audit Diffs</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
        <style>
            body { background-color: #0d1117; color: #c9d1d9; font-family: sans-serif; padding: 1rem; }
            h1, h2 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
            .d2h-file-header { display: none; }
        </style>
      </head>
      <body>
        <h1>Agent Output Diffs</h1>
        ${diffsHtml}
      </body>
    </html>
  `;

  fs.writeFileSync(outFile, finalHtml, 'utf-8');
  console.log(`✅ Diff HTML exported to ${outFile}`);
} catch (error) {
  console.error('❌ Failed to export diffs:', error);
  process.exit(1);
}
