import api from './api.js';
import {
  TimetableSlot,
  CheckConflictResponse,
  RoomOccupancy,
  DayOfWeek,
} from '../types/index.js';

export interface GetTimetableParams {
  department?: string;
  semester?: string | number;
  section?: string;
  facultyName?: string;
  facultyId?: string;
  roomNumber?: string;
  dayOfWeek?: string;
  search?: string;
}

export interface CreateSlotPayload {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  department: string;
  course?: string;
  subject: string;
  subjectCode?: string;
  semester: number;
  section: string;
  facultyId?: string;
  facultyName: string;
  roomNumber: string;
  building?: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR';
  ignoreConflict?: boolean;
}

export interface CheckConflictPayload {
  slotId?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber: string;
  facultyName: string;
  department?: string;
  semester?: number;
  section?: string;
}

export const timetableService = {
  // Get list of timetable slots based on filters
  async getSlots(params?: GetTimetableParams) {
    const res = await api.get<{ success: boolean; count: number; slots: TimetableSlot[] }>(
      '/timetable',
      { params }
    );
    return res.data;
  },

  // Conflict Detection API
  async checkConflicts(payload: CheckConflictPayload) {
    const res = await api.post<CheckConflictResponse>('/timetable/check-conflicts', payload);
    return res.data;
  },

  // Room Stats & Allocations
  async getRoomStats() {
    const res = await api.get<{
      success: boolean;
      totalRoomsAllocated: number;
      rooms: RoomOccupancy[];
    }>('/timetable/rooms');
    return res.data;
  },

  // Create new timetable slot
  async createSlot(payload: CreateSlotPayload) {
    const res = await api.post<{ success: boolean; message: string; slot: TimetableSlot }>(
      '/timetable',
      payload
    );
    return res.data;
  },

  // Update existing timetable slot
  async updateSlot(id: string, payload: Partial<CreateSlotPayload>) {
    const res = await api.put<{ success: boolean; message: string; slot: TimetableSlot }>(
      `/timetable/${id}`,
      payload
    );
    return res.data;
  },

  // Delete timetable slot
  async deleteSlot(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/timetable/${id}`);
    return res.data;
  },
};
