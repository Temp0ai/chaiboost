import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generateReviewResponse } from '../ai/reviewResponder';
import { logAIUsage } from './ai.service';
import type { Review, ReviewSentiment } from '@chaiboost/shared';

/**
 * Sync reviews from connected platforms
 */
export async function syncReviews(businessId: string): Promise<number> {
  const platforms = await query(
    "SELECT * FROM connected_platforms WHERE business_id = $1 AND is_active = true AND platform IN ('google_my_business', 'instagram')",
    [businessId]
  );

  let syncedCount = 0;

  for (const platform of platforms.rows) {
    try {
      if (platform.platform === 'google_my_business') {
        // GMB reviews are synced via the GMB service
        // This would call gmbService.listReviews() and upsert results
        logger.info('GMB review sync queued', { businessId });
      }
    } catch (error: any) {
      logger.error('Review sync failed', { businessId, platform: platform.platform, error: error.message });
    }
  }

  return syncedCount;
}

/**
 * List reviews for a business
 */
export async function listReviews(
  businessId: string,
  page: number = 1,
  limit: number = 20,
  platform?: string,
  sentiment?: string
): Promise<{ items: Review[]; total: number }> {
  let whereClause = 'WHERE business_id = $1';
  const params: any[] = [businessId];
  let paramIdx = 2;

  if (platform) {
    whereClause += ` AND platform = $${paramIdx}`;
    params.push(platform);
    paramIdx++;
  }

  if (sentiment) {
    whereClause += ` AND sentiment = $${paramIdx}`;
    params.push(sentiment);
    paramIdx++;
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM reviews ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const offset = (page - 1) * limit;
  const itemsResult = await query(
    `SELECT * FROM reviews ${whereClause} ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  return { items: itemsResult.rows.map(mapReview), total };
}

/**
 * Get a single review
 */
export async function getReviewById(reviewId: string, businessId: string): Promise<Review | null> {
  const result = await query(
    'SELECT * FROM reviews WHERE id = $1 AND business_id = $2',
    [reviewId, businessId]
  );
  return result.rows.length > 0 ? mapReview(result.rows[0]) : null;
}

/**
 * Generate AI response for a review
 */
export async function respondToReview(
  userId: string,
  businessId: string,
  reviewId: string,
  tone: 'professional' | 'friendly' | 'apologetic' = 'professional',
  customInstructions?: string
): Promise<{ response: string; reviewId: string }> {
  // Get review
  const reviewResult = await query(
    'SELECT r.*, b.name as business_name, b.category FROM reviews r JOIN businesses b ON r.business_id = b.id WHERE r.id = $1 AND r.business_id = $2',
    [reviewId, businessId]
  );

  if (reviewResult.rows.length === 0) {
    throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review not found');
  }

  const review = reviewResult.rows[0];
  const startTime = Date.now();

  try {
    const result = await generateReviewResponse({
      reviewText: review.text,
      rating: review.rating,
      authorName: review.author_name,
      businessName: review.business_name,
      businessCategory: review.category,
      sentiment: review.sentiment,
      tone,
      customInstructions,
    });

    // Save the AI response
    await query(
      'UPDATE reviews SET ai_response = $1, responded_at = NOW(), updated_at = NOW() WHERE id = $2',
      [result.text, reviewId]
    );

    await logAIUsage(userId, businessId, 'review_response', result.model, result.tokens, Date.now() - startTime, true);

    logger.info('AI review response generated', { reviewId, tone });
    return { response: result.text, reviewId };
  } catch (error: any) {
    await logAIUsage(userId, businessId, 'review_response', 'unknown', { prompt: 0, completion: 0, total: 0 }, Date.now() - startTime, false, error.message);
    throw error;
  }
}

/**
 * Mark review as read
 */
export async function markAsRead(reviewId: string, businessId: string): Promise<void> {
  await query(
    'UPDATE reviews SET is_read = true, updated_at = NOW() WHERE id = $1 AND business_id = $2',
    [reviewId, businessId]
  );
}

/**
 * Analyze sentiment of review text (simple rule-based + keyword approach)
 */
export function analyzeSentiment(text: string, rating?: number): { sentiment: ReviewSentiment; score: number } {
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'wonderful', 'perfect', 'delicious', 'friendly', 'recommend', 'awesome', 'outstanding', 'fresh', 'cozy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'rude', 'cold', 'stale', 'dirty', 'slow', 'disappointed', 'never', 'waste', 'disgusting', 'unfriendly'];

  const lowerText = text.toLowerCase();
  let score = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) score += 0.15;
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score -= 0.15;
  }

  // Factor in star rating
  if (rating) {
    score += (rating - 3) * 0.2; // -0.4 to +0.4
  }

  // Clamp to [-1, 1]
  score = Math.max(-1, Math.min(1, score));

  let sentiment: ReviewSentiment;
  if (score > 0.15) sentiment = 'positive';
  else if (score < -0.15) sentiment = 'negative';
  else sentiment = 'neutral';

  return { sentiment, score: Math.round(score * 100) / 100 };
}

/**
 * Upsert a review from external platform
 */
export async function upsertReview(businessId: string, data: {
  platform: string;
  platformReviewId: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating?: number;
  text: string;
  metadata?: Record<string, any>;
}): Promise<Review> {
  const { sentiment, score } = analyzeSentiment(data.text, data.rating);

  const result = await query(
    `INSERT INTO reviews (id, business_id, platform, platform_review_id, author_name, author_avatar_url, rating, text, sentiment, sentiment_score, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (business_id, platform, platform_review_id)
     DO UPDATE SET text = $8, rating = $7, sentiment = $9, sentiment_score = $10, updated_at = NOW()
     RETURNING *`,
    [
      uuidv4(), businessId, data.platform, data.platformReviewId,
      data.authorName, data.authorAvatarUrl || null, data.rating || null,
      data.text, sentiment, score, JSON.stringify(data.metadata || {}),
    ]
  );

  return mapReview(result.rows[0]);
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    businessId: row.business_id,
    platform: row.platform,
    platformReviewId: row.platform_review_id,
    authorName: row.author_name,
    authorAvatarUrl: row.author_avatar_url,
    rating: row.rating,
    text: row.text,
    sentiment: row.sentiment,
    sentimentScore: row.sentiment_score,
    aiResponse: row.ai_response,
    respondedAt: row.responded_at,
    isRead: row.is_read,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
