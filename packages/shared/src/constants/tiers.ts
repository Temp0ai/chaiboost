import type { SubscriptionTier } from '../types';

export interface TierLimits {
  name: string;
  monthlyPrice: number;
  maxContentGenerations: number;
  maxImageGenerations: number;
  maxVideoGenerations: number;
  maxScheduledPosts: number;
  maxConnectedPlatforms: number;
  maxReviewResponses: number;
  maxTrendQueries: number;
  analyticsRetentionDays: number;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  features: string[];
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    maxContentGenerations: 10,
    maxImageGenerations: 2,
    maxVideoGenerations: 0,
    maxScheduledPosts: 5,
    maxConnectedPlatforms: 1,
    maxReviewResponses: 5,
    maxTrendQueries: 3,
    analyticsRetentionDays: 7,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    features: [
      'Basic caption generation',
      'Limited hashtag suggestions',
      '1 connected platform',
      '7-day analytics',
    ],
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 19,
    maxContentGenerations: 50,
    maxImageGenerations: 15,
    maxVideoGenerations: 2,
    maxScheduledPosts: 30,
    maxConnectedPlatforms: 2,
    maxReviewResponses: 25,
    maxTrendQueries: 10,
    analyticsRetentionDays: 30,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    features: [
      'AI caption & image generation',
      'Video storyboards',
      '2 connected platforms',
      '30-day analytics',
      'Review auto-responses',
      'Basic trend insights',
    ],
  },
  growth: {
    name: 'Growth',
    monthlyPrice: 49,
    maxContentGenerations: 200,
    maxImageGenerations: 60,
    maxVideoGenerations: 10,
    maxScheduledPosts: 100,
    maxConnectedPlatforms: 3,
    maxReviewResponses: 100,
    maxTrendQueries: 50,
    analyticsRetentionDays: 90,
    prioritySupport: true,
    customBranding: true,
    apiAccess: false,
    features: [
      'Everything in Starter',
      'Custom brand templates',
      '3 connected platforms',
      '90-day analytics',
      'Priority AI generation',
      'Advanced trend analysis',
      'Custom brand colors in images',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 99,
    maxContentGenerations: -1, // unlimited
    maxImageGenerations: -1,
    maxVideoGenerations: -1,
    maxScheduledPosts: -1,
    maxConnectedPlatforms: 5,
    maxReviewResponses: -1,
    maxTrendQueries: -1,
    analyticsRetentionDays: 365,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    features: [
      'Everything in Growth',
      'Unlimited AI generations',
      '5 connected platforms',
      '1-year analytics retention',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label reports',
    ],
  },
};

export function getTierLimit(tier: SubscriptionTier, feature: keyof TierLimits): number | boolean | string | string[] {
  return TIER_LIMITS[tier][feature];
}

export function isWithinLimit(tier: SubscriptionTier, feature: keyof TierLimits, currentUsage: number): boolean {
  const limit = TIER_LIMITS[tier][feature];
  if (typeof limit !== 'number') return true;
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}

export function getStripePriceId(tier: SubscriptionTier): string | null {
  const priceMap: Record<string, string | null> = {
    free: null,
    starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
    growth: process.env.STRIPE_PRICE_GROWTH || 'price_growth_monthly',
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
  };
  return priceMap[tier] || null;
}
