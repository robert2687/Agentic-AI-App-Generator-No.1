// scripts/postStickyAuditComment.js
import { logger } from "../services/loggerInstance.js";
import { createTwoFilesPatch } from "diff";
import fs from "fs";

// This script generates a markdown comment body for a pull request.
try {
    const allLogs = logger.getLogs();

    // Filter for logs that represent a generation attempt, which have provider/retry info.
    const attemptLogs = allLogs.filter(log => log.provider && typeof log.retries === 'number');

    if (attemptLogs.length === 0) {
        console.log("⚠️ No agent attempt logs found to generate a report.");
        // Create an empty/placeholder comment file so the GH action doesn't fail
        fs.writeFileSync("audit-comment.md", "No agent attempts were logged for this run.", "utf-8");
        process.exit(0);
    }
    
    // --- 1. Extract Prompt ---
    const prompt = attemptLogs[0]?.prompt || 'No prompt was recorded for this run.';
    const goal = prompt.match(/\*\*Project Goal:\*\*\n(.*?)\n\n/s)?.[1].trim() || prompt;

    // --- 2. Group logs by provider ---
    const groupedByProvider = attemptLogs.reduce((acc, log) => {
      if (!acc[log.provider]) acc[log.provider] = [];
      acc[log.provider].push(log);
      return acc;
    }, {});

    // --- 3. Build Provider Summary Table ---
    const summaryHeader = `| Provider | Attempts | Successes | Failures |\n|----------|----------|-----------|----------|`;
    const summaryRows = Object.entries(groupedByProvider)
      .map(([provider, entries]) => {
        const successes = entries.filter((e) => e.valid).length;
        const failures = entries.length - successes;
        return `| \`${provider}\` | ${entries.length} | ${successes} | ${failures} |`;
      })
      .join("\n");
    
    // --- 4. Build Diffs Grouped by Provider ---
    let diffsMarkdown = "";
    for (const [provider, entries] of Object.entries(groupedByProvider)) {
        if (entries.length > 1) { // Only create a diff section if there's more than one attempt for a provider
            let providerDiffs = "";
            for (let i = 1; i < entries.length; i++) {
                const prev = entries[i - 1];
                const curr = entries[i];
                if (prev.output !== curr.output) {
                    const diff = createTwoFilesPatch(
                        `${prev.agentName}-attempt-${prev.retries}.txt`,
                        `${curr.agentName}-attempt-${curr.retries}.txt`,
                        prev.output || '',
                        curr.output || ''
                    );
                    if (diff.includes('---') || diff.includes('+++')) {
                       providerDiffs += `\n<details>\n<summary>Diff: Attempt ${prev.retries} ➔ ${curr.retries} (Agent: ${prev.agentName} ➔ ${curr.agentName})</summary>\n\n\`\`\`diff\n${diff}\n\`\`\`\n\n</details>\n`;
                    }
                }
            }
            if(providerDiffs) {
                 diffsMarkdown += `\n#### Provider: \`${provider}\`\n${providerDiffs}`;
            }
        }
    }
    
    // --- 5. Final suggestion = last valid output from a code-producing agent ---
    const finalLog = attemptLogs.slice().reverse().find(l => l.valid && (l.agentName === 'Coder' || l.agentName === 'Patcher'));
    let finalSuggestion = 'No valid final code was generated.';
    let baselineProvider = 'None';
    let baselineOutput = '';
    
    if (finalLog && finalLog.output) {
        baselineProvider = finalLog.provider;
        baselineOutput = finalLog.output;
        const codeRegex = /```(?:html|)\n([\s\S]*?)```/;
        const match = finalLog.output.match(codeRegex);
        const finalCode = match ? match[1].trim() : finalLog.output.trim();
        finalSuggestion = `\`\`\`suggestion\n${finalCode}\n\`\`\``;
    }

    // --- 6. Build Side-by-Side Provider Comparison ---
    const providerOutputs = Object.entries(groupedByProvider).map(([provider, entries]) => {
        const lastValid = entries.slice().reverse().find(e => e.valid);
        const lastEntry = lastValid || entries[entries.length - 1];
        return { 
            provider, 
            output: lastEntry.output || 'No output recorded.',
            agent: lastEntry.agentName,
            valid: lastEntry.valid,
            validationError: lastEntry.validationError,
        };
    });

    let comparisonMarkdown = `| Provider | Final Agent | Status | Details / Failure Reason | Final Output Preview |\n|----------|-------------|--------|--------------------------|------------------------|\n`;
    for (const { provider, output, agent, valid, validationError } of providerOutputs) {
        const codeRegex = /```(?:html|css|js|)\n?([\s\S]*?)```/s;
        const match = output.match(codeRegex);
        const codeForPreview = match ? match[1].trim() : output.trim();
        
        const preview = `
<details>
<summary>Click to view</summary>

\`\`\`
${codeForPreview.substring(0, 800)}${codeForPreview.length > 800 ? '...' : ''}
\`\`\`

</details>
`;
        const cleanedPreview = preview.replace(/\|/g, '\\|').replace(/\r?\n/g, '');
        const status = valid ? '✅' : '❌';
        const details = valid ? ' ' : `\`${validationError || 'Validation failed.'}\``;
        comparisonMarkdown += `| \`${provider}\` | \`${agent}\` | ${status} | ${details} | ${cleanedPreview} |\n`;
    }

    // --- 7. Cross-Provider Diff ---
    let crossProviderDiffsMarkdown = "";
    if (baselineProvider !== 'None' && providerOutputs.length > 1) {
        for (const { provider, output } of providerOutputs) {
            if (provider !== baselineProvider) {
                const diff = createTwoFilesPatch(
                    `${baselineProvider}-final.txt`,
                    `${provider}-final.txt`,
                    baselineOutput,
                    output
                );
                if (diff.includes('---') || diff.includes('+++')) {
                    crossProviderDiffsMarkdown += `<details><summary>Diff: Baseline (\`${baselineProvider}\`) vs. \`${provider}\`</summary>\n\n\`\`\`diff\n${diff}\n\`\`\`\n\n</details>\n`;
                }
            }
        }
    }
    
    // --- 8. Build comment body ---
    const body = `
### 🤖 Agentic Audit Report

**Prompt:**  
\`\`\`
${goal}
\`\`\`

---

#### 📊 Provider Summary
${summaryHeader}
${summaryRows}

---

<details>
<summary>🔍 View Intra-Provider Diffs (Sequential Attempts)</summary>
${diffsMarkdown || '\nNo significant differences between attempts.'}
</details>

---

#### 🆚 Side-by-Side Provider Comparison
${comparisonMarkdown}

---

<details>
<summary>⚔️ Cross-Provider Diff</summary>
${crossProviderDiffsMarkdown || '\nOnly one provider ran or no significant differences found.'}
</details>

---

<details open>
<summary>💡 Suggested Final Output</summary>

${finalSuggestion}

</details>

📦 Full artifacts are available in the action run's summary.
`;
    
    fs.writeFileSync("audit-comment.md", body.trim(), "utf-8");
    console.log("✅ Grouped + side-by-side audit comment generated: audit-comment.md");

} catch (error) {
    console.error('❌ Failed to generate audit comment:', error);
    fs.writeFileSync("audit-comment.md", `### 💥 Error Generating Audit Report\n\n\`\`\`\n${error.stack}\n\`\`\``, "utf-8");
    process.exit(1);
}
