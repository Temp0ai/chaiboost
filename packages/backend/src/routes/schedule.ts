import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { schedulePostSchema, validateRequest } from '../utils/validators';
import * as schedulerService from '../services/scheduler.service';

const router = Router();

router.use(authMiddleware);

// POST /api/schedule — Schedule a post
router.post('/', async (req: Request, res: Response) => {
  const validation = validateRequest(schedulePostSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const { contentId, platform, scheduledAt } = validation.data;

  // Get businessId from content
  const { query } = await import('../config/database');
  const contentResult = await query('SELECT business_id FROM content_pieces WHERE id = $1', [contentId]);
  if (contentResult.rows.length === 0) {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Content not found' } });
    return;
  }

  const scheduledPostId = await schedulerService.schedulePost(
    contentId,
    contentResult.rows[0].business_id,
    platform,
    new Date(scheduledAt)
  );

  res.status(201).json({ success: true, data: { id: scheduledPostId, scheduledAt }, error: null });
});

// GET /api/schedule — Get scheduled posts
router.get('/', async (req: Request, res: Response) => {
  const { businessId, status } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const posts = await schedulerService.getScheduledPosts(businessId as string, status as string);
  res.json({ success: true, data: posts, error: null });
});

// DELETE /api/schedule/:id — Cancel scheduled post
router.delete('/:id', async (req: Request, res: Response) => {
  await schedulerService.cancelScheduledPost(req.params.id, req.user!.userId);
  res.json({ success: true, data: { cancelled: true }, error: null });
});

export { router as scheduleRouter };
