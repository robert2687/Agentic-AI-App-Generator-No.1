
import { ImageService } from './imageService';
import { GeminiImageService } from './geminiImageService';
import { PlaceholderImageService } from './placeholderImageService';
import { API_KEY } from './geminiClient';

const providers: { [key: string]: ImageService } = {
  gemini: new GeminiImageService(),
  placeholder: new PlaceholderImageService(),
  // In the future, other providers like 'stability' could be added here.
};

// Determine the default provider. Use Gemini if an API key is available, otherwise fall back to placeholders.
const defaultProviderKey = API_KEY ? 'gemini' : 'placeholder';

// Select the active provider based on environment variable or the default.
// This allows overriding the image generation service for testing or other purposes.
const activeProviderKey = process.env.IMAGE_PROVIDER || defaultProviderKey;

export const activeImageProvider: ImageService = providers[activeProviderKey] || providers.placeholder;

// Also export a dedicated placeholder service for explicit use in fallback scenarios.
export const placeholderImageService = new PlaceholderImageService();

console.log(`Using '${activeProviderKey}' as the active image provider.`);
