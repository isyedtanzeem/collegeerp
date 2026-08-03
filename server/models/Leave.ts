import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  applicantType: 'STUDENT' | 'FACULTY';
  applicantId: string;
  applicantName: string;
  applicantRollNoOrCode: string; // Roll No for Student, Faculty ID for Faculty
  department: string;
  leaveType: 'CASUAL' | 'MEDICAL' | 'DUTY_LEAVE' | 'MATERNITY_PATERNITY' | 'EARNED' | 'OTHER';
  reason: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  approverComments?: string;
  actionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    applicantType: {
      type: String,
      enum: ['STUDENT', 'FACULTY'],
      required: true,
      default: 'STUDENT',
    },
    applicantId: { type: String, required: true },
    applicantName: { type: String, required: true, trim: true },
    applicantRollNoOrCode: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    leaveType: {
      type: String,
      enum: ['CASUAL', 'MEDICAL', 'DUTY_LEAVE', 'MATERNITY_PATERNITY', 'EARNED', 'OTHER'],
      required: true,
      default: 'CASUAL',
    },
    reason: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, default: 1 },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    approverId: { type: String },
    approverName: { type: String },
    approverRole: { type: String },
    approverComments: { type: String, trim: true },
    actionDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILeave>('Leave', leaveSchema);
