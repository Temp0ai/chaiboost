import { create } from 'zustand';
import { api } from '../services/api';

export interface ContentPiece {
  id: string;
  type: 'image' | 'video' | 'carousel';
  title: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  platform: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  createdAt: string;
}

interface ContentState {
  contentPieces: ContentPiece[];
  selectedContent: ContentPiece | null;
  isGenerating: boolean;
  generationProgress: number;
  isLoading: boolean;
  error: string | null;
  fetchContent: (filter?: string) => Promise<void>;
  generateImage: (params: {
    prompt: string;
    style: string;
    contentType: string;
    includeLogo: boolean;
    textOverlay?: string;
  }) => Promise<ContentPiece>;
  generateVideo: (params: {
    photos: string[];
    scenes: string[];
    musicMood: string;
  }) => Promise<ContentPiece>;
  generateCaption: (params: {
    topic: string;
    tone: string;
    platform: string;
  }) => Promise<string>;
  selectContent: (content: ContentPiece) => void;
  deleteContent: (id: string) => Promise<void>;
  updateCaption: (id: string, caption: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  contentPieces: [],
  selectedContent: null,
  isGenerating: false,
  generationProgress: 0,
  isLoading: false,
  error: null,

  fetchContent: async (filter?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = filter ? `?type=${filter}` : '';
      const response = await api.get<{ content: ContentPiece[] }>(`/content${params}`);
      set({
        contentPieces: response.data.content,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch content.',
      });
    }
  },

  generateImage: async (params) => {
    set({ isGenerating: true, generationProgress: 0, error: null });
    try {
      const response = await api.post<{ content: ContentPiece }>('/content/generate/image', params);
      set((state) => ({
        contentPieces: [response.data.content, ...state.contentPieces],
        isGenerating: false,
        generationProgress: 100,
      }));
      return response.data.content;
    } catch (error: any) {
      set({
        isGenerating: false,
        generationProgress: 0,
        error: error.response?.data?.message || 'Image generation failed.',
      });
      throw error;
    }
  },

  generateVideo: async (params) => {
    set({ isGenerating: true, generationProgress: 0, error: null });
    try {
      const response = await api.post<{ content: ContentPiece }>('/content/generate/video', params);
      set((state) => ({
        contentPieces: [response.data.content, ...state.contentPieces],
        isGenerating: false,
        generationProgress: 100,
      }));
      return response.data.content;
    } catch (error: any) {
      set({
        isGenerating: false,
        generationProgress: 0,
        error: error.response?.data?.message || 'Video generation failed.',
      });
      throw error;
    }
  },

  generateCaption: async (params) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await api.post<{ caption: string }>('/content/generate/caption', params);
      set({ isGenerating: false });
      return response.data.caption;
    } catch (error: any) {
      set({
        isGenerating: false,
        error: error.response?.data?.message || 'Caption generation failed.',
      });
      throw error;
    }
  },

  selectContent: (content: ContentPiece) => {
    set({ selectedContent: content });
  },

  deleteContent: async (id: string) => {
    try {
      await api.delete(`/content/${id}`);
      set((state) => ({
        contentPieces: state.contentPieces.filter((c) => c.id !== id),
        selectedContent: state.selectedContent?.id === id ? null : state.selectedContent,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete content.' });
    }
  },

  updateCaption: async (id: string, caption: string) => {
    try {
      await api.patch(`/content/${id}`, { caption });
      set((state) => ({
        contentPieces: state.contentPieces.map((c) =>
          c.id === id ? { ...c, caption } : c
        ),
        selectedContent:
          state.selectedContent?.id === id
            ? { ...state.selectedContent, caption }
            : state.selectedContent,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update caption.' });
    }
  },
}));
