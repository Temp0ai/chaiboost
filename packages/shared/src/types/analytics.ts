export interface AnalyticsSnapshot {
  id: string;
  businessId: string;
  platform: string;
  snapshotDate: Date;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  impressions: number;
  reach: number;
  profileViews: number;
  websiteClicks: number;
  topPostIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  category: string;
  platform: string;
  volume: number;
  growthRate: number;
  score: number; // 0-100
  relatedHashtags: string[];
  sampleContent: string[];
  expiresAt: Date;
  createdAt: Date;
}

export interface HashtagCache {
  id: string;
  businessId: string;
  category: string;
  hashtags: HashtagEntry[];
  platform: string;
  generatedAt: Date;
  expiresAt: Date;
}

export interface HashtagEntry {
  tag: string;
  postCount: number;
  relevanceScore: number;
}

export interface AIUsageLog {
  id: string;
  userId: string;
  businessId: string;
  action: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  success: boolean;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AnalyticsOverview {
  totalFollowers: number;
  followersChange: number;
  totalPosts: number;
  postsThisMonth: number;
  averageEngagement: number;
  engagementChange: number;
  totalImpressions: number;
  impressionsChange: number;
  topPerformingPost: ContentPerformance | null;
  recentGrowth: GrowthDataPoint[];
}

export interface ContentPerformance {
  contentId: string;
  caption: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  engagementRate: number;
  publishedAt: Date;
}

export interface GrowthDataPoint {
  date: string;
  followers: number;
  engagement: number;
  posts: number;
}
