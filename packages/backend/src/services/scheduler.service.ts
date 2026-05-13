import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { query } from '../config/database';
import { logger } from '../utils/logger';
import * as instagramService from './instagram.service';
import { v4 as uuidv4 } from 'uuid';

const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  maxRetriesPerRequest: null,
});

export const publishQueue = new Queue('publish-posts', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Worker to process scheduled posts
const publishWorker = new Worker(
  'publish-posts',
  async (job: Job) => {
    const { scheduledPostId, contentId, businessId, platform } = job.data;

    logger.info('Processing scheduled post', { scheduledPostId, platform });

    try {
      // Update status to processing
      await query(
        "UPDATE scheduled_posts SET status = 'processing', updated_at = NOW() WHERE id = $1",
        [scheduledPostId]
      );

      // Get content
      const contentResult = await query('SELECT * FROM content_pieces WHERE id = $1', [contentId]);
      if (contentResult.rows.length === 0) {
        throw new Error(`Content not found: ${contentId}`);
      }
      const content = contentResult.rows[0];

      // Get connected platform
      const platformResult = await query(
        'SELECT * FROM connected_platforms WHERE business_id = $1 AND platform = $2 AND is_active = true',
        [businessId, platform]
      );
      if (platformResult.rows.length === 0) {
        throw new Error(`No active ${platform} connection for business ${businessId}`);
      }
      const connectedPlatform = platformResult.rows[0];

      let platformPostId: string | null = null;

      if (platform === 'instagram') {
        if (content.image_url) {
          const result = await instagramService.publishImagePost(
            connectedPlatform.access_token,
            connectedPlatform.platform_user_id,
            content.image_url,
            content.caption || ''
          );
          platformPostId = result.postId;
        } else {
          throw new Error('Instagram posts require an image');
        }
      }

      // Update scheduled post status
      await query(
        `UPDATE scheduled_posts SET status = 'published', published_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [scheduledPostId]
      );

      // Update content piece
      await query(
        `UPDATE content_pieces SET status = 'published', platform = $1, platform_post_id = $2, updated_at = NOW() WHERE id = $3`,
        [platform, platformPostId, contentId]
      );

      logger.info('Post published successfully', { scheduledPostId, platform, platformPostId });
      return { success: true, platformPostId };
    } catch (error: any) {
      // Update with error
      await query(
        `UPDATE scheduled_posts SET status = 'failed', error_message = $1, retry_count = retry_count + 1, updated_at = NOW() WHERE id = $2`,
        [error.message, scheduledPostId]
      );

      logger.error('Post publishing failed', { scheduledPostId, error: error.message });
      throw error;
    }
  },
  { connection, concurrency: 5 }
);

publishWorker.on('completed', (job) => {
  logger.debug('Publish job completed', { jobId: job.id });
});

publishWorker.on('failed', (job, err) => {
  logger.error('Publish job failed', { jobId: job?.id, error: err.message });
});

/**
 * Schedule a post for future publishing
 */
export async function schedulePost(
  contentId: string,
  businessId: string,
  platform: string,
  scheduledAt: Date
): Promise<string> {
  const id = uuidv4();

  await query(
    `INSERT INTO scheduled_posts (id, content_id, business_id, platform, scheduled_at, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [id, contentId, businessId, platform, scheduledAt.toISOString()]
  );

  // Calculate delay
  const delay = scheduledAt.getTime() - Date.now();

  if (delay > 0) {
    await publishQueue.add(
      'publish',
      { scheduledPostId: id, contentId, businessId, platform },
      { delay, jobId: id }
    );
    logger.info('Post scheduled', { scheduledPostId: id, scheduledAt, platform });
  } else {
    // Schedule immediately
    await publishQueue.add(
      'publish',
      { scheduledPostId: id, contentId, businessId, platform },
      { jobId: id }
    );
    logger.info('Post queued for immediate publishing', { scheduledPostId: id, platform });
  }

  return id;
}

/**
 * Cancel a scheduled post
 */
export async function cancelScheduledPost(scheduledPostId: string, userId: string): Promise<void> {
  const result = await query(
    `UPDATE scheduled_posts sp SET status = 'failed', error_message = 'Cancelled by user', updated_at = NOW()
     FROM businesses b WHERE sp.business_id = b.id AND sp.id = $1 AND b.user_id = $2 AND sp.status = 'pending'
     RETURNING sp.id`,
    [scheduledPostId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Scheduled post not found or already processed');
  }

  // Try to remove from queue
  const job = await publishQueue.getJob(scheduledPostId);
  if (job) {
    await job.remove();
  }
}

/**
 * Get scheduled posts for a business
 */
export async function getScheduledPosts(businessId: string, status?: string) {
  let sql = 'SELECT sp.*, cp.caption, cp.image_url, cp.type as content_type FROM scheduled_posts sp JOIN content_pieces cp ON sp.content_id = cp.id WHERE sp.business_id = $1';
  const params: any[] = [businessId];

  if (status) {
    sql += ' AND sp.status = $2';
    params.push(status);
  }

  sql += ' ORDER BY sp.scheduled_at ASC';

  const result = await query(sql, params);
  return result.rows;
}

export { connection };
