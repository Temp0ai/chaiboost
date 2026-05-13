import OpenAI from 'openai';
import { config } from '../config';
import { buildVideoStoryboardPrompt } from './prompts';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface VideoPlanResult {
  storyboard: {
    scenes: Array<{
      order: number;
      duration: number;
      description: string;
      text: string | null;
      animation: string | null;
    }>;
    totalDuration: number;
    music: string;
    transitions: string[];
  };
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function generateVideoPlan(params: {
  businessName: string;
  businessCategory: string;
  topic: string;
  duration: number;
}): Promise<VideoPlanResult> {
  const prompt = buildVideoStoryboardPrompt(params);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a video production expert specializing in short-form social media content for food and beverage brands. You create detailed, actionable storyboards optimized for Instagram Reels and TikTok.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  const usage = response.usage;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {
      scenes: [{ order: 1, duration: params.duration, description: 'Product showcase', text: null, animation: null }],
      totalDuration: params.duration,
      music: 'Upbeat ambient',
      transitions: ['fade'],
    };
  }

  return {
    storyboard: {
      scenes: parsed.scenes || [],
      totalDuration: parsed.totalDuration || params.duration,
      music: parsed.music || 'Ambient',
      transitions: parsed.transitions || ['cut'],
    },
    model: config.openai.model,
    tokens: {
      prompt: usage?.prompt_tokens || 0,
      completion: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    },
  };
}
