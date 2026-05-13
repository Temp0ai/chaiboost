import { create } from 'zustand';
import { api } from '../services/api';

export interface AnalyticsOverview {
  followers: { current: number; change: number };
  reach: { current: number; change: number };
  engagement: { current: number; change: number };
  impressions: { current: number; change: number };
  profileViews: { current: number; change: number };
}

export interface PlatformMetrics {
  followers: number[];
  reach: number[];
  engagement: number[];
  labels: string[];
  topPosts: {
    id: string;
    thumbnailUrl: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }[];
}

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  instagramMetrics: PlatformMetrics | null;
  gmbMetrics: PlatformMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (period?: string) => Promise<void>;
  fetchInstagramMetrics: (period?: string) => Promise<void>;
  fetchGmbMetrics: (period?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  instagramMetrics: null,
  gmbMetrics: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async (period?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = period ? `?period=${period}` : '';
      const response = await api.get<{ overview: AnalyticsOverview }>(`/analytics/overview${params}`);
      set({
        overview: response.data.overview,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch analytics.',
      });
    }
  },

  fetchInstagramMetrics: async (period?: string) => {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await api.get<{ metrics: PlatformMetrics }>(`/analytics/instagram${params}`);
      set({ instagramMetrics: response.data.metrics });
    } catch (error: any) {
      console.error('Failed to fetch Instagram metrics:', error);
    }
  },

  fetchGmbMetrics: async (period?: string) => {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await api.get<{ metrics: PlatformMetrics }>(`/analytics/gmb${params}`);
      set({ gmbMetrics: response.data.metrics });
    } catch (error: any) {
      console.error('Failed to fetch GMB metrics:', error);
    }
  },
}));
