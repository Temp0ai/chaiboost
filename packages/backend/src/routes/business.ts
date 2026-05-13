import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createBusinessSchema, validateRequest } from '../utils/validators';
import * as businessService from '../services/business.service';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// POST /api/business — Create business
router.post('/', async (req: Request, res: Response) => {
  const validation = validateRequest(createBusinessSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const business = await businessService.createBusiness(req.user!.userId, validation.data);
  res.status(201).json({ success: true, data: business, error: null });
});

// GET /api/business — List user's businesses
router.get('/', async (req: Request, res: Response) => {
  const businesses = await businessService.getBusinessesByUser(req.user!.userId);
  res.json({ success: true, data: businesses, error: null });
});

// GET /api/business/:id — Get business by ID
router.get('/:id', async (req: Request, res: Response) => {
  const business = await businessService.getBusinessById(req.params.id, req.user!.userId);
  if (!business) {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Business not found' } });
    return;
  }
  res.json({ success: true, data: business, error: null });
});

// PUT /api/business/:id — Update business
router.put('/:id', async (req: Request, res: Response) => {
  const business = await businessService.updateBusiness(req.params.id, req.user!.userId, req.body);
  res.json({ success: true, data: business, error: null });
});

// GET /api/business/:id/platforms — Get connected platforms
router.get('/:id/platforms', async (req: Request, res: Response) => {
  const platforms = await businessService.getConnectedPlatforms(req.params.id);
  res.json({ success: true, data: platforms, error: null });
});

export { router as businessRouter };
