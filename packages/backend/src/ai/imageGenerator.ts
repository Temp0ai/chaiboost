import OpenAI from 'openai';
import { config } from '../config';
import { buildImagePrompt } from './prompts';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface ImageResult {
  url: string;
  revisedPrompt: string;
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function generateImage(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  style: string;
  brandColors?: { primary: string; secondary: string; accent: string };
}): Promise<ImageResult> {
  const prompt = buildImagePrompt(params);

  const response = await openai.images.generate({
    model: config.openai.imageModel,
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    response_format: 'url',
  });

  const image = response.data?.[0];

  return {
    url: image?.url ?? '',
    revisedPrompt: image?.revised_prompt || prompt,
    model: config.openai.imageModel,
    tokens: { prompt: 0, completion: 0, total: 0 }, // DALL-E doesn't report tokens
  };
}

/**
 * Generate image variations from an existing image
 */
export async function generateImageVariation(
  imageUrl: string,
  numVariations: number = 3
): Promise<string[]> {
  // Download the source image
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  // Create a File-like object for the API
  const file = new File([buffer], 'source.png', { type: 'image/png' });

  const result = await openai.images.createVariation({
    image: file,
    n: Math.min(numVariations, 4),
    size: '1024x1024',
    response_format: 'url',
  });

  return (result.data ?? []).map((img) => img.url ?? '');
}
