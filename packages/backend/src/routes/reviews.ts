import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimit';
import { usageCheck } from '../middleware/usageCheck';
import { respondToReviewSchema, paginationSchema, validateRequest } from '../utils/validators';
import * as reviewService from '../services/review.service';

const router = Router();

router.use(authMiddleware);

// GET /api/reviews — List reviews
router.get('/', async (req: Request, res: Response) => {
  const { businessId, page, limit, platform, sentiment } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const result = await reviewService.listReviews(
    businessId as string,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20,
    platform as string,
    sentiment as string
  );

  res.json({
    success: true,
    data: result.items,
    meta: {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      total: result.total,
      totalPages: Math.ceil(result.total / (parseInt(limit as string) || 20)),
    },
    error: null,
  });
});

// GET /api/reviews/:id — Get review by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const review = await reviewService.getReviewById(req.params.id, businessId as string);
  if (!review) {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    return;
  }

  res.json({ success: true, data: review, error: null });
});

// POST /api/reviews/:id/respond — AI-generate review response
router.post('/:id/respond', aiRateLimiter, usageCheck('review'), async (req: Request, res: Response) => {
  const { businessId } = req.body;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const validation = validateRequest(respondToReviewSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const result = await reviewService.respondToReview(
    req.user!.userId,
    businessId,
    req.params.id,
    validation.data.tone,
    validation.data.customInstructions
  );

  res.json({ success: true, data: result, error: null });
});

// PATCH /api/reviews/:id/read — Mark review as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  const { businessId } = req.body;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  await reviewService.markAsRead(req.params.id, businessId);
  res.json({ success: true, data: { read: true }, error: null });
});

// POST /api/reviews/sync — Sync reviews from connected platforms
router.post('/sync', async (req: Request, res: Response) => {
  const { businessId } = req.body;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const count = await reviewService.syncReviews(businessId);
  res.json({ success: true, data: { synced: count }, error: null });
});

export { router as reviewsRouter };
