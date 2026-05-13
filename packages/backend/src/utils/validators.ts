import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  category: z.enum(['tea_shop', 'bubble_tea', 'coffee_house', 'juice_bar', 'smoothie_shop', 'matcha_bar', 'kombucha', 'other']),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  brandColors: z
    .object({
      primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })
    .optional(),
  toneOfVoice: z.string().max(100).optional(),
  targetAudience: z.string().max(200).optional(),
});

export const generateContentSchema = z.object({
  businessId: z.string().uuid(),
  type: z.enum(['caption', 'image', 'video', 'carousel', 'story']),
  topic: z.string().max(200).optional(),
  tone: z.enum(['casual', 'professional', 'playful', 'educational', 'promotional']).optional(),
  language: z.string().max(10).default('en'),
  includeHashtags: z.boolean().default(true),
  includeImage: z.boolean().default(false),
  customPrompt: z.string().max(1000).optional(),
});

export const schedulePostSchema = z.object({
  contentId: z.string().uuid(),
  platform: z.enum(['instagram', 'google_my_business']),
  scheduledAt: z.string().datetime(),
});

export const respondToReviewSchema = z.object({
  tone: z.enum(['professional', 'friendly', 'apologetic']).default('professional'),
  customInstructions: z.string().max(500).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platform: z.string().optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
