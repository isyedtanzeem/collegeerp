import api from './api.js';
import { Notice } from '../types/index.js';

export const noticeService = {
  async getNotices() {
    const res = await api.get<{ success: boolean; count: number; notices: Notice[] }>('/notices');
    return res.data;
  },

  async createNotice(data: Partial<Notice>) {
    const res = await api.post<{ success: boolean; notice: Notice }>('/notices', data);
    return res.data;
  },

  async deleteNotice(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/notices/${id}`);
    return res.data;
  },
};
