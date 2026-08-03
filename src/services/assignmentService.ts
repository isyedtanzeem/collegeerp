import api from './api.js';
import { Assignment, Submission, AssignmentStats } from '../types/index.js';

export interface GetAssignmentsParams {
  department?: string;
  subject?: string;
  semester?: string | number;
  status?: string;
  search?: string;
}

export interface SaveAssignmentPayload {
  title: string;
  description?: string;
  department: string;
  course?: string;
  subject: string;
  semester?: number;
  section?: string;
  facultyId?: string;
  facultyName: string;
  totalMarks: number;
  dueDate: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  attachment?: File | null;
}

export interface GradeSubmissionPayload {
  obtainedMarks?: number;
  feedback?: string;
  status?: 'GRADED' | 'RESUBMISSION_REQUESTED';
  gradedBy?: string;
}

export const assignmentService = {
  // Get all assignments with filters
  async getAssignments(params?: GetAssignmentsParams) {
    const res = await api.get<{ success: boolean; count: number; assignments: Assignment[] }>('/assignments', {
      params,
    });
    return res.data;
  },

  // Get assignment metrics
  async getStats() {
    const res = await api.get<{ success: boolean; stats: AssignmentStats }>('/assignments/stats');
    return res.data;
  },

  // Get single assignment details and its submissions
  async getAssignmentById(id: string) {
    const res = await api.get<{
      success: boolean;
      assignment: Assignment;
      submissions: Submission[];
    }>(`/assignments/${id}`);
    return res.data;
  },

  // Create new assignment (Faculty upload)
  async createAssignment(payload: SaveAssignmentPayload) {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    formData.append('department', payload.department);
    if (payload.course) formData.append('course', payload.course);
    formData.append('subject', payload.subject);
    if (payload.semester) formData.append('semester', payload.semester.toString());
    if (payload.section) formData.append('section', payload.section);
    if (payload.facultyId) formData.append('facultyId', payload.facultyId);
    formData.append('facultyName', payload.facultyName);
    formData.append('totalMarks', payload.totalMarks.toString());
    formData.append('dueDate', payload.dueDate);
    if (payload.status) formData.append('status', payload.status);

    if (payload.attachment) {
      formData.append('attachment', payload.attachment);
    }

    const res = await api.post<{ success: boolean; message: string; assignment: Assignment }>(
      '/assignments',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Update existing assignment
  async updateAssignment(id: string, payload: Partial<SaveAssignmentPayload>) {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.department) formData.append('department', payload.department);
    if (payload.course) formData.append('course', payload.course);
    if (payload.subject) formData.append('subject', payload.subject);
    if (payload.semester) formData.append('semester', payload.semester.toString());
    if (payload.section) formData.append('section', payload.section);
    if (payload.facultyName) formData.append('facultyName', payload.facultyName);
    if (payload.totalMarks) formData.append('totalMarks', payload.totalMarks.toString());
    if (payload.dueDate) formData.append('dueDate', payload.dueDate);
    if (payload.status) formData.append('status', payload.status);

    if (payload.attachment) {
      formData.append('attachment', payload.attachment);
    }

    const res = await api.put<{ success: boolean; message: string; assignment: Assignment }>(
      `/assignments/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Delete assignment
  async deleteAssignment(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/assignments/${id}`);
    return res.data;
  },

  // Get submissions for specific assignment
  async getSubmissionsForAssignment(assignmentId: string) {
    const res = await api.get<{ success: boolean; count: number; submissions: Submission[] }>(
      `/assignments/${assignmentId}/submissions`
    );
    return res.data;
  },

  // Get student's submissions
  async getStudentSubmissions(studentId?: string) {
    const res = await api.get<{ success: boolean; count: number; submissions: Submission[] }>(
      '/assignments/student/my-submissions',
      {
        params: { studentId },
      }
    );
    return res.data;
  },

  // Student submit assignment work (with file attachment)
  async submitAssignment(
    assignmentId: string,
    data: {
      studentId: string;
      studentName: string;
      studentRollNo: string;
      department?: string;
      comments?: string;
      submissionFile?: File | null;
    }
  ) {
    const formData = new FormData();
    formData.append('studentId', data.studentId);
    formData.append('studentName', data.studentName);
    formData.append('studentRollNo', data.studentRollNo);
    if (data.department) formData.append('department', data.department);
    if (data.comments) formData.append('comments', data.comments);

    if (data.submissionFile) {
      formData.append('submissionFile', data.submissionFile);
    }

    const res = await api.post<{ success: boolean; message: string; submission: Submission }>(
      `/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Grade student submission & provide feedback comments
  async gradeSubmission(submissionId: string, payload: GradeSubmissionPayload) {
    const res = await api.put<{ success: boolean; message: string; submission: Submission }>(
      `/assignments/submissions/${submissionId}/grade`,
      payload
    );
    return res.data;
  },
};
