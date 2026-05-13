import { Router } from 'express';
import { authRouter } from './auth';
import { businessRouter } from './business';
import { contentRouter } from './content';
import { scheduleRouter } from './schedule';
import { reviewsRouter } from './reviews';
import { trendsRouter } from './trends';
import { analyticsRouter } from './analytics';
import { webhooksRouter } from './webhooks';

const router = Router();

router.use('/auth', authRouter);
router.use('/business', businessRouter);
router.use('/content', contentRouter);
router.use('/schedule', scheduleRouter);
router.use('/reviews', reviewsRouter);
router.use('/trends', trendsRouter);
router.use('/analytics', analyticsRouter);
router.use('/webhooks', webhooksRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router as apiRouter };
