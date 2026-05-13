import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'MISSING_TOKEN', message: 'Authorization header is required' },
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_FORMAT', message: 'Authorization header must be: Bearer <token>' },
    });
    return;
  }

  const token = parts[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired' },
      });
      return;
    }

    logger.warn('JWT verification failed', { error: error.message });
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_TOKEN', message: 'Invalid access token' },
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(parts[1]);
    req.user = payload;
  } catch {
    // Token invalid but route is optional-auth, continue without user
  }
  next();
}
