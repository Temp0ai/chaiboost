import OpenAI from 'openai';
import { config } from '../config';
import { CAPTION_SYSTEM_PROMPT, buildCaptionPrompt } from './prompts';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface CaptionResult {
  text: string;
  suggestions: string[];
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function generateCaption(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  tone: string;
  language: string;
  customPrompt?: string;
  brandDescription?: string;
  toneOfVoice?: string;
}): Promise<CaptionResult> {
  const userPrompt = buildCaptionPrompt(params);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: CAPTION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '';
  const usage = response.usage;

  let parsed: { caption: string; suggestions: string[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    // Fallback: treat entire response as caption
    parsed = { caption: content, suggestions: [] };
  }

  return {
    text: parsed.caption,
    suggestions: parsed.suggestions || [],
    model: config.openai.model,
    tokens: {
      prompt: usage?.prompt_tokens || 0,
      completion: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    },
  };
}
