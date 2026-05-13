import { create } from 'zustand';
import { api } from '../services/api';

export interface Business {
  id: string;
  name: string;
  type: string;
  logo?: string;
  brandColors: string[];
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  createdAt: string;
}

export interface PlatformConnection {
  platform: 'instagram' | 'gmb' | 'whatsapp';
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

interface BusinessState {
  businesses: Business[];
  selectedBusiness: Business | null;
  connections: PlatformConnection[];
  isLoading: boolean;
  error: string | null;
  fetchBusinesses: () => Promise<void>;
  createBusiness: (data: Partial<Business>) => Promise<Business>;
  selectBusiness: (business: Business) => void;
  connectPlatform: (platform: string) => Promise<void>;
  fetchConnections: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  connections: [],
  isLoading: false,
  error: null,

  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ businesses: Business[] }>('/businesses');
      const businesses = response.data.businesses;
      set({
        businesses,
        selectedBusiness: businesses[0] || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch businesses.',
      });
    }
  },

  createBusiness: async (data: Partial<Business>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ business: Business }>('/businesses', data);
      const business = response.data.business;
      set((state) => ({
        businesses: [...state.businesses, business],
        selectedBusiness: business,
        isLoading: false,
      }));
      return business;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create business.',
      });
      throw error;
    }
  },

  selectBusiness: (business: Business) => {
    set({ selectedBusiness: business });
  },

  connectPlatform: async (platform: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/businesses/connections/${platform}/connect`);
      await get().fetchConnections();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || `Failed to connect ${platform}.`,
      });
    }
  },

  fetchConnections: async () => {
    try {
      const response = await api.get<{ connections: PlatformConnection[] }>('/businesses/connections');
      set({ connections: response.data.connections });
    } catch (error: any) {
      console.error('Failed to fetch connections:', error);
    }
  },
}));
