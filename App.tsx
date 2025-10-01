
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Agent, AgentStatus, AgentName } from './types';
import { INITIAL_AGENTS } from './constants';
import * as geminiService from './services/geminiService';

import Header from './components/Header';
import PromptInput from './components/PromptInput';
import AgentCard from './components/AgentCard';
import AgentDetailView from './components/AgentDetailView';
import PreviewModal from './components/PreviewModal';
import PreviewPanel from './components/PreviewPanel';


const DEFAULT_PROJECT_GOAL = `
Build a complete, single-file task management application.

The app should have the following features:
1.  **Add Tasks:** An input field and an "Add Task" button to add new tasks to a list.
2.  **View Tasks:** Display the list of tasks.
3.  **Edit Tasks:** An "Edit" button next to each task that allows the user to modify the task's text.
4.  **Delete Tasks:** A "Delete" button next to each task to remove it from the list.
5.  **Complete Tasks:** A checkbox for each task. When checked, the task should be visually marked as complete (e.g., with a line-through).
6.  **Persistence:** Use browser local storage to save the tasks. When the user closes or reloads the page, their tasks should reappear.

The entire application (HTML, CSS, and JavaScript) must be contained within a single HTML file. The UI should be clean, modern, and intuitive.
`.trim();


/**
 * Extracts HTML code from a string, trying various patterns.
 * @param output The string output from an agent.
 * @returns The extracted HTML code as a string, or null if none is found.
 */
const extractHtmlCode = (output: string | null): string | null => {
    if (!output) return null;

    // Priority 1: Find a fenced code block specifically marked as 'html'.
    let match = output.match(/```html\n([\s\S]*?)```/);
    if (match?.[1]) {
        return match[1].trim();
    }

    // Priority 2: Find any fenced code block that looks like a complete HTML document.
    const allCodeBlocks = [...output.matchAll(/```(?:\w*)\n([\s\S]*?)```/g)];
    const htmlBlock = allCodeBlocks.find(blockMatch => {
        const content = blockMatch?.[1]?.trim().toLowerCase();
        return content && (content.startsWith('<!doctype html>') || content.startsWith('<html>'));
    });
    if (htmlBlock?.[1]) {
        return htmlBlock[1].trim();
    }

    // Priority 3: Find HTML content that is not inside a code block.
    // This is useful if the agent forgets the fences but includes explanatory text.
    match = output.match(/(<!DOCTYPE html>[\s\S]*?<\/html>)/i);
    if (match?.[1]) {
        return match[1].trim();
    }
    
    // Priority 4 (Fallback): If there are code blocks, but none were clearly HTML,
    // assume the largest one is the application code. This is a reasonable heuristic.
    if(allCodeBlocks.length > 0) {
        const largestBlock = allCodeBlocks.reduce((largest, current) => 
            ((current?.[1]?.length ?? 0) > (largest?.[1]?.length ?? 0) ? current : largest)
        );
        if (largestBlock?.[1]) {
            return largestBlock[1].trim();
        }
    }
    
    // Priority 5 (Final Fallback): If no code blocks, check if the entire output looks like HTML.
    const trimmedOutput = output.trim();
    const isHtmlLike = trimmedOutput.toLowerCase().startsWith('<!doctype html>') || trimmedOutput.startsWith('<html>');
    if (!output.includes('```') && isHtmlLike) {
        return trimmedOutput;
    }

    return null; // No definitive code found
};


