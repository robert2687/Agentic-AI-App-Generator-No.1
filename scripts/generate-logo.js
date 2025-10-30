
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI(GEMINI_API_KEY);

const PROMPT = `a minimalist and professional logo for an 'Agentic AI App Generator.' The logo should represent the concepts of AI, automation, and application development. It needs to be clean, modern, and suitable for a tech product.

- **Color Palette**: Use a trustworthy and modern color palette. Primary color should be a shade of blue (e.g., #2563eb). Accents can be in a slightly lighter blue or a neutral gray.
- **Style**: Flat, vector-style. No gradients or complex shadows.
- **Elements**: Could incorporate subtle representations of a circuit, a gear, a stylized 'A', or a spark of creation. The elements should be abstract and not overly literal.
- **Background**: The final image must have a transparent background.
- **Composition**: The logo should be well-balanced and legible at small sizes. An icon/symbol on the left and the text 'Agentic' on the right would be a good composition.
`;

async function generateLogo() {
  console.log("Generating logo with prompt:", PROMPT);

  try {
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: PROMPT,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    const imageData = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (!imageData) {
      throw new Error("Invalid response from Imagen API. No image data received.");
    }

    const outputPath = path.join(process.cwd(), 'public', 'logo.png');
    
    // Ensure the /public directory exists
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));

    console.log(`Logo successfully generated and saved to ${outputPath}`);

  } catch (error) {
    console.error("Error generating logo:", error);
    process.exit(1);
  }
}

generateLogo();
