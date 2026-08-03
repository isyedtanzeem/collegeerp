import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
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
  updatedAt: Date;
}

const SystemSettingSchema: Schema<ISystemSetting> = new Schema(
  {
    collegeName: { type: String, default: 'Apex Institute of Engineering & Technology' },
    collegeCode: { type: String, default: 'APEX-EDU-2026' },
    email: { type: String, default: 'admin@apex.edu' },
    phone: { type: String, default: '+1 (555) 234-5678' },
    address: { type: String, default: '100 University Campus Drive, Education Heights, CA 90210' },
    logoUrl: { type: String, default: '' },
    currentAcademicYear: { type: String, default: '2025-2026' },
    currentSemester: { type: String, default: 'Spring 2026' },
    maintenanceMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    autoAttendanceReminder: { type: Boolean, default: true },
    themeMode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    primaryColor: { type: String, default: '#0284c7' },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
