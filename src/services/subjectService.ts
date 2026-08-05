import api from './api.js';
import { Subject } from '../types/index.js';

export interface GetSubjectsResponse {
  success: boolean;
  count: number;
  total: number;
  activeCount?: number;
  inactiveCount?: number;
  page: number;
  totalPages: number;
  subjects: Subject[];
}

export const subjectService = {
  async getSubjects(params?: {
    search?: string;
    department?: string;
    course?: string;
    semester?: string | number;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get<GetSubjectsResponse>('/subjects', { params });
    return res.data;
  },

  async getSubjectById(id: string) {
    const res = await api.get<{ success: boolean; subject: Subject }>(`/subjects/${id}`);
    return res.data;
  },

  async createSubject(data: Partial<Subject>) {
    const res = await api.post<{ success: boolean; subject: Subject }>('/subjects', data);
    return res.data;
  },

  async updateSubject(id: string, data: Partial<Subject>) {
    const res = await api.put<{ success: boolean; subject: Subject }>(`/subjects/${id}`, data);
    return res.data;
  },

  async assignFaculty(id: string, payload: { facultyName: string; facultyId?: string }) {
    const res = await api.patch<{ success: boolean; message: string; subject: Subject }>(
      `/subjects/${id}/assign-faculty`,
      payload
    );
    return res.data;
  },

  async deleteSubject(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/subjects/${id}`);
    return res.data;
  },
};
