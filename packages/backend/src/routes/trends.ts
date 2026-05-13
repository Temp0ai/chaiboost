import { Router } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { getTrends, refreshTrends } from '../services/trend.service';
import { query } from '../config/database';

const router = Router();

// GET /v1/trends/hashtags
router.get('/hashtags', async (req: AuthenticatedRequest, res) => {
  const { category, limit } = req.query;
  const trends = await getTrends(
    category as string,
    undefined,
    undefined,
    parseInt(limit as string) || 30
  );
  res.json({ items: trends });
});

// GET /v1/trends/topics
router.get('/topics', async (req: AuthenticatedRequest, res) => {
  const { category, platform } = req.query;
  const topics = await getTrends(category as string, platform as string);
  res.json({ items: topics });
});

// POST /v1/trends/refresh
router.post('/refresh', async (req: AuthenticatedRequest, res) => {
  const { category, platform } = req.body;
  const topics = await refreshTrends(category, platform);
  res.json({ items: topics, refreshed_at: new Date().toISOString() });
});

export { router as trendsRouter };
