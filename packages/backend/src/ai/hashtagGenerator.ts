import OpenAI from 'openai';
import { config } from '../config';
import { buildHashtagPrompt } from './prompts';
import { getHashtagsForCategory, getSeasonHashtags } from '@chaiboost/shared';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface HashtagResult {
  hashtags: string[];
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function generateHashtags(params: {
  businessCategory: string;
  caption: string;
  topic?: string;
}): Promise<HashtagResult> {
  // Start with preset hashtags for the category
  const presetHashtags = getHashtagsForCategory(params.businessCategory);
  const seasonalHashtags = getSeasonHashtags();

  const prompt = buildHashtagPrompt(params);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are an Instagram hashtag strategist for food and beverage businesses. ' +
          'You know which hashtags drive discovery vs. which are oversaturated. ' +
          'Focus on hashtags with genuine engagement potential.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"hashtags":[]}';
  const usage = response.usage;

  let parsed: { hashtags: string[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { hashtags: [] };
  }

  // Merge AI-generated with presets, remove duplicates
  const aiHashtags = (parsed.hashtags || []).map((h) => h.replace(/^#/, ''));
  const allHashtags = [...new Set([...aiHashtags, ...presetHashtags.slice(0, 5), ...seasonalHashtags.slice(0, 3)])];

  // Limit to 30 hashtags (Instagram's max)
  const finalHashtags = allHashtags.slice(0, 30).map((h) => (h.startsWith('#') ? h : `#${h}`));

  return {
    hashtags: finalHashtags,
    model: config.openai.model,
    tokens: {
      prompt: usage?.prompt_tokens || 0,
      completion: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    },
  };
}
