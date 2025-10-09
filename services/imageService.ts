// This file defines the common interface for any image generation service.

export interface ImageGenerationResult {
  /** The base64-encoded image data, without the 'data:mime/type;base64,' prefix. */
  base64: string;
  /** The IANA mime type, e.g., 'image/png' or 'image/svg+xml'. */
  mimeType: string;
  /** The prompt that was used to generate the image. */
  prompt: string;
}

export interface ImageService {
  /**
   * Generates an image based on a text prompt.
   * @param prompt The text prompt to generate an image from.
   * @param options Optional provider-specific parameters (e.g., aspectRatio).
   * @returns A promise that resolves to an ImageGenerationResult object.
   */
  generateImage(prompt: string, options?: Record<string, any>): Promise<ImageGenerationResult>;
}
