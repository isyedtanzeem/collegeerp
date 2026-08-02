import api from './api.js';
import { Student } from '../types/index.js';

export interface GetStudentsResponse {
  success: boolean;
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  activeCount: number;
  maleCount: number;
  femaleCount: number;
}

export const studentService = {
  async getStudents(params?: {
    search?: string;
    department?: string;
    course?: string;
    semester?: string | number;
    section?: string;
    gender?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get<GetStudentsResponse>('/students', { params });
    return res.data;
  },

  async getStudentById(id: string) {
    const res = await api.get<{ success: boolean; student: Student }>(`/students/${id}`);
    return res.data;
  },

  async createStudent(data: FormData | Partial<Student>) {
    const isFormData = data instanceof FormData;
    const res = await api.post<{ success: boolean; message: string; student: Student }>('/students', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async updateStudent(id: string, data: FormData | Partial<Student>) {
    const isFormData = data instanceof FormData;
    const res = await api.put<{ success: boolean; message: string; student: Student }>(`/students/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async uploadStudentPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post<{ success: boolean; photoUrl: string; message: string }>('/students/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteStudent(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/students/${id}`);
    return res.data;
  },
};
