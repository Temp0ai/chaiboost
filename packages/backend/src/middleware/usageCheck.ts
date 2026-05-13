import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { TIER_LIMITS, SubscriptionTier } from '@chaiboost/shared';
import { logger } from '../utils/logger';

type UsageFeature = 'content' | 'image' | 'video' | 'schedule' | 'review' | 'trend';

const FEATURE_TO_COLUMN: Record<UsageFeature, string> = {
  content: 'maxContentGenerations',
  image: 'maxImageGenerations',
  video: 'maxVideoGenerations',
  schedule: 'maxScheduledPosts',
  review: 'maxReviewResponses',
  trend: 'maxTrendQueries',
};

async function getCurrentMonthUsage(userId: string, feature: UsageFeature): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await query(
    `SELECT COUNT(*) as count FROM ai_usage_logs
     WHERE user_id = $1 AND action = $2 AND created_at >= $3`,
    [userId, feature, startOfMonth.toISOString()]
  );

  return parseInt(result.rows[0]?.count || '0', 10);
}

export function usageCheck(feature: UsageFeature) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    try {
      const tier = (req.user.tier || 'free') as SubscriptionTier;
      const limits = TIER_LIMITS[tier];
      const limitKey = FEATURE_TO_COLUMN[feature] as keyof typeof limits;
      const maxAllowed = limits[limitKey] as number;

      // -1 means unlimited
      if (maxAllowed === -1) {
        next();
        return;
      }

      const currentUsage = await getCurrentMonthUsage(req.user.userId, feature);

      if (currentUsage >= maxAllowed) {
        res.status(429).json({
          success: false,
          data: null,
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: `You've reached your monthly limit for ${feature} generation. Upgrade your plan for more.`,
            details: {
              feature,
              currentUsage,
              maxAllowed,
              tier,
            },
          },
        });
        return;
      }

      // Attach usage info to request for downstream logging
      (req as any).usageInfo = {
        feature,
        currentUsage,
        maxAllowed,
        tier,
      };

      next();
    } catch (error) {
      logger.error('Usage check failed', { error, userId: req.user.userId });
      // Fail open — allow the request if usage check fails
      next();
    }
  };
}
