import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema, otpVerifySchema, validateRequest } from '../utils/validators';
import * as authService from '../services/auth.service';
import * as instagramService from '../services/instagram.service';
import * as gmbService from '../services/gmb.service';

const router = Router();

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  const validation = validateRequest(registerSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const { email, password, displayName, phone } = validation.data;
  const result = await authService.register(email, password, displayName, phone);

  res.status(201).json({ success: true, data: result, error: null });
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  const validation = validateRequest(loginSchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const { email, password } = validation.data;
  const result = await authService.login(email, password);

  res.json({ success: true, data: result, error: null });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_TOKEN', message: 'Refresh token required' } });
    return;
  }

  const tokens = await authService.refreshToken(refreshToken);
  res.json({ success: true, data: tokens, error: null });
});

// POST /api/auth/request-otp
router.post('/request-otp', authRateLimiter, async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PHONE', message: 'Phone number required' } });
    return;
  }

  const result = await authService.requestOTP(phone);
  res.json({ success: true, data: { expiresAt: result.expiresAt }, error: null });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
  const validation = validateRequest(otpVerifySchema, req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors } });
    return;
  }

  const { phone, code } = validation.data;
  const result = await authService.verifyOTP(phone, code);

  res.json({ success: true, data: result, error: null });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }
  res.json({ success: true, data: user, error: null });
});

// GET /api/auth/instagram — Start Instagram OAuth
router.get('/instagram', authMiddleware, async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const { url } = instagramService.getOAuthUrl(businessId as string, req.user!.userId);
  res.json({ success: true, data: { url }, error: null });
});

// GET /api/auth/instagram/callback
router.get('/instagram/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    res.redirect(`${process.env.API_URL || 'http://localhost:3000'}/auth/error?message=${error}`);
    return;
  }

  if (!code || !state) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAMS', message: 'code and state required' } });
    return;
  }

  const result = await instagramService.handleOAuthCallback(code as string, state as string);

  // Connect the platform
  const { connectPlatform } = await import('../services/business.service');
  await connectPlatform(
    result.businessId,
    'instagram',
    result.platformUserId,
    result.platformUsername,
    result.accessToken
  );

  // Redirect to mobile app deep link
  res.redirect(`chaiboost://instagram-connected?username=${result.platformUsername}`);
});

// GET /api/auth/gmb — Start Google My Business OAuth
router.get('/gmb', authMiddleware, async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAM', message: 'businessId required' } });
    return;
  }

  const { url } = gmbService.getOAuthUrl(businessId as string, req.user!.userId);
  res.json({ success: true, data: { url }, error: null });
});

// GET /api/auth/gmb/callback
router.get('/gmb/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    res.redirect(`${process.env.API_URL || 'http://localhost:3000'}/auth/error?message=${error}`);
    return;
  }

  if (!code || !state) {
    res.status(400).json({ success: false, data: null, error: { code: 'MISSING_PARAMS', message: 'code and state required' } });
    return;
  }

  const result = await gmbService.handleOAuthCallback(code as string, state as string);

  const stateData = JSON.parse(Buffer.from(state as string, 'base64url').toString());
  const { connectPlatform } = await import('../services/business.service');
  await connectPlatform(
    stateData.businessId,
    'google_my_business',
    'gmb',
    'Google My Business',
    result.accessToken,
    result.refreshToken,
    result.expiresAt
  );

  res.redirect('chaiboost://gmb-connected');
});

export { router as authRouter };
