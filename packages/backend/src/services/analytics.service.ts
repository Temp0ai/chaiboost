import { query } from '../config/database';
import { logger } from '../utils/logger';
import type { AnalyticsSnapshot, AnalyticsOverview, ContentPerformance, GrowthDataPoint } from '@chaiboost/shared';

/**
 * Save an analytics snapshot
 */
export async function saveSnapshot(businessId: string, platform: string, data: Partial<AnalyticsSnapshot>): Promise<void> {
  await query(
    `INSERT INTO analytics_snapshots (id, business_id, platform, snapshot_date, followers_count, following_count, posts_count, engagement_rate, impressions, reach, profile_views, website_clicks, top_post_ids, metadata)
     VALUES (gen_random_uuid(), $1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (business_id, platform, snapshot_date)
     DO UPDATE SET followers_count = $3, following_count = $4, posts_count = $5, engagement_rate = $6, impressions = $7, reach = $8, profile_views = $9, website_clicks = $10, top_post_ids = $11, metadata = $12`,
    [
      businessId, platform,
      data.followersCount || 0,
      data.followingCount || 0,
      data.postsCount || 0,
      data.engagementRate || 0,
      data.impressions || 0,
      data.reach || 0,
      data.profileViews || 0,
      data.websiteClicks || 0,
      JSON.stringify(data.topPostIds || []),
      JSON.stringify(data.metadata || {}),
    ]
  );
}

/**
 * Get analytics overview for a business
 */
export async function getOverview(businessId: string, days: number = 30): Promise<AnalyticsOverview> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  // Current period
  const currentResult = await query(
    `SELECT
       COALESCE(MAX(followers_count), 0) as total_followers,
       COALESCE(SUM(impressions), 0) as total_impressions,
       COALESCE(SUM(reach), 0) as total_reach,
       COALESCE(AVG(engagement_rate), 0) as avg_engagement,
       COUNT(DISTINCT snapshot_date) as snapshot_count
     FROM analytics_snapshots
     WHERE business_id = $1 AND snapshot_date >= $2`,
    [businessId, startDate.toISOString().split('T')[0]]
  );

  // Previous period
  const prevResult = await query(
    `SELECT
       COALESCE(MAX(followers_count), 0) as total_followers,
       COALESCE(SUM(impressions), 0) as total_impressions,
       COALESCE(AVG(engagement_rate), 0) as avg_engagement
     FROM analytics_snapshots
     WHERE business_id = $1 AND snapshot_date >= $2 AND snapshot_date < $3`,
    [businessId, prevStartDate.toISOString().split('T')[0], startDate.toISOString().split('T')[0]]
  );

  // Posts count
  const postsResult = await query(
    `SELECT COUNT(*) as total, COUNT(CASE WHEN created_at >= $2 THEN 1 END) as this_month
     FROM content_pieces cp JOIN businesses b ON cp.business_id = b.id
     WHERE b.id = $1`,
    [businessId, startDate.toISOString()]
  );

  // Top performing post
  const topPostResult = await query(
    `SELECT cp.id as content_id, cp.caption, cp.image_url,
       COALESCE((cp.metadata->>'likes')::int, 0) as likes,
       COALESCE((cp.metadata->>'comments')::int, 0) as comments,
       COALESCE((cp.metadata->>'shares')::int, 0) as shares,
       COALESCE((cp.metadata->>'impressions')::int, 0) as impressions,
       COALESCE((cp.metadata->>'reach')::int, 0) as reach,
       COALESCE((cp.metadata->>'engagement_rate')::float, 0) as engagement_rate,
       cp.created_at as published_at
     FROM content_pieces cp
     WHERE cp.business_id = $1 AND cp.status = 'published'
     ORDER BY (COALESCE((cp.metadata->>'likes')::int, 0) + COALESCE((cp.metadata->>'comments')::int, 0)) DESC
     LIMIT 1`,
    [businessId]
  );

  // Growth data points
  const growthResult = await query(
    `SELECT snapshot_date::text as date, followers_count as followers, engagement_rate as engagement, posts_count as posts
     FROM analytics_snapshots
     WHERE business_id = $1 AND snapshot_date >= $2
     ORDER BY snapshot_date ASC`,
    [businessId, startDate.toISOString().split('T')[0]]
  );

  const current = currentResult.rows[0];
  const prev = prevResult.rows[0];
  const posts = postsResult.rows[0];

  const totalFollowers = parseInt(current.total_followers, 10);
  const prevFollowers = parseInt(prev.total_followers, 10);
  const totalImpressions = parseInt(current.total_impressions, 10);
  const prevImpressions = parseInt(prev.total_impressions, 10);
  const avgEngagement = parseFloat(current.avg_engagement);
  const prevEngagement = parseFloat(prev.avg_engagement);

  const topPost = topPostResult.rows[0] || null;

  return {
    totalFollowers,
    followersChange: prevFollowers > 0 ? ((totalFollowers - prevFollowers) / prevFollowers) * 100 : 0,
    totalPosts: parseInt(posts.total, 10),
    postsThisMonth: parseInt(posts.this_month, 10),
    averageEngagement: Math.round(avgEngagement * 100) / 100,
    engagementChange: prevEngagement > 0 ? ((avgEngagement - prevEngagement) / prevEngagement) * 100 : 0,
    totalImpressions,
    impressionsChange: prevImpressions > 0 ? ((totalImpressions - prevImpressions) / prevImpressions) * 100 : 0,
    topPerformingPost: topPost ? {
      contentId: topPost.content_id,
      caption: topPost.caption?.substring(0, 100) || '',
      imageUrl: topPost.image_url,
      likes: parseInt(topPost.likes, 10),
      comments: parseInt(topPost.comments, 10),
      shares: parseInt(topPost.shares, 10),
      impressions: parseInt(topPost.impressions, 10),
      reach: parseInt(topPost.reach, 10),
      engagementRate: parseFloat(topPost.engagement_rate),
      publishedAt: topPost.published_at,
    } : null,
    recentGrowth: growthResult.rows.map((row) => ({
      date: row.date,
      followers: parseInt(row.followers, 10),
      engagement: parseFloat(row.engagement),
      posts: parseInt(row.posts, 10),
    })),
  };
}

