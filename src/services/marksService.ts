import api from './api.js';
import {
  ExamMark,
  StudentResultResponse,
  AcademicTranscriptResponse,
} from '../types/index.js';

export interface GetMarksParams {
  studentId?: string;
  examId?: string;
  subject?: string;
  grade?: string;
  isPassed?: string | boolean;
  search?: string;
}

export interface SaveMarkPayload {
  studentId: string;
  examId: string;
  subject: string;
  marksObtained: number;
  totalMarks?: number;
  remarks?: string;
  evaluatedBy?: string;
}

export interface GenerateResultsPayload {
  examId?: string;
  department?: string;
  course?: string;
  semester?: number;
}

export const marksService = {
  // Get all marks records
  async getMarks(params?: GetMarksParams) {
    const res = await api.get<{ success: boolean; total: number; marks: ExamMark[] }>('/marks', { params });
    return res.data;
  },

  // Create mark record
  async createMark(payload: SaveMarkPayload) {
    const res = await api.post<{ success: boolean; message: string; mark: ExamMark }>('/marks', payload);
    return res.data;
  },

  // Update mark record
  async updateMark(id: string, payload: Partial<SaveMarkPayload>) {
    const res = await api.put<{ success: boolean; message: string; mark: ExamMark }>(`/marks/${id}`, payload);
    return res.data;
  },

  // Delete mark record
  async deleteMark(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/marks/${id}`);
    return res.data;
  },

  // Bulk generate results & compute CGPA
  async generateResults(payload: GenerateResultsPayload) {
    const res = await api.post<{
      success: boolean;
      message: string;
      resultsSummary: any[];
    }>('/marks/generate-results', payload);
    return res.data;
  },

  // Get complete student result view
  async getStudentResult(studentId: string) {
    const res = await api.get<StudentResultResponse>(`/marks/student-result/${studentId}`);
    return res.data;
  },

  // Get official academic transcript
  async getAcademicTranscript(studentId: string) {
    const res = await api.get<AcademicTranscriptResponse>(`/marks/transcript/${studentId}`);
    return res.data;
  },
};
