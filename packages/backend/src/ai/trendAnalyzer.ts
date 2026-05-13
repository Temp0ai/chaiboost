import OpenAI from 'openai';
import { config } from '../config';
import { buildTrendAnalysisPrompt } from './prompts';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

interface TrendAnalysisResult {
  trends: Array<{
    keyword: string;
    estimatedVolume: number;
    growthRate: number;
    avgEngagement: number;
    platforms: string[];
    relatedHashtags: string[];
    sampleContent: string[];
  }>;
  model: string;
  tokens: { prompt: number; completion: number; total: number };
}

export async function analyzeTrends(params: {
  category: string;
  platform?: string;
}): Promise<TrendAnalysisResult> {
  const prompt = buildTrendAnalysisPrompt(params);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: 'You are a social media trend analyst specializing in the food and beverage industry. ' +
          'You have deep knowledge of platform algorithms, hashtag performance, and content virality patterns. ' +
          'Provide data-driven, actionable trend insights.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"trends":[]}';
  const usage = response.usage;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { trends: [] };
  }

  return {
    trends: (parsed.trends || []).map((t: any) => ({
      keyword: t.keyword || '',
      estimatedVolume: t.estimatedVolume || 0,
      growthRate: t.growthRate || 0,
      avgEngagement: t.avgEngagement || 0,
      platforms: t.platforms || ['instagram'],
      relatedHashtags: t.relatedHashtags || [],
      sampleContent: t.sampleContent || [],
    })),
    model: config.openai.model,
    tokens: {
      prompt: usage?.prompt_tokens || 0,
      completion: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0,
    },
  };
}