/**
 * Get content performance list
 */
export async function getContentPerformance(
  businessId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ items: ContentPerformance[]; total: number }> {
  const countResult = await query(
    "SELECT COUNT(*) as total FROM content_pieces WHERE business_id = $1 AND status = 'published'",
    [businessId]
  );

  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT id as content_id, caption, image_url,
       COALESCE((metadata->>'likes')::int, 0) as likes,
       COALESCE((metadata->>'comments')::int, 0) as comments,
       COALESCE((metadata->>'shares')::int, 0) as shares,
       COALESCE((metadata->>'impressions')::int, 0) as impressions,
       COALESCE((metadata->>'reach')::int, 0) as reach,
       COALESCE((metadata->>'engagement_rate')::float, 0) as engagement_rate,
       created_at as published_at
     FROM content_pieces
     WHERE business_id = $1 AND status = 'published'
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [businessId, limit, offset]
  );

  return {
    items: result.rows.map((row) => ({
      contentId: row.content_id,
      caption: row.caption?.substring(0, 100) || '',
      imageUrl: row.image_url,
      likes: parseInt(row.likes, 10),
      comments: parseInt(row.comments, 10),
      shares: parseInt(row.shares, 10),
      impressions: parseInt(row.impressions, 10),
      reach: parseInt(row.reach, 10),
      engagementRate: parseFloat(row.engagement_rate),
      publishedAt: row.published_at,
    })),
    total: parseInt(countResult.rows[0].total, 10),
  };
}
