import api from './api.js';
import { Faculty } from '../types/index.js';

export interface GetFacultyResponse {
  success: boolean;
  faculty: Faculty[];
  total: number;
  page: number;
  totalPages: number;
  activeCount: number;
  totalSalary: number;
}

export const facultyService = {
  async getFaculty(params?: {
    search?: string;
    department?: string;
    designation?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get<GetFacultyResponse>('/faculty', { params });
    return res.data;
  },

  async getFacultyById(id: string) {
    const res = await api.get<{ success: boolean; faculty: Faculty }>(`/faculty/${id}`);
    return res.data;
  },

  async createFaculty(data: FormData | Partial<Faculty>) {
    const isFormData = data instanceof FormData;
    const res = await api.post<{ success: boolean; message: string; faculty: Faculty }>('/faculty', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async updateFaculty(id: string, data: FormData | Partial<Faculty>) {
    const isFormData = data instanceof FormData;
    const res = await api.put<{ success: boolean; message: string; faculty: Faculty }>(`/faculty/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async uploadFacultyPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post<{ success: boolean; photoUrl: string; message: string }>('/faculty/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteFaculty(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/faculty/${id}`);
    return res.data;
  },
};
