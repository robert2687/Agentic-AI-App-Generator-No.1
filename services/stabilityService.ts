import { ImageService, ImageGenerationResult } from "./imageService";

export class StabilityService implements ImageService {
  async generateImage(prompt: string, options: Record<string, any> = {}): Promise<ImageGenerationResult> {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      throw new Error("Stability API key (STABILITY_API_KEY) not found.");
    }

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        // For simplicity, we'll stick to a 1:1 ratio as it's the most common for logos/icons.
        // The service can be expanded later to support more aspect ratios from the `options`.
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Stability AI API error (${response.status}): ${errorBody}`);
    }
    
    const data = await response.json() as any;

    if (!data.artifacts?.[0]?.base64) {
        throw new Error("Invalid response from Stability AI API: no image artifact found.");
    }
    
    return {
      base64: data.artifacts[0].base64,
      mimeType: 'image/png',
      prompt: prompt,
    };
  }
}
