// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
}

// Business
export interface CreateBusinessRequest {
  name: string;
  category: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  brandColors?: { primary: string; secondary: string; accent: string };
  toneOfVoice?: string;
  targetAudience?: string;
}

// Content
export interface GenerateContentRequest {
  businessId: string;
  type: 'caption' | 'image' | 'video' | 'carousel' | 'story';
  topic?: string;
  tone?: string;
  language?: string;
  includeHashtags?: boolean;
  includeImage?: boolean;
  customPrompt?: string;
}

export interface GenerateContentResponse {
  contentId: string;
  caption: string | null;
  hashtags: string[];
  imageUrl: string | null;
  videoStoryboard: unknown | null;
  suggestions: string[];
}

// Schedule
export interface SchedulePostRequest {
  contentId: string;
  platform: string;
  scheduledAt: string; // ISO 8601
}

// Reviews
export interface RespondToReviewRequest {
  reviewId: string;
  tone?: 'professional' | 'friendly' | 'apologetic';
  customInstructions?: string;
}

// Trends
export interface TrendFilters {
  platform?: string;
  category?: string;
  minScore?: number;
  limit?: number;
}

// Analytics
export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
  platform?: string;
}
