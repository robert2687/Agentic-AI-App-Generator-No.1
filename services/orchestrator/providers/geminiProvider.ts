import { GenerateContentResponse } from "@google/genai";
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
        model: "gemini-2.5-flash",
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
      // Re-throw a more user-friendly error to be caught by the orchestrator.
      throw new Error("Failed to get a response from the Gemini API. Check your API key, billing, and network connection.");
    }
  }
}

export const geminiProvider = new GeminiProvider();
