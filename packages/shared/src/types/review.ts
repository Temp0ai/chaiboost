export type ReviewPlatform = 'google' | 'instagram' | 'yelp';
export type ReviewSentiment = 'positive' | 'neutral' | 'negative';

export interface Review {
  id: string;
  businessId: string;
  platform: ReviewPlatform;
  platformReviewId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number | null; // 1-5 for Google, null for Instagram
  text: string;
  sentiment: ReviewSentiment | null;
  sentimentScore: number | null; // -1.0 to 1.0
  aiResponse: string | null;
  respondedAt: Date | null;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
