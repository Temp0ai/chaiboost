import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimit';
import { usageCheck } from '../middleware/usageCheck';
import { generateContentSchema, validateRequest } from '../utils/validators';
import * as contentService from '../services/content.service';

const router = Router();

router.use(authMiddleware);

// POST /api/content/generate — Generate AI content
router.post('/generate', aiRateLimiter, usageCheck('content'), async (req: Request, res: Response) => {
  const validation = validateRequest(generateContentSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const result = await contentService.generateContent(req.user!.userId, validation.data.businessId, validation.data);
  res.status(201).json({ success: true, data: result, error: null });
});

// GET /api/content — List content pieces
router.get('/', async (req: Request, res: Response) => {
  const { businessId, page, limit, status } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const result = await contentService.listContent(
    req.user!.userId,
    businessId as string,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20,
    status as string | undefined
  );

  res.json({ success: true, data: result.items, meta: { page: parseInt(page as string) || 1, limit: parseInt(limit as string) || 20, total: result.total, totalPages: Math.ceil(result.total / (parseInt(limit as string) || 20)) }, error: null });
});

// GET /api/content/:id — Get content by ID
router.get('/:id', async (req: Request, res: Response) => {
  const content = await contentService.getContentById(req.params.id, req.user!.userId);
  if (!content) {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Content not found' } });
    return;
  }
  res.json({ success: true, data: content, error: null });
});

// PATCH /api/content/:id/status — Update content status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_STATUS', message: 'Status required' } });
    return;
  }

  const content = await contentService.updateContentStatus(req.params.id, req.user!.userId, status);
  res.json({ success: true, data: content, error: null });
});

// DELETE /api/content/:id — Delete content
router.delete('/:id', async (req: Request, res: Response) => {
  await contentService.deleteContent(req.params.id, req.user!.userId);
  res.json({ success: true, data: { deleted: true }, error: null });
});

export { router as contentRouter };
