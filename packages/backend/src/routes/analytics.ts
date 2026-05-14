import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getOverview, getContentPerformance } from '../services/analytics.service';
import { query } from '../config/database';

const router = Router();

router.use(authMiddleware);

// GET /v1/analytics/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { period } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const data = await getOverview(id, days);
  res.json(data);
});

// GET /v1/analytics/:id/instagram
router.get('/:id/instagram', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query(
    `SELECT * FROM analytics_snapshots 
     WHERE business_id = $1 AND platform = 'instagram' 
     ORDER BY snapshot_date DESC LIMIT 30`,
    [id]
  );
  res.json({ items: result.rows });
});

// GET /v1/analytics/:id/gmb
router.get('/:id/gmb', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await query(
    `SELECT * FROM analytics_snapshots 
     WHERE business_id = $1 AND platform = 'google_my_business' 
     ORDER BY snapshot_date DESC LIMIT 30`,
    [id]
  );
  res.json({ items: result.rows });
});

// GET /v1/analytics/:id/content
router.get('/:id/content', async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await getContentPerformance(id);
  res.json(data);
});

// GET /v1/analytics/:id/export
router.get('/:id/export', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { format } = req.query;
  const overview = await getOverview(id, 30);
  
  if (format === 'csv') {
    const csv = [
      'Metric,Value',
      `Followers,${overview.totalFollowers}`,
      `Total Impressions,${overview.totalImpressions}`,
      `Avg Engagement,${overview.averageEngagement}`,
      `Total Posts,${overview.totalPosts}`,
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${id}.csv`);
    res.send(csv);
  } else {
    res.json(overview);
  }
});

export { router as analyticsRouter };
