import api from './api.js';
import { LeaveRequest, LeaveStats } from '../types/index.js';

export interface GetLeavesParams {
  applicantType?: string;
  department?: string;
  status?: string;
  applicantId?: string;
  search?: string;
}

export interface ApplyLeavePayload {
  applicantType: 'STUDENT' | 'FACULTY';
  applicantId: string;
  applicantName: string;
  applicantRollNoOrCode: string;
  department: string;
  leaveType: 'CASUAL' | 'MEDICAL' | 'DUTY_LEAVE' | 'MATERNITY_PATERNITY' | 'EARNED' | 'OTHER';
  reason: string;
  startDate: string;
  endDate: string;
  attachment?: File | null;
}

export interface WorkflowActionPayload {
  status: 'APPROVED' | 'REJECTED';
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  approverComments?: string;
}

export const leaveService = {
  // Fetch leaves list with filters
  async getLeaves(params?: GetLeavesParams) {
    const res = await api.get<{ success: boolean; count: number; leaves: LeaveRequest[] }>('/leaves', {
      params,
    });
    return res.data;
  },

  // Fetch leave statistics
  async getStats() {
    const res = await api.get<{ success: boolean; stats: LeaveStats }>('/leaves/stats');
    return res.data;
  },

  // Fetch single leave detail
  async getLeaveById(id: string) {
    const res = await api.get<{ success: boolean; leave: LeaveRequest }>(`/leaves/${id}`);
    return res.data;
  },

  // Apply for new leave
  async applyLeave(payload: ApplyLeavePayload) {
    const formData = new FormData();
    formData.append('applicantType', payload.applicantType);
    formData.append('applicantId', payload.applicantId);
    formData.append('applicantName', payload.applicantName);
    formData.append('applicantRollNoOrCode', payload.applicantRollNoOrCode);
    formData.append('department', payload.department);
    formData.append('leaveType', payload.leaveType);
    formData.append('reason', payload.reason);
    formData.append('startDate', payload.startDate);
    formData.append('endDate', payload.endDate);

    if (payload.attachment) {
      formData.append('attachment', payload.attachment);
    }

    const res = await api.post<{ success: boolean; message: string; leave: LeaveRequest }>(
      '/leaves',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Approve or Reject leave (Workflow)
  async approveOrRejectLeave(id: string, payload: WorkflowActionPayload) {
    const res = await api.put<{ success: boolean; message: string; leave: LeaveRequest }>(
      `/leaves/${id}/workflow`,
      payload
    );
    return res.data;
  },

  // Cancel leave by applicant
  async cancelLeave(id: string) {
    const res = await api.put<{ success: boolean; message: string; leave: LeaveRequest }>(
      `/leaves/${id}/cancel`
    );
    return res.data;
  },

  // Delete leave application
  async deleteLeave(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/leaves/${id}`);
    return res.data;
  },
};
