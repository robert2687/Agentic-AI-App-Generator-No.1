
import { ImageService, ImageGenerationResult } from './imageService';
import { generateMockLogoBase64, generateMockFaviconBase64 } from './placeholderUtils';

export class PlaceholderImageService implements ImageService {
  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    // A simple heuristic to decide whether to return a logo or a favicon.
    const isFavicon = prompt.toLowerCase().includes('favicon');
    
    const base64 = isFavicon ? generateMockFaviconBase64() : generateMockLogoBase64();

    return Promise.resolve({
      base64,
      mimeType: 'image/svg+xml',
      prompt: prompt,
    });
  }
}
