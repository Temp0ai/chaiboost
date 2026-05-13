export type ContentType = 'caption' | 'image' | 'video' | 'carousel' | 'story' | 'reel';
export type ContentStatus = 'draft' | 'generated' | 'approved' | 'scheduled' | 'published' | 'failed';
export type ContentTone = 'casual' | 'professional' | 'playful' | 'educational' | 'promotional';

export interface ContentPiece {
  id: string;
  businessId: string;
  type: ContentType;
  status: ContentStatus;
  title: string | null;
  caption: string | null;
  hashtags: string[];
  imageUrl: string | null;
  imagePrompt: string | null;
  videoUrl: string | null;
  videoStoryboard: VideoStoryboard | null;
  platform: string | null;
  platformPostId: string | null;
  tone: ContentTone;
  language: string;
  aiModel: string | null;
  aiPromptUsed: string | null;
  generationCost: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoStoryboard {
  scenes: VideoScene[];
  totalDuration: number;
  music: string | null;
  transitions: string[];
}

export interface VideoScene {
  order: number;
  duration: number;
  description: string;
  imageUrl: string | null;
  text: string | null;
  animation: string | null;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  businessId: string;
  platform: string;
  scheduledAt: Date;
  publishedAt: Date | null;
  status: 'pending' | 'processing' | 'published' | 'failed';
  retryCount: number;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
