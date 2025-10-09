
import { GoogleGenAI } from "@google/genai";

export const GEMINI_API_KEY = process.env.API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("API_KEY environment variable not set. Using mocked responses for text generation.");
}

// Use the correct `GoogleGenAI` export. `GoogleGenerativeAI` is deprecated.
export const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * A utility function to retry an async API call with exponential backoff.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @returns The result of the API call.
 */
export const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let attempt = 0;
    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            // Check if the error indicates a model overload (e.g., 503)
            const isOverloaded = error.message && (error.message.includes('"code": 503') || error.message.includes('"status": "UNAVAILABLE"'));

            if (isOverloaded && attempt < maxRetries) {
                attempt++;
                // Exponential backoff with jitter
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`Model overloaded. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Re-throw if it's not a retryable error or if max retries are reached
                throw error;
            }
        }
    }
};