import api from './api.js';
import {
  Exam,
  ExamHall,
  ExamMark,
  ExamType,
  ExamStatus,
  StudentReportCardResponse,
} from '../types/index.js';

export interface GetExamsParams {
  department?: string;
  course?: string;
  semester?: string | number;
  examType?: string;
  status?: string;
  search?: string;
}

export interface SaveExamPayload {
  title: string;
  examType: ExamType;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  subject: string;
  subjectCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
  weightagePercentage?: number;
  hall: string;
  invigilator: string;
  status?: ExamStatus;
  instructions?: string;
}

export interface SaveExamHallPayload {
  name: string;
  block: string;
  capacity: number;
  rows?: number;
  columns?: number;
  facilities?: string[];
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface SaveBulkMarksPayload {
  evaluatedBy?: string;
  records: {
    studentId: string;
    studentRollNo: string;
    studentName: string;
    marksObtained: number;
    remarks?: string;
  }[];
}

export const examService = {
  // Exams
  async getExams(params?: GetExamsParams) {
    const res = await api.get<{ success: boolean; total: number; exams: Exam[] }>('/exams', { params });
    return res.data;
  },

  async getExamById(id: string) {
    const res = await api.get<{ success: boolean; exam: Exam }>(`/exams/${id}`);
    return res.data;
  },

  async createExam(payload: SaveExamPayload) {
    const res = await api.post<{ success: boolean; message: string; exam: Exam }>('/exams', payload);
    return res.data;
  },

  async updateExam(id: string, payload: Partial<SaveExamPayload>) {
    const res = await api.put<{ success: boolean; message: string; exam: Exam }>(`/exams/${id}`, payload);
    return res.data;
  },

  async deleteExam(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/exams/${id}`);
    return res.data;
  },

  // Exam Halls
  async getHalls() {
    const res = await api.get<{ success: boolean; total: number; halls: ExamHall[] }>('/exams/halls/list');
    return res.data;
  },

  async createHall(payload: SaveExamHallPayload) {
    const res = await api.post<{ success: boolean; message: string; hall: ExamHall }>('/exams/halls/create', payload);
    return res.data;
  },

  async updateHall(id: string, payload: Partial<SaveExamHallPayload>) {
    const res = await api.put<{ success: boolean; message: string; hall: ExamHall }>(`/exams/halls/${id}`, payload);
    return res.data;
  },

  async deleteHall(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/exams/halls/${id}`);
    return res.data;
  },

  // Marks & Evaluation
  async getExamMarks(examId: string) {
    const res = await api.get<{
      success: boolean;
      exam: Exam;
      totalStudents: number;
      marks: ExamMark[];
    }>(`/exams/${examId}/marks`);
    return res.data;
  },

  async saveBulkMarks(examId: string, payload: SaveBulkMarksPayload) {
    const res = await api.post<{ success: boolean; message: string }>(`/exams/${examId}/marks/bulk`, payload);
    return res.data;
  },

  // Report Card
  async getStudentReportCard(studentId: string) {
    const res = await api.get<StudentReportCardResponse>(`/exams/student/${studentId}/report-card`);
    return res.data;
  },
};
