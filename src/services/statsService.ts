import api from './api.js';
import { DashboardData } from '../types/index.js';

export const statsService = {
  async getDashboardStats(): Promise<DashboardData> {
    const res = await api.get<DashboardData>('/stats');
    return res.data;
  },
};
