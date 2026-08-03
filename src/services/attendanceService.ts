import api from './api.js';
import {
  AttendanceRecord,
  AttendanceStatus,
  StudentAttendanceStatsResponse,
  MonthlyReportRow,
} from '../types/index.js';

export interface MarkBulkAttendancePayload {
  date: string;
  subject: string;
  department: string;
  course: string;
  semester: number;
  section: string;
  markedBy?: string;
  records: {
    studentId: string;
    studentRollNo: string;
    studentName: string;
    department?: string;
    course?: string;
    semester?: number;
    section?: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface MonthlyReportResponse {
  success: boolean;
  month: string;
  dates: string[];
  totalStudents: number;
  report: MonthlyReportRow[];
}

export interface AttendanceSummaryResponse {
  success: boolean;
  today: {
    date: string;
    totalMarkedToday: number;
    present: number;
    absent: number;
    late: number;
    holiday: number;
  };
  atRiskStudents: {
    _id: string;
    studentRollNo: string;
    studentName: string;
    department: string;
    course: string;
    total: number;
    present: number;
    absent: number;
    percentage: number;
  }[];
}

export const attendanceService = {
  async markBulkAttendance(payload: MarkBulkAttendancePayload) {
    const res = await api.post<{ success: boolean; message: string }>('/attendance/mark-bulk', payload);
    return res.data;
  },

  async getAttendance(params?: {
    studentId?: string;
    date?: string;
    department?: string;
    course?: string;
    semester?: string | number;
    section?: string;
    subject?: string;
    month?: string;
  }) {
    const res = await api.get<{ success: boolean; total: number; attendance: AttendanceRecord[] }>(
      '/attendance',
      { params }
    );
    return res.data;
  },

  async getStudentStats(studentId: string) {
    const res = await api.get<StudentAttendanceStatsResponse>(`/attendance/student-stats/${studentId}`);
    return res.data;
  },

  async getMonthlyReport(params: {
    department: string;
    course: string;
    semester?: string | number;
    section?: string;
    subject?: string;
    month: string; // YYYY-MM
  }) {
    const res = await api.get<MonthlyReportResponse>('/attendance/monthly-report', { params });
    return res.data;
  },

  async getSummary() {
    const res = await api.get<AttendanceSummaryResponse>('/attendance/summary');
    return res.data;
  },
};
