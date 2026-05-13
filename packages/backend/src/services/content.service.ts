import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generateCaption } from '../ai/captionGenerator';
import { generateImage } from '../ai/imageGenerator';
import { generateVideoPlan } from '../ai/videoPlanner';
import { generateHashtags } from '../ai/hashtagGenerator';
import { logAIUsage } from './ai.service';
import type { ContentPiece, GenerateContentRequest, GenerateContentResponse } from '@chaiboost/shared';

export async function generateContent(
  userId: string,
  businessId: string,
  req: GenerateContentRequest
): Promise<GenerateContentResponse> {
  // Verify business ownership
  const bizResult = await query('SELECT * FROM businesses WHERE id = $1 AND user_id = $2', [businessId, userId]);
  if (bizResult.rows.length === 0) {
    throw new AppError(404, 'BUSINESS_NOT_FOUND', 'Business not found');
  }
  const business = bizResult.rows[0];
  const contentId = uuidv4();

  let caption: string | null = null;
  let hashtags: string[] = [];
  let imageUrl: string | null = null;
  let videoStoryboard: unknown | null = null;
  const suggestions: string[] = [];

  const startTime = Date.now();

  try {
    // Generate caption
    if (req.type === 'caption' || req.type === 'story' || req.type === 'carousel') {
      const captionResult = await generateCaption({
        businessName: business.name,
        businessCategory: business.category,
        topic: req.topic || 'general beverage promotion',
        tone: req.tone || 'casual',
        language: req.language || 'en',
        customPrompt: req.customPrompt,
        brandDescription: business.description,
        toneOfVoice: business.tone_of_voice,
      });
      caption = captionResult.text;
      suggestions.push(...captionResult.suggestions);

      await logAIUsage(userId, businessId, 'caption', captionResult.model, captionResult.tokens, Date.now() - startTime, true);
    }

    // Generate hashtags
    if (req.includeHashtags) {
      const hashtagResult = await generateHashtags({
        businessCategory: business.category,
        caption: caption || '',
        topic: req.topic,
      });
      hashtags = hashtagResult.hashtags;

      await logAIUsage(userId, businessId, 'hashtag', hashtagResult.model, hashtagResult.tokens, Date.now() - startTime, true);
    }

    // Generate image
    if (req.includeImage || req.type === 'image') {
      const imageResult = await generateImage({
        businessName: business.name,
        businessCategory: business.category,
        topic: req.topic || 'beverage product photo',
        style: 'professional product photography',
        brandColors: business.brand_colors ? JSON.parse(business.brand_colors) : undefined,
      });
      imageUrl = imageResult.url;

      await logAIUsage(userId, businessId, 'image', imageResult.model, imageResult.tokens, Date.now() - startTime, true);
    }

    // Generate video storyboard
    if (req.type === 'video') {
      const videoResult = await generateVideoPlan({
        businessName: business.name,
        businessCategory: business.category,
        topic: req.topic || 'product showcase',
        duration: 30,
      });
      videoStoryboard = videoResult.storyboard;

      await logAIUsage(userId, businessId, 'video', videoResult.model, videoResult.tokens, Date.now() - startTime, true);
    }

    // Save content piece
    await query(
      `INSERT INTO content_pieces (id, business_id, type, status, caption, hashtags, image_url, image_prompt, video_storyboard, tone, language, ai_model, metadata)
       VALUES ($1, $2, $3, 'generated', $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        contentId,
        businessId,
        req.type,
        caption,
        JSON.stringify(hashtags),
        imageUrl,
        req.topic || null,
        videoStoryboard ? JSON.stringify(videoStoryboard) : null,
        req.tone || 'casual',
        req.language || 'en',
        'gpt-4o',
        JSON.stringify({ customPrompt: req.customPrompt }),
      ]
    );

    return { contentId, caption, hashtags, imageUrl, videoStoryboard, suggestions };
  } catch (error: any) {
    await logAIUsage(userId, businessId, req.type, 'unknown', { prompt: 0, completion: 0, total: 0 }, Date.now() - startTime, false, error.message);
    throw error;
  }
}

export async function getContentById(contentId: string, userId: string): Promise<ContentPiece | null> {
  const result = await query(
    `SELECT cp.* FROM content_pieces cp
     JOIN businesses b ON cp.business_id = b.id
     WHERE cp.id = $1 AND b.user_id = $2`,
    [contentId, userId]
  );

  if (result.rows.length === 0) return null;
  return mapContentPiece(result.rows[0]);
}

export async function listContent(
  userId: string,
  businessId: string,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{ items: ContentPiece[]; total: number }> {
  let whereClause = 'WHERE b.user_id = $1 AND cp.business_id = $2';
  const params: any[] = [userId, businessId];

  if (status) {
    whereClause += ' AND cp.status = $3';
    params.push(status);
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM content_pieces cp
     JOIN businesses b ON cp.business_id = b.id
     ${whereClause}`,
    params
  );

  const offset = (page - 1) * limit;
  const itemsResult = await query(
    `SELECT cp.* FROM content_pieces cp
     JOIN businesses b ON cp.business_id = b.id
     ${whereClause}
     ORDER BY cp.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows.map(mapContentPiece),
    total: parseInt(countResult.rows[0].total, 10),
  };
}

export async function updateContentStatus(contentId: string, userId: string, status: string): Promise<ContentPiece> {
  const result = await query(
    `UPDATE content_pieces cp SET status = $1, updated_at = NOW()
     FROM businesses b WHERE cp.business_id = b.id AND cp.id = $2 AND b.user_id = $3
     RETURNING cp.*`,
    [status, contentId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'NOT_FOUND', 'Content not found');
  }

  return mapContentPiece(result.rows[0]);
}

export async function deleteContent(contentId: string, userId: string): Promise<void> {
  const result = await query(
    `DELETE FROM content_pieces cp USING businesses b
     WHERE cp.business_id = b.id AND cp.id = $1 AND b.user_id = $2
     RETURNING cp.id`,
    [contentId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'NOT_FOUND', 'Content not found');
  }
}

function mapContentPiece(row: any): ContentPiece {
  return {
    id: row.id,
    businessId: row.business_id,
    type: row.type,
    status: row.status,
    title: row.title,
    caption: row.caption,
    hashtags: typeof row.hashtags === 'string' ? JSON.parse(row.hashtags) : row.hashtags || [],
    imageUrl: row.image_url,
    imagePrompt: row.image_prompt,
    videoUrl: row.video_url,
    videoStoryboard: row.video_storyboard ? (typeof row.video_storyboard === 'string' ? JSON.parse(row.video_storyboard) : row.video_storyboard) : null,
    platform: row.platform,
    platformPostId: row.platform_post_id,
    tone: row.tone,
    language: row.language,
    aiModel: row.ai_model,
    aiPromptUsed: row.ai_prompt_used,
    generationCost: row.generation_cost,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
