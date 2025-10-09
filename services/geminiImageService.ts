
import { ImageService, ImageGenerationResult } from './imageService';
import { ai, withRetry } from './geminiClient';

export class GeminiImageService implements ImageService {
  async generateImage(prompt: string, options: Record<string, any> = {}): Promise<ImageGenerationResult> {
    if (!ai) {
      throw new Error("Gemini API client not initialized. Check API_KEY.");
    }

    const imageResponse: any = await withRetry(() => ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: { 
        numberOfImages: 1, 
        outputMimeType: 'image/png', 
        aspectRatio: options.aspectRatio || '1:1',
      },
    }));

    if (!imageResponse.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("Invalid response from Imagen API. The response may be missing image data.");
    }

    return {
      base64: imageResponse.generatedImages[0].image.imageBytes,
      mimeType: 'image/png',
      prompt: prompt,
    };
  }
}
