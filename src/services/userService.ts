import api from './api.js';
import { User, UserRole } from '../types/index.js';

export const userService = {
  async getUsers(params?: { role?: UserRole; department?: string; search?: string }) {
    const res = await api.get<{ success: boolean; count: number; users: User[] }>('/users', { params });
    return res.data;
  },

  async createUser(userData: Partial<User> & { password?: string }) {
    const res = await api.post<{ success: boolean; message: string; user: User }>('/users', userData);
    return res.data;
  },

  async updateUser(id: string, userData: Partial<User>) {
    const res = await api.put<{ success: boolean; message: string; user: User }>(`/users/${id}`, userData);
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return res.data;
  },
};
