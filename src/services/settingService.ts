import api from './api.js';

export interface SystemSettingData {
  _id?: string;
  collegeName: string;
  collegeCode: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  currentAcademicYear: string;
  currentSemester: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsAlerts: boolean;
  autoAttendanceReminder: boolean;
  themeMode: 'light' | 'dark' | 'system';
  primaryColor: string;
}

export interface PermissionModule {
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface RolePermissionData {
  _id?: string;
  role: string;
  description: string;
  isSystemRole: boolean;
  permissions: PermissionModule[];
}

export const settingService = {
  async getSystemSettings() {
    const res = await api.get<{ success: boolean; settings: SystemSettingData }>('/settings/system');
    return res.data;
  },

  async updateSystemSettings(data: Partial<SystemSettingData>) {
    const res = await api.put<{ success: boolean; message: string; settings: SystemSettingData }>(
      '/settings/system',
      data
    );
    return res.data;
  },

  async getRolePermissions() {
    const res = await api.get<{ success: boolean; permissions: RolePermissionData[] }>('/settings/permissions');
    return res.data;
  },

  async updateRolePermission(role: string, data: { permissions: PermissionModule[]; description?: string }) {
    const res = await api.put<{ success: boolean; message: string; rolePermission: RolePermissionData }>(
      `/settings/permissions/${role}`,
      data
    );
    return res.data;
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string; department?: string; designation?: string }) {
    const res = await api.put<{ success: boolean; message: string; user: any }>('/settings/profile', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await api.put<{ success: boolean; message: string }>('/settings/change-password', data);
    return res.data;
  },
};
