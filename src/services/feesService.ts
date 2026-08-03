import api from './api.js';
import {
  FeeRecord,
  FeePayment,
  FeeStats,
  ReceiptDetailsResponse,
} from '../types/index.js';

export interface GetFeesParams {
  studentId?: string;
  department?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface SaveFeePayload {
  studentId: string;
  category: string;
  title: string;
  dueDate: string;
  baseAmount: number;
  fineAmount?: number;
  scholarshipAmount?: number;
  remarks?: string;
}

export interface BatchFeePayload {
  department?: string;
  category: string;
  title: string;
  dueDate: string;
  baseAmount: number;
  scholarshipPercentage?: number;
}

export interface ProcessPaymentPayload {
  feeRecordId: string;
  amountPaid: number;
  paymentMode: string;
  transactionRef?: string;
  receivedBy?: string;
  remarks?: string;
}

export const feesService = {
  // Get fees dashboard statistics
  async getFeeStats() {
    const res = await api.get<{ success: boolean; stats: FeeStats }>('/fees/stats');
    return res.data;
  },

  // Get fee records
  async getFees(params?: GetFeesParams) {
    const res = await api.get<{ success: boolean; total: number; fees: FeeRecord[] }>('/fees', { params });
    return res.data;
  },

  // Create single fee record
  async createFee(payload: SaveFeePayload) {
    const res = await api.post<{ success: boolean; message: string; fee: FeeRecord }>('/fees', payload);
    return res.data;
  },

  // Update fee record
  async updateFee(id: string, payload: Partial<SaveFeePayload>) {
    const res = await api.put<{ success: boolean; message: string; fee: FeeRecord }>(`/fees/${id}`, payload);
    return res.data;
  },

  // Delete fee record
  async deleteFee(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/fees/${id}`);
    return res.data;
  },

  // Batch generate fees
  async batchGenerateFees(payload: BatchFeePayload) {
    const res = await api.post<{ success: boolean; message: string; totalAssigned: number }>('/fees/generate-batch', payload);
    return res.data;
  },

  // Process payment
  async processPayment(payload: ProcessPaymentPayload) {
    const res = await api.post<{
      success: boolean;
      message: string;
      payment: FeePayment;
      feeRecord: FeeRecord;
    }>('/fees/pay', payload);
    return res.data;
  },

  // Get payment history roster
  async getPaymentHistory(params?: { studentId?: string; paymentMode?: string; search?: string }) {
    const res = await api.get<{ success: boolean; total: number; payments: FeePayment[] }>('/fees/payments', { params });
    return res.data;
  },

  // Get printable receipt details
  async getReceiptDetails(paymentId: string) {
    const res = await api.get<ReceiptDetailsResponse>(`/fees/receipt/${paymentId}`);
    return res.data;
  },

  // Apply late fines to overdue records
  async applyLateFine(payload: { fineAmount: number; category?: string }) {
    const res = await api.post<{ success: boolean; message: string; updatedRecords: number }>('/fees/apply-fine', payload);
    return res.data;
  },

  // Apply scholarship waiver
  async applyScholarship(payload: { feeRecordId: string; scholarshipAmount: number; remarks?: string }) {
    const res = await api.post<{ success: boolean; message: string; fee: FeeRecord }>('/fees/apply-scholarship', payload);
    return res.data;
  },
};
