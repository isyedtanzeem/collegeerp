import api from './api.js';
import { Notice } from '../types/index.js';

export interface GetNoticesParams {
  postType?: string;
  category?: string;
  priority?: string;
  targetRole?: string;
  department?: string;
  search?: string;
}

export const noticeService = {
  async getNotices(params?: GetNoticesParams) {
    const res = await api.get<{ success: boolean; count: number; notices: Notice[] }>(
      '/notices',
      { params }
    );
    return res.data;
  },

  async getNoticeById(id: string) {
    const res = await api.get<{ success: boolean; notice: Notice }>(`/notices/${id}`);
    return res.data;
  },

  async createNotice(data: Partial<Notice>) {
    const res = await api.post<{ success: boolean; message: string; notice: Notice }>(
      '/notices',
      data
    );
    return res.data;
  },

  async updateNotice(id: string, data: Partial<Notice>) {
    const res = await api.put<{ success: boolean; message: string; notice: Notice }>(
      `/notices/${id}`,
      data
    );
    return res.data;
  },

  async deleteNotice(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/notices/${id}`);
    return res.data;
  },

  async togglePinNotice(id: string) {
    const res = await api.patch<{ success: boolean; message: string; pinned: boolean; notice: Notice }>(
      `/notices/${id}/pin`
    );
    return res.data;
  },
};

