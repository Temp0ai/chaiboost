import { create } from 'zustand';
import { api } from '../services/api';
import { ContentPiece } from './contentStore';

export interface ScheduledPost {
  id: string;
  content: ContentPiece;
  scheduledAt: string;
  platform: string;
  status: 'pending' | 'posted' | 'failed' | 'cancelled';
  createdAt: string;
}

interface ScheduleState {
  scheduledPosts: ScheduledPost[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  fetchSchedule: (month?: string) => Promise<void>;
  schedulePost: (contentId: string, scheduledAt: string, platform: string) => Promise<void>;
  cancelPost: (postId: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  scheduledPosts: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  fetchSchedule: async (month?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = month ? `?month=${month}` : '';
      const response = await api.get<{ posts: ScheduledPost[] }>(`/schedule${params}`);
      set({
        scheduledPosts: response.data.posts,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch schedule.',
      });
    }
  },

  schedulePost: async (contentId: string, scheduledAt: string, platform: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ post: ScheduledPost }>('/schedule', {
        contentId,
        scheduledAt,
        platform,
      });
      set((state) => ({
        scheduledPosts: [...state.scheduledPosts, response.data.post],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to schedule post.',
      });
      throw error;
    }
  },

  cancelPost: async (postId: string) => {
    try {
      await api.patch(`/schedule/${postId}/cancel`);
      set((state) => ({
        scheduledPosts: state.scheduledPosts.map((p) =>
          p.id === postId ? { ...p, status: 'cancelled' as const } : p
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to cancel post.' });
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },
}));
