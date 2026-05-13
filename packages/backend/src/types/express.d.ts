import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    phone?: string;
    isPremium: boolean;
    premiumTier: string;
  };
  usageRemaining?: number;
}
