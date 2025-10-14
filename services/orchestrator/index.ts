
import { AGENTS_CONFIG } from '../../constants';
import type { Agent, AgentName } from '../../types';
import { AgentStatus } from '../../types';
import { geminiProvider } from './providers/geminiProvider';
import { mockProvider } from './providers/mockProvider';
import type { Provider } from './types';
import { validateAgentOutput } from './validation';
import { logger } from '../loggerInstance';
import { FunctionDeclaration, Type, Content, GenerateContentResponse, FunctionResponsePart } from '@google/genai';
import { ai, withRetry } from '../geminiClient';
import { activeImageProvider, activeImageProviderName } from '../imageProvider';


const extractCode = (markdown: string, lang: string = 'html'): string | null => {
  const regex = new RegExp("```" + lang + "\\n([\\s\\S]*?)```");
  const match = markdown.match(regex);
  if (match) return match[1].trim();
  // Fallback for cases where the language is not specified
  if (!lang) {
    const anyLangRegex = new RegExp("```(?:\\w*)\\n([\\s\\S]*?)```");
    const anyLangMatch = markdown.match(anyLangRegex);
    if (anyLangMatch) return anyLangMatch[1].trim();
  }
  return null;
};

const generateImageTool: FunctionDeclaration = {
  name: 'generateImage',
  description: 'Generates an image from a text prompt and returns a data URI.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'A detailed, creative, and descriptive prompt for the image generation model. For logos, describe the style (e.g., minimalist, modern, geometric). For favicons, keep it very simple.',
      },
      aspectRatio: {
        type: Type.STRING,
        description: 'The desired aspect ratio of the image. Supported values are "1:1", "16:9", "9:16", "4:3", "3:4". Defaults to "1:1" if not specified.',
      }
    },
    required: ['prompt'],
  },
};


interface OrchestratorCallbacks {
  onAgentUpdate: (agent: Agent) => void;
  onFinalCode: (code: string) => void;
  onWorkflowComplete: () => void;
  onWorkflowError: (error: Error, failingAgent: Agent) => void;
}

export class Orchestrator {
  private agents: Agent[] = [];
  private providers: Provider[];
  private callbacks: OrchestratorCallbacks;

  constructor(callbacks: OrchestratorCallbacks) {
    this.callbacks = callbacks;
    
    // Set up provider list with fallback mechanism
    this.providers = [];
    if (process.env.API_KEY) {
      this.providers.push(geminiProvider);
    }
    // The mock provider serves as the ultimate fallback if real providers fail or are not configured.
    this.providers.push(mockProvider);
    
    logger.info('Orchestrator', `Initialized with providers: ${this.providers.map(p => p.name).join(', ')}`);
  }

  private updateAgentState(id: number, updates: Partial<Agent>) {
    const agent = this.agents.find(a => a.id === id);
    if (agent) {
      Object.assign(agent, updates);
      this.callbacks.onAgentUpdate(agent);
    }
  }
  
