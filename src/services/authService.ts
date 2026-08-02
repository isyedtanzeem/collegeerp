import api from './api.js';
import { AuthResponse, User } from '../types/index.js';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>('/auth/logout');
    return res.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const res = await api.post<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(resetToken: string, password: string): Promise<AuthResponse> {
    const res = await api.put<AuthResponse>(`/auth/reset-password/${resetToken}`, { password });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await api.put<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },

  async updateProfile(data: Partial<User> & { password?: string }): Promise<{ success: boolean; user: User }> {
    const res = await api.put<{ success: boolean; user: User }>('/auth/profile', data);
    return res.data;
  },
};
