import api from './api.js';
import { Department } from '../types/index.js';

export interface GetDepartmentsResponse {
  success: boolean;
  count: number;
  total: number;
  activeCount?: number;
  inactiveCount?: number;
  page: number;
  totalPages: number;
  departments: Department[];
}

export const departmentService = {
  async getDepartments(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await api.get<GetDepartmentsResponse>('/departments', { params });
    return res.data;
  },

  async getDepartmentById(id: string) {
    const res = await api.get<{ success: boolean; department: Department }>(`/departments/${id}`);
    return res.data;
  },

  async createDepartment(data: Partial<Department>) {
    const res = await api.post<{ success: boolean; department: Department }>('/departments', data);
    return res.data;
  },

  async updateDepartment(id: string, data: Partial<Department>) {
    const res = await api.put<{ success: boolean; department: Department }>(`/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/departments/${id}`);
    return res.data;
  },
};
