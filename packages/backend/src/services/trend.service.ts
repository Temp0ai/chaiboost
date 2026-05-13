import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import { analyzeTrends } from '../ai/trendAnalyzer';
import type { TrendingTopic } from '@chaiboost/shared';

interface TrendScorerInput {
  keyword: string;
  mentionCount: number;
  recentMentionCount: number;
  avgEngagement: number;
  platformCount: number;
  daySpan: number;
}

/**
 * Calculate trend score (0-100)
 *
 * Algorithm:
 * - Volume score (40%): Based on total mentions relative to max
 * - Growth score (30%): Based on recent vs historical mentions
 * - Engagement score (20%): Based on average engagement rate
 * - Cross-platform score (10%): Bonus for appearing on multiple platforms
 */
export function calculateTrendScore(input: TrendScorerInput): number {
  // Volume score: log-scaled mention count (0-40)
  const volumeScore = Math.min(40, (Math.log10(input.mentionCount + 1) / Math.log10(100000)) * 40);

  // Growth score: ratio of recent to total mentions (0-30)
  const growthRatio = input.mentionCount > 0
    ? input.recentMentionCount / input.mentionCount
    : 0;
  const growthScore = Math.min(30, growthRatio * 100);

  // Engagement score: normalized engagement rate (0-20)
  // Typical engagement rates: 1-5% for small businesses
  const engagementScore = Math.min(20, (input.avgEngagement / 10) * 20);

  // Cross-platform bonus (0-10)
  const crossPlatformScore = Math.min(10, (input.platformCount - 1) * 3.33);

  // Time decay: newer trends score higher
  const daysSincePeak = Math.max(0, input.daySpan - 1);
  const timeDecay = Math.max(0.5, 1 - (daysSincePeak * 0.05));

  const rawScore = (volumeScore + growthScore + engagementScore + crossPlatformScore) * timeDecay;
  return Math.round(Math.min(100, Math.max(0, rawScore)));
}

/**
 * Fetch and cache trending topics
 */
export async function refreshTrends(category?: string, platform?: string): Promise<TrendingTopic[]> {
  logger.info('Refreshing trends', { category, platform });

  try {
    // Use AI to analyze current trends
    const aiTrends = await analyzeTrends({ category: category || 'beverage', platform });

    const topics: TrendingTopic[] = [];

    for (const trend of aiTrends.trends) {
      const score = calculateTrendScore({
        keyword: trend.keyword,
        mentionCount: trend.estimatedVolume,
        recentMentionCount: Math.floor(trend.estimatedVolume * trend.growthRate),
        avgEngagement: trend.avgEngagement || 3,
        platformCount: trend.platforms?.length || 1,
        daySpan: 7,
      });

      const id = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h cache

      await query(
        `INSERT INTO trending_topics (id, keyword, category, platform, volume, growth_rate, score, related_hashtags, sample_content, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (keyword, category, platform)
         DO UPDATE SET volume = $5, growth_rate = $6, score = $7, related_hashtags = $8, sample_content = $9, expires_at = $10, created_at = NOW()`,
        [
          id, trend.keyword, category || 'beverage', platform || 'all',
          trend.estimatedVolume, trend.growthRate, score,
          JSON.stringify(trend.relatedHashtags || []),
          JSON.stringify(trend.sampleContent || []),
          expiresAt,
        ]
      );

      topics.push({
        id,
        keyword: trend.keyword,
        category: category || 'beverage',
        platform: platform || 'all',
        volume: trend.estimatedVolume,
        growthRate: trend.growthRate,
        score,
        relatedHashtags: trend.relatedHashtags || [],
        sampleContent: trend.sampleContent || [],
        expiresAt,
        createdAt: new Date(),
      });
    }

    logger.info('Trends refreshed', { count: topics.length, category, platform });
    return topics;
  } catch (error: any) {
    logger.error('Failed to refresh trends', { error: error.message });
    throw error;
  }
}

/**
 * Get cached trending topics
 */
export async function getTrends(
  category?: string,
  platform?: string,
  minScore?: number,
  limit: number = 20
): Promise<TrendingTopic[]> {
  let whereClause = 'WHERE expires_at > NOW()';
  const params: any[] = [];
  let paramIdx = 1;

  if (category) {
    whereClause += ` AND category = $${paramIdx}`;
    params.push(category);
    paramIdx++;
  }

  if (platform) {
    whereClause += ` AND (platform = $${paramIdx} OR platform = 'all')`;
    params.push(platform);
    paramIdx++;
  }

  if (minScore) {
    whereClause += ` AND score >= $${paramIdx}`;
    params.push(minScore);
    paramIdx++;
  }

  const result = await query(
    `SELECT * FROM trending_topics ${whereClause} ORDER BY score DESC LIMIT $${paramIdx}`,
    [...params, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    keyword: row.keyword,
    category: row.category,
    platform: row.platform,
    volume: row.volume,
    growthRate: row.growth_rate,
    score: row.score,
    relatedHashtags: typeof row.related_hashtags === 'string' ? JSON.parse(row.related_hashtags) : row.related_hashtags || [],
    sampleContent: typeof row.sample_content === 'string' ? JSON.parse(row.sample_content) : row.sample_content || [],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
}
