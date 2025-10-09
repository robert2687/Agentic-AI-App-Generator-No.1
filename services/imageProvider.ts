
import { ImageService } from './imageService';
import { GeminiImageService } from './geminiImageService';
import { PlaceholderImageService } from './placeholderImageService';
import { StabilityService } from './stabilityService';
import { GEMINI_API_KEY } from './geminiClient';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const providers: { [key: string]: ImageService } = {
  gemini: new GeminiImageService(),
  stability: new StabilityService(),
  placeholder: new PlaceholderImageService(),
};

// Also export a dedicated placeholder service for explicit use in fallback scenarios.
export const placeholderImageService = providers.placeholder as PlaceholderImageService;

function getActiveProvider(): { name: string; service: ImageService } {
  const preferredProvider = process.env.IMAGE_PROVIDER;

  // If a provider is explicitly chosen, try to use it.
  if (preferredProvider) {
    if (preferredProvider === 'gemini' && GEMINI_API_KEY) {
      return { name: 'gemini', service: providers.gemini };
    }
    if (preferredProvider === 'stability' && STABILITY_API_KEY) {
      return { name: 'stability', service: providers.stability };
    }
    if (preferredProvider === 'placeholder') {
      return { name: 'placeholder', service: providers.placeholder };
    }
    // If chosen provider is invalid or its key is missing, log a warning and fall through.
    console.warn(
      `IMAGE_PROVIDER set to '${preferredProvider}', but it's not available or configured. Falling back to default.`
    );
  }

  // Fallback / default provider logic.
  if (GEMINI_API_KEY) return { name: 'gemini', service: providers.gemini };
  if (STABILITY_API_KEY) return { name: 'stability', service: providers.stability };
  
  return { name: 'placeholder', service: providers.placeholder };
}

const activeProviderInfo = getActiveProvider();
export const activeImageProvider = activeProviderInfo.service;
export const activeImageProviderName = activeProviderInfo.name;

console.log(`Using '${activeImageProviderName}' as the active image provider.`);
