import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    await authService.saveToken(response.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string; phone: string }> => {
    const response = await api.post<{ message: string; phone: string }>('/auth/register', data);
    return response.data;
  },

  verifyOTP: async (phone: string, otp: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-otp', { phone, otp });
    await authService.saveToken(response.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    await authService.saveToken(response.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('accessToken');
  },

  saveToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync('accessToken', token);
  },
};
