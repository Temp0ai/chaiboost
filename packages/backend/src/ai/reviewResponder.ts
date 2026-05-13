import OpenAI from 'openai';
import { config } from '../config';
import { buildReviewResponsePrompt } from './prompts';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface ReviewResponseResult {
  text: string;
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function generateReviewResponse(params: {
  reviewText: string;
  rating: number | null;
  authorName: string;
  businessName: string;
  businessCategory: string;
  sentiment: string | null;
  tone: string;
  customInstructions?: string;
}): Promise<ReviewResponseResult> {
  const prompt = buildReviewResponsePrompt(params);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a customer relations specialist for food and beverage businesses. ' +
          'You write empathetic, authentic review responses that build customer loyalty. ' +
          'Never be defensive. Always find something positive to acknowledge. ' +
          'Keep responses concise but warm.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content || '';
  const usage = response.usage;

  return {
    text: text.trim(),
    model: config.openai.model,
    tokens: {
      prompt: usage?.prompt_tokens || 0,
      completion: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    },
  };
}
