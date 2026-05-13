import { create } from 'zustand';
import { api } from '../services/api';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  platform: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface AutoReplyConfig {
  enabled: boolean;
  positiveTemplate: string;
  neutralTemplate: string;
  negativeTemplate: string;
}

interface ReviewState {
  reviews: Review[];
  reviewSummary: ReviewSummary | null;
  autoReplyConfig: AutoReplyConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchReviews: (filter?: string) => Promise<void>;
  fetchReviewSummary: () => Promise<void>;
  respondToReview: (reviewId: string, response: string) => Promise<void>;
  toggleAutoReply: (enabled: boolean) => Promise<void>;
  fetchAutoReplyConfig: () => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  reviewSummary: null,
  autoReplyConfig: null,
  isLoading: false,
  error: null,

  fetchReviews: async (filter?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = filter ? `?sentiment=${filter}` : '';
      const response = await api.get<{ reviews: Review[] }>(`/reviews${params}`);
      set({
        reviews: response.data.reviews,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch reviews.',
      });
    }
  },

  fetchReviewSummary: async () => {
    try {
      const response = await api.get<{ summary: ReviewSummary }>('/reviews/summary');
      set({ reviewSummary: response.data.summary });
    } catch (error: any) {
      console.error('Failed to fetch review summary:', error);
    }
  },

  respondToReview: async (reviewId: string, response: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/reviews/${reviewId}/respond`, { response });
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, response, respondedAt: new Date().toISOString() }
            : r
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to respond to review.',
      });
    }
  },

  toggleAutoReply: async (enabled: boolean) => {
    try {
      await api.patch('/reviews/auto-reply', { enabled });
      set((state) => ({
        autoReplyConfig: state.autoReplyConfig
          ? { ...state.autoReplyConfig, enabled }
          : null,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to toggle auto-reply.' });
    }
  },

  fetchAutoReplyConfig: async () => {
    try {
      const response = await api.get<{ config: AutoReplyConfig }>('/reviews/auto-reply');
      set({ autoReplyConfig: response.data.config });
    } catch (error: any) {
      console.error('Failed to fetch auto-reply config:', error);
    }
  },
}));
