import api from './api.js';
import { Course } from '../types/index.js';

export interface GetCoursesResponse {
  success: boolean;
  count: number;
  total: number;
  activeCount?: number;
  inactiveCount?: number;
  page: number;
  totalPages: number;
  courses: Course[];
}

export const courseService = {
  async getCourses(params?: {
    search?: string;
    department?: string;
    semester?: string | number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get<GetCoursesResponse>('/courses', { params });
    return res.data;
  },

  async getCourseById(id: string) {
    const res = await api.get<{ success: boolean; course: Course }>(`/courses/${id}`);
    return res.data;
  },

  async createCourse(data: Partial<Course>) {
    const res = await api.post<{ success: boolean; course: Course }>('/courses', data);
    return res.data;
  },

  async updateCourse(id: string, data: Partial<Course>) {
    const res = await api.put<{ success: boolean; course: Course }>(`/courses/${id}`, data);
    return res.data;
  },

  async deleteCourse(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/courses/${id}`);
    return res.data;
  },
};