  private async executeUxUiDesignerAgent(agent: Agent, input: string): Promise<string> {
    this.updateAgentState(agent.id, { status: AgentStatus.RUNNING, input, output: 'Thinking...', startedAt: Date.now() });

    if (!ai) {
      // This should ideally not be hit if the top-level check for the gemini provider is done correctly.
      logger.error(agent.name, 'Gemini client not available for function calling.', {});
      throw new Error('Gemini client not available for function calling.');
    }

    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            logger.info(agent.name, `Attempt ${attempt} to generate design with function calling.`, { provider: 'gemini', retries: attempt, prompt: input });

            const contents: Content[] = [{ role: 'user', parts: [{ text: input }] }];

            // 1. First call to Gemini to see if it wants to call a function
            const initialResponse: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: {
                    tools: [{ functionDeclarations: [generateImageTool] }],
                },
            }));
            
            const functionCalls = initialResponse.functionCalls;

            // Add Gemini's response to history before proceeding
            contents.push(initialResponse.candidates[0].content);

            if (functionCalls && functionCalls.length > 0) {
                this.updateAgentState(agent.id, { output: `Received function call(s): \`${functionCalls.map(c => c.name).join(', ')}\`...` });

                // 2. Execute the function(s)
                const functionResponseParts: FunctionResponsePart[] = await Promise.all(
                    functionCalls.map(async (call) => {
                        if (call.name === 'generateImage') {
                            const imagePrompt = call.args['prompt'] as string;
                            const aspectRatio = call.args['aspectRatio'] as string | undefined;

                            logger.info(agent.name, `Calling image provider '${activeImageProviderName}' with prompt: "${imagePrompt}"`, { prompt: imagePrompt });
                            this.updateAgentState(agent.id, { output: `Generating image with prompt: "${imagePrompt}"...` });
                            
                            try {
                                const imageResult = await activeImageProvider.generateImage(imagePrompt, { aspectRatio });
                                return {
                                    functionResponses: {
                                        id: call.id, name: call.name,
                                        response: { result: { imageDataUri: `data:${imageResult.mimeType};base64,${imageResult.base64}` } }
                                    }
                                };
                            } catch (imgError: any) {
                                logger.error(agent.name, `Image generation failed for prompt "${imagePrompt}": ${imgError.message}`, {});
                                return {
                                    functionResponses: {
                                        id: call.id, name: call.name,
                                        response: { error: `Image generation failed. Please provide an SVG placeholder instead. Error: ${imgError.message}` }
                                    }
                                };
                            }
                        }
                        // Fallback for unknown function
                        return { functionResponses: { id: call.id, name: call.name, response: { error: `Unknown function name: ${call.name}` } } };
                    })
                );
                
                // 3. Send the function response back to Gemini
                if (functionResponseParts.length > 0) {
                    contents.push({ role: 'tool', parts: functionResponseParts });
                }

                this.updateAgentState(agent.id, { output: `Image result processed. Compiling final design...` });
                // FIX: Add an explicit type annotation for `stream` to resolve a type inference issue where
                // its type was being inferred as `unknown`, causing a compile error in the for-await-of loop.
                const stream: AsyncIterable<GenerateContentResponse> = await withRetry(() => ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents }));
                
                let finalOutput = "";
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        finalOutput += chunkText;
                        this.updateAgentState(agent.id, { output: finalOutput });
                    }
                }

                const validationResult = validateAgentOutput(agent.name, finalOutput);
                if (validationResult.valid) {
                    this.updateAgentState(agent.id, { status: AgentStatus.COMPLETED, output: finalOutput, completedAt: Date.now() });
                    logger.info(agent.name, `Successfully generated design using function calling.`, { output: finalOutput });
                    return finalOutput;
                } else {
                    throw new Error(`Validation failed after function call: ${validationResult.reason}`);
                }

            } else {
                // No function call, just use the text response.
                const output = initialResponse.text;
                const validationResult = validateAgentOutput(agent.name, output);
                if (validationResult.valid) {
                    this.updateAgentState(agent.id, { status: AgentStatus.COMPLETED, output, completedAt: Date.now() });
                    logger.info(agent.name, `Successfully generated design without function calling.`, { output });
                    return output;
                } else {
                    throw new Error(`Validation failed on initial response: ${validationResult.reason}`);
                }
            }
        } catch (error: any) {
            lastError = error;
            logger.error(agent.name, `Attempt ${attempt} failed: ${error.message}`, { valid: false, output: lastError?.message });
        }
    } // end retry loop

    const finalErrorMessage = `UX/UI Designer agent failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`;
    this.updateAgentState(agent.id, { status: AgentStatus.ERROR, output: lastError?.message || finalErrorMessage, completedAt: Date.now() });
    throw new Error(finalErrorMessage);
}


  private async executeAgent(agent: Agent, input: string): Promise<string> {
    if (agent.name === 'UX/UI Designer' && this.providers.some(p => p.name === 'gemini')) {
      try {
        // Prioritize function calling path if Gemini is available
        return await this.executeUxUiDesignerAgent(agent, input);
      } catch (e: any) {
        logger.error(agent.name, `Function calling path failed, falling back to standard providers. Error: ${e.message}`, {});
        // Fall through to the standard provider loop below
      }
    }

    this.updateAgentState(agent.id, { status: AgentStatus.RUNNING, input, output: '', startedAt: Date.now() });

    const MAX_RETRIES_PER_PROVIDER = 2;
    let lastOutput: string | null = null;

    for (const provider of this.providers) {
      for (let i = 0; i < MAX_RETRIES_PER_PROVIDER; i++) {
        const attempt = i + 1;
        
        // Use a single log entry per attempt for cleaner CI reporting.
        const logDetails: any = {
          provider: provider.name,
          retries: attempt,
          prompt: input,
        };

        try {
          let currentOutput = "";
          // Clear previous agent output before new attempt
          this.updateAgentState(agent.id, { output: '' });
          
          await provider.call(input, (chunk) => {
            currentOutput += chunk;
            this.updateAgentState(agent.id, { output: currentOutput });
          });
          
          const validationResult = validateAgentOutput(agent.name, currentOutput);
          lastOutput = currentOutput;
          logDetails.output = currentOutput;
          logDetails.valid = validationResult.valid;
          
          if (validationResult.valid) {
            this.updateAgentState(agent.id, { status: AgentStatus.COMPLETED, output: currentOutput, completedAt: Date.now() });
            logger.info(agent.name, `Succeeded with ${provider.name} on attempt ${attempt}.`, logDetails);
            return currentOutput; // Success!
          } else {
            logDetails.validationError = validationResult.reason;
            const validationError = `Validation failed for ${agent.name} with ${provider.name} on attempt ${attempt}. Reason: ${validationResult.reason}`;
            logger.error(agent.name, validationError, logDetails);
            // This will continue to the next retry/provider
          }
        } catch (error: any) {
          const apiError = `API call failed for ${agent.name} with ${provider.name} on attempt ${attempt}: ${error.message}`;
          lastOutput = error.message;
          logDetails.output = lastOutput;
          logDetails.valid = false;
          logger.error(agent.name, apiError, logDetails);
          // This will continue to the next retry/provider
        }
      } // end retries loop
    } // end providers loop
    
    // If we've exhausted all providers and retries
    const finalErrorMessage = `Agent ${agent.name} failed to generate a valid response after all retries with all configured providers.`;
    this.updateAgentState(agent.id, { status: AgentStatus.ERROR, output: lastOutput || finalErrorMessage, completedAt: Date.now() });
    logger.error(agent.name, finalErrorMessage, { output: lastOutput });
    throw new Error(finalErrorMessage);
  }

  private async runWorkflow(initialPrompt: string, startingAgentName: AgentName) {
    const startIndex = this.agents.findIndex(a => a.name === startingAgentName);
    let previousAgentOutput = initialPrompt;

    for (let i = startIndex; i < this.agents.length; i++) {
      const agent = this.agents[i];
      if (agent.name === 'Deployer') continue; // Skip deployer in main flow

      // The first agent's prompt is already fully formed.
      // For subsequent agents, we build the prompt from the previous output and the agent's role.
      const promptForAgent = (i === startIndex)
        ? previousAgentOutput
        : `**Previous Agent's Output:**\n${previousAgentOutput}\n\n**Agent:** ${agent.name}\n**Task:**\n${agent.role}`;

      try {
        const output = await this.executeAgent(agent, promptForAgent);
        previousAgentOutput = output; // This becomes the input for the next agent.

        if (agent.name === 'Coder' || agent.name === 'Patcher') {
          const code = extractCode(output, 'html');
          if (code) {
            this.callbacks.onFinalCode(code);
          }
        }
      } catch (error: any) {
        this.callbacks.onWorkflowError(error, agent);
        return; // Halt workflow on error
      }
    }
    this.callbacks.onWorkflowComplete();
  }

  public async run(projectGoal: string) {
    logger.clear();
    this.agents = AGENTS_CONFIG.map(config => ({
      ...config,
      status: AgentStatus.PENDING,
      input: null,
      output: null,
    }));
    // We need a fresh set of agents in the UI, so clear existing logs and agents
    this.callbacks.onAgentUpdate({} as any); 
    this.agents.forEach(agent => this.callbacks.onAgentUpdate(agent));
    logger.info('Orchestrator', `Starting new generation for goal: "${projectGoal}"`);

    const plannerPrompt = `**Project Goal:**\n${projectGoal}\n\n**Agent:** Planner\n**Task:**\n${AGENTS_CONFIG[0].role}`;
    await this.runWorkflow(plannerPrompt, 'Planner');
  }
  
  public async runRefinement(refinementPrompt: string, existingCode: string) {
    logger.info('Orchestrator', `Starting refinement cycle.`);
    const reviewerPrompt = `**Previous Code:**\n\`\`\`html\n${existingCode}\n\`\`\`\n\n**User's Refinement Request:**\n${refinementPrompt}\n\n**Agent:** Reviewer\n**Task:**\nAnalyze the user's request against the existing code and provide concise, actionable instructions for the Patcher agent.`;
    await this.runWorkflow(reviewerPrompt, 'Reviewer');
  }
  
  public async runDeployment(code: string) {
    const deployer = this.agents.find(a => a.name === 'Deployer');
    if (!deployer) return;

    logger.info('Deployer', 'Starting deployment instructions generation.');
    const prompt = `**Application Code:**\n\`\`\`html\n${code}\n\`\`\`\n\n**Agent:** Deployer\n**Task:**\n${deployer.role}`;
    // Use a separate, simpler execution for single-task agents like Deployer
    try {
        await this.executeAgent(deployer, prompt);
    } catch (error: any) {
        this.callbacks.onWorkflowError(error, deployer);
    }
  }
}
