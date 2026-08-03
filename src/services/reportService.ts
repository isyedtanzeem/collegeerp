import api from './api.js';

export interface AttendanceReportData {
  summary: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    overallPercentage: number;
  };
  departmentBreakdown: Array<{
    department: string;
    total: number;
    present: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    presentRate: number;
    absentRate: number;
  }>;
  defaultersList: Array<{
    studentId: string;
    rollNo: string;
    name: string;
    department: string;
    semester: number;
    totalClasses: number;
    attended: number;
    percentage: number;
  }>;
}

export interface FeeReportData {
  summary: {
    totalInvoiced: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    collectionRate: number;
  };
  departmentFees: Array<{
    department: string;
    invoiced: number;
    collected: number;
    pending: number;
  }>;
  feeCategoryBreakdown: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  monthlyCollections: Array<{
    month: string;
    collected: number;
    target: number;
  }>;
  detailedRecords: Array<{
    enrollmentNo: string;
    studentName: string;
    department: string;
    title: string;
    amount: number;
    status: string;
    receiptNo?: string;
    dueDate?: string;
  }>;
}

export interface StudentReportData {
  summary: {
    totalStudents: number;
    activeStudents: number;
    graduatedStudents: number;
  };
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  genderDistribution: Array<{
    name: string;
    count: number;
    value: number;
    color: string;
  }>;
  semesterDistribution: Array<{
    semester: string;
    count: number;
  }>;
  academicGradeBands: Array<{
    band: string;
    count: number;
    percentage: number;
  }>;
  studentsList: Array<any>;
}

export interface FacultyReportData {
  summary: {
    totalFaculty: number;
    phdHolders: number;
    averageExperienceYears: number;
    activeFaculty: number;
  };
  departmentFaculty: Array<{
    department: string;
    count: number;
    professors: number;
    associate: number;
    assistant: number;
  }>;
  designationDistribution: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  qualificationDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  experienceBands: Array<{
    band: string;
    count: number;
  }>;
  facultyList: Array<any>;
}

export interface DepartmentReportData {
  summary: {
    totalDepartments: number;
    totalEnrolled: number;
    totalFaculty: number;
    averagePassRate: number;
  };
  departmentMatrix: Array<{
    code: string;
    name: string;
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    studentFacultyRatio: string;
    passPercentage: number;
    attendanceRate: number;
    status: string;
  }>;
}

export const reportService = {
  async getAttendanceReport(department?: string) {
    const res = await api.get<AttendanceReportData>('/reports/attendance', {
      params: { department },
    });
    return res.data;
  },

  async getFeeReport() {
    const res = await api.get<FeeReportData>('/reports/fees');
    return res.data;
  },

  async getStudentReport() {
    const res = await api.get<StudentReportData>('/reports/students');
    return res.data;
  },

  async getFacultyReport() {
    const res = await api.get<FacultyReportData>('/reports/faculty');
    return res.data;
  },

  async getDepartmentReport() {
    const res = await api.get<DepartmentReportData>('/reports/departments');
    return res.data;
  },
};
