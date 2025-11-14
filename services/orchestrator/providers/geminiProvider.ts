import { GenerateContentResponse, GoogleGenerativeAIError } from "@google/genai";
import { ai, withRetry } from '../../geminiClient';
import type { Provider } from '../types';

class GeminiProvider implements Provider {
  public readonly name = 'gemini';

  async call(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    if (!ai) {
      throw new Error("Gemini provider is not available. Check API Key.");
    }

    try {
      const stream: AsyncIterable<GenerateContentResponse> = await withRetry(() => ai.models.generateContentStream({
        model: "gemini-1.5-pro",
        contents: prompt,
      }));
      
      let fullOutput = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullOutput += chunkText;
          onChunk(chunkText);
        }
      }
      return fullOutput;
    } catch (error) {
      console.error("Gemini API call failed:", error);
      if (error instanceof GoogleGenerativeAIError) {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
      // Re-throw a more user-friendly error to be caught by the orchestrator.
      throw new Error("Failed to get a response from the Gemini API. Check your API key, billing, and network connection.");
    }
  }
}

export const geminiProvider = new GeminiProvider();