const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [projectGoal, setProjectGoal] = useState<string>(DEFAULT_PROJECT_GOAL);
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);
  const [currentAgentIndex, setCurrentAgentIndex] = useState<number>(-1);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [recoveryContext, setRecoveryContext] = useState<{
    failingAgentName: AgentName;
    originalInput: string;
    errorMessage: string;
  } | null>(null);


  const patcherAgent = useMemo(() => agents.find(a => a.name === 'Patcher'), [agents]);
  const coderAgent = useMemo(() => agents.find(a => a.name === 'Coder'), [agents]);

  useEffect(() => {
    // Prioritize Patcher's output if it has completed, otherwise use Coder's output.
    const finalCodeAgent = (patcherAgent?.status === AgentStatus.COMPLETED && patcherAgent.output)
      ? patcherAgent
      : coderAgent;

    if (finalCodeAgent?.output) {
      const extractedCode = extractHtmlCode(finalCodeAgent.output);
      setPreviewCode(extractedCode);
    } else {
      setPreviewCode(null);
    }
  }, [agents, coderAgent, patcherAgent]);


  const handleSelectAgent = (index: number) => {
    setSelectedAgentIndex(index);
  };

  const isWorkflowComplete = useMemo(() => {
    return agents.every(agent => agent.status === AgentStatus.COMPLETED);
  }, [agents]);

  const resetWorkflow = () => {
    setAgents(INITIAL_AGENTS);
    setError(null);
    setIsGenerating(false);
    setCurrentAgentIndex(-1);
    setSelectedAgentIndex(0);
    setPreviewCode(null);
    setIsPreviewModalOpen(false);
    setProjectGoal(DEFAULT_PROJECT_GOAL);
    setRefinementPrompt('');
    setRecoveryContext(null);
  };
  
  const handleStartGeneration = useCallback(async () => {
    if (!projectGoal.trim()) {
      setError("Please enter a project goal.");
      return;
    }

    resetWorkflow();
    setIsGenerating(true);
    setRecoveryContext(null);

    let currentInput = `The user wants to build an application with the following goal: "${projectGoal}".`;
    const newAgentsState = [...INITIAL_AGENTS];
    const agentOutputs: Record<string, string> = {};
    
    for (let i = 0; i < newAgentsState.length; i++) {
        setCurrentAgentIndex(i);
        setSelectedAgentIndex(i);
        
        const currentAgentConfig = newAgentsState[i];
        let agentSpecificInput = currentInput;

        // --- SPECIAL INPUT HANDLING ---
        if (recoveryContext) {
            // If in recovery mode, the Reviewer gets a special prompt to analyze the error.
            if (currentAgentConfig.name === 'Reviewer') {
                agentSpecificInput = `The '${recoveryContext.failingAgentName}' agent failed to execute its task.
Error Message:
---
${recoveryContext.errorMessage}
---
Original Input to the failing agent:
---
${recoveryContext.originalInput}
---
Your task is to analyze this error and provide a clear, concise set of instructions for the Patcher agent on how to resolve the issue. Explain what likely went wrong and what needs to be changed.`;
            } 
            // The Patcher gets a special prompt to apply the fix.
            else if (currentAgentConfig.name === 'Patcher') {
                const reviewerOutput = agentOutputs['Reviewer'];
                if (!reviewerOutput) {
                    const errorMessage = "Critical error: Could not find Reviewer output for error recovery.";
                    newAgentsState[i] = { ...currentAgentConfig, status: AgentStatus.ERROR, output: errorMessage };
                    setError(errorMessage);
                    setAgents([...newAgentsState]);
                    setIsGenerating(false);
                    return;
                }
                 agentSpecificInput = `A previous agent, '${recoveryContext.failingAgentName}', encountered an error.
The Reviewer agent has analyzed this failure and provided the following guidance:
---
${reviewerOutput}
---
The original input that was given to the failing '${recoveryContext.failingAgentName}' agent was:
---
${recoveryContext.originalInput}
---
Your task is to take on the role of the failing agent, follow the Reviewer's guidance to correct the mistake, and generate the final, correct output.`;
            }
        } else {
             // --- NORMAL WORKFLOW INPUT CONSTRUCTION ---
            if (currentAgentConfig.name === 'UX/UI Designer') {
                const plannerOutput = agentOutputs['Planner'];
                const architectOutput = agentOutputs['Architect'];
                agentSpecificInput = `The Planner provided these requirements and suggestions:\n\n${plannerOutput}\n\n---\n\nThe Architect designed the following system:\n\n${architectOutput}`;
            } else if (currentAgentConfig.name === 'Coder') {
                const architectOutput = agentOutputs['Architect'];
                const uxUiDesignerOutput = agentOutputs['UX/UI Designer'];
                agentSpecificInput = `The Architect designed the following system:\n\n${architectOutput}\n\n---\n\nThe UX/UI Designer provided the visual design (assets and CSS):\n\n${uxUiDesignerOutput}`;
            } else if (currentAgentConfig.name === 'Patcher') {
                const coderOutput = agentOutputs['Coder'];
                const reviewerOutput = agentOutputs['Reviewer'];

                if (!coderOutput || !reviewerOutput) {
                    const errorMessage = "Critical error: Could not find Coder or Reviewer output for the Patcher agent.";
                    newAgentsState[i] = { ...currentAgentConfig, status: AgentStatus.ERROR, output: errorMessage };
                    setError(errorMessage);
                    setAgents([...newAgentsState]);
                    setIsGenerating(false);
                    return;
                }
                agentSpecificInput = `The Coder agent produced the following code:\n\n${coderOutput}\n\n---\n\nThe Reviewer agent provided the following feedback and requested changes:\n\n${reviewerOutput}`;
            }
        }

        const agentToRun = { 
            ...currentAgentConfig, 
            status: AgentStatus.RUNNING, 
            input: agentSpecificInput, 
            output: '',
            startedAt: Date.now(),
        };
        newAgentsState[i] = agentToRun;
        setAgents([...newAgentsState]);

        try {
            const onChunk = (chunk: string) => {
                setAgents(prevAgents => {
                    const updatedAgents = [...prevAgents];
                    const agentToUpdate = updatedAgents.find(a => a.id === agentToRun.id);
                    if (agentToUpdate) {
                        agentToUpdate.output = (agentToUpdate.output || '') + chunk;
                    }
                    return updatedAgents;
                });
            };

            const finalOutput = await geminiService.runAgentStream(agentToRun, agentSpecificInput, onChunk);
            
            newAgentsState[i] = { 
                ...agentToRun, 
                status: AgentStatus.COMPLETED, 
                output: finalOutput,
                completedAt: Date.now(),
            };
            
            // If the Patcher just successfully completed a recovery, clear the context.
            if (agentToRun.name === 'Patcher' && recoveryContext) {
                setRecoveryContext(null);
            }

            agentOutputs[agentToRun.name] = finalOutput;
            currentInput = `As the ${agentToRun.name}, you produced this output:\n\n${finalOutput}`;
        
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            const reviewerIndex = newAgentsState.findIndex(a => a.name === 'Reviewer');
            
            // Check if we can recover: error happened before Reviewer, and we're not already recovering.
            if (i < reviewerIndex && !recoveryContext) {
                setRecoveryContext({
                    failingAgentName: agentToRun.name,
                    originalInput: agentSpecificInput,
                    errorMessage: errorMessage,
                });
                newAgentsState[i] = { ...agentToRun, status: AgentStatus.ERROR, output: errorMessage, completedAt: Date.now() };
                // Let the loop continue to the Reviewer agent.
                currentInput = `The previous agent, ${agentToRun.name}, failed. The Reviewer will now analyze the error.`;
            } else {
                // Unrecoverable error (e.g., Reviewer/Patcher failed, or recovery already tried).
                newAgentsState[i] = { ...agentToRun, status: AgentStatus.ERROR, output: errorMessage, completedAt: Date.now() };
                setError(`Error at ${agentToRun.name} agent: ${errorMessage}`);
                setAgents([...newAgentsState]);
                setIsGenerating(false);
                return;
            }
        }
    }
    
    setAgents(newAgentsState);
    setIsGenerating(false);
    setCurrentAgentIndex(-1);
  }, [projectGoal, recoveryContext]);

  const handleStartRefinement = useCallback(async () => {
    if (!refinementPrompt.trim()) {
      setError("Please enter a refinement request.");
      return;
    }
    const lastPatcherOutput = agents.find(a => a.name === 'Patcher' && a.status === AgentStatus.COMPLETED)?.output;
    if (!lastPatcherOutput) {
        setError("Cannot refine without a previously generated application.");
        return;
    }

    setError(null);
    setIsGenerating(true); // Lock the UI

    const reviewerIndex = agents.findIndex(a => a.name === 'Reviewer');
    if (reviewerIndex === -1) {
        setError("Configuration error: Reviewer agent not found.");
        setIsGenerating(false);
        return;
    }
    
    // Create a new state array for this run, resetting agents from Reviewer onwards
    let newAgentsState = agents.map((agent, index) => {
        if (index >= reviewerIndex) {
            return { ...INITIAL_AGENTS[index], status: AgentStatus.PENDING };
        }
        return agent;
    });

    const agentOutputs: Record<string, string> = {};
    newAgentsState.forEach(agent => {
        if (agent.status === AgentStatus.COMPLETED && agent.output) {
            agentOutputs[agent.name] = agent.output;
        }
    });

    let currentInput = `The user wants to refine the existing application.

**User's Refinement Request:**
"${refinementPrompt}"

**Full HTML Code to Refine:**
\`\`\`html
${lastPatcherOutput}
\`\`\`

Your task is to analyze the request and provide instructions for the Patcher agent.`;

    // Loop from Reviewer to Deployer
    for (let i = reviewerIndex; i < newAgentsState.length; i++) {
        setCurrentAgentIndex(i);
        setSelectedAgentIndex(i);

        const currentAgentConfig = newAgentsState[i];
        let agentSpecificInput = currentInput;

        if (currentAgentConfig.name === 'Patcher') {
            const reviewerOutput = agentOutputs['Reviewer'];
            if (!reviewerOutput) {
                const errorMessage = "Critical error: Could not find Reviewer output for refinement.";
                newAgentsState[i] = { ...currentAgentConfig, status: AgentStatus.ERROR, output: errorMessage };
                setError(errorMessage);
                setAgents([...newAgentsState]);
                setIsGenerating(false);
                return;
            }
            agentSpecificInput = `The user wants to refine the application. The Reviewer agent provided the following instructions:\n\n${reviewerOutput}\n\n---\n\nThe original code to modify is:\n\n${lastPatcherOutput}`;
        }

        const agentToRun = { 
            ...currentAgentConfig, 
            status: AgentStatus.RUNNING, 
            input: agentSpecificInput, 
            output: '',
            startedAt: Date.now(),
        };
        newAgentsState[i] = agentToRun;
        setAgents([...newAgentsState]);

        try {
            const onChunk = (chunk: string) => {
                setAgents(prevAgents => {
                    const updatedAgents = [...prevAgents];
                    const agentToUpdate = updatedAgents.find(a => a.id === agentToRun.id);
                    if (agentToUpdate) {
                        agentToUpdate.output = (agentToUpdate.output || '') + chunk;
                    }
                    return updatedAgents;
                });
            };

            const finalOutput = await geminiService.runAgentStream(agentToRun, agentSpecificInput, onChunk);
            newAgentsState[i] = { 
                ...agentToRun, 
                status: AgentStatus.COMPLETED, 
                output: finalOutput,
                completedAt: Date.now(),
            };
            agentOutputs[agentToRun.name] = finalOutput;
            currentInput = `As the ${agentToRun.name}, you produced this output:\n\n${finalOutput}`;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            newAgentsState[i] = { ...agentToRun, status: AgentStatus.ERROR, output: errorMessage, completedAt: Date.now() };
            setError(`Error at ${agentToRun.name} agent during refinement: ${errorMessage}`);
            setAgents([...newAgentsState]);
            setIsGenerating(false);
            return;
        }
    }
    
    setAgents(newAgentsState);
    setRefinementPrompt(''); // Clear prompt on success
    setIsGenerating(false);
    setCurrentAgentIndex(-1);
  }, [agents, refinementPrompt]);


  const selectedAgent = agents[selectedAgentIndex];
  
  const mainContentClass = isZenMode ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-[1fr_1fr]';


  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header />
      <main className={`flex-grow p-4 gap-4 max-w-screen-3xl mx-auto w-full grid grid-cols-1 ${mainContentClass} transition-all duration-300`}>
        {/* Left Column: Controls and Agent Details */}
        <div className={`grid gap-4 ${isZenMode ? 'md:grid-rows-[auto_1fr]' : 'lg:grid-cols-[2fr_3fr]'} md:grid-cols-1 grid-cols-1`}>
          {/* Top-Left: Prompt and Workflow */}
          <div className={`flex flex-col gap-4 ${isZenMode ? 'md:col-span-2' : ''}`}>
             <PromptInput
                projectGoal={projectGoal}
                setProjectGoal={setProjectGoal}
                onStart={handleStartGeneration}
                onReset={resetWorkflow}
                isGenerating={isGenerating}
                isComplete={isWorkflowComplete}
                onPreview={() => setIsPreviewModalOpen(true)}
                refinementPrompt={refinementPrompt}
                setRefinementPrompt={setRefinementPrompt}
                onRefine={handleStartRefinement}
             />
              <div className="bg-slate-800/50 rounded-lg p-4 flex-grow">
                <h2 className="text-lg font-bold mb-3 text-sky-400">Agent Workflow</h2>
                <div className="space-y-2">
                  {agents.map((agent, index) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgentIndex === index}
                      onClick={() => handleSelectAgent(index)}
                      isCurrent={currentAgentIndex === index}
                      isInRecoveryMode={recoveryContext !== null}
                    />
                  ))}
                </div>
              </div>
          </div>
          
          {/* Top-Right: Agent Details */}
          <section className={`rounded-lg bg-slate-800/50 p-1 flex-col ${isZenMode ? 'hidden md:flex' : 'flex'}`}>
            {selectedAgent ? (
              <AgentDetailView agent={selectedAgent} recoveryContext={recoveryContext} />
            ) : (
                <div className="flex-grow flex items-center justify-center h-full">
                  <p className="text-slate-400">Select an agent to see details.</p>
                </div>
            )}
          </section>
        </div>

        {/* Right Column: Preview */}
        <div className={`${isZenMode ? 'md:col-span-2' : 'lg:col-span-1'} hidden md:flex`}>
            <PreviewPanel 
                code={previewCode} 
                isZenMode={isZenMode}
                onToggleZenMode={() => setIsZenMode(!isZenMode)}
            />
        </div>
      </main>
      
      {isPreviewModalOpen && previewCode && (
        <PreviewModal code={previewCode} onClose={() => setIsPreviewModalOpen(false)} />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-xl">&times;</button>
        </div>
      )}
    </div>
  );
};

export default App;