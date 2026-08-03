import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeRecord extends Document {
  studentId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  category: 'Tuition Fee' | 'Hostel Fee' | 'Exam Fee' | 'Transport Fee' | 'Library Fee' | 'Admission Fee' | 'Other';
  title: string;
  dueDate: string;
  baseAmount: number;
  fineAmount: number;
  scholarshipAmount: number;
  totalPayable: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeRecordSchema: Schema<IFeeRecord> = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    studentRollNo: { type: String, required: true, uppercase: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, default: 1 },
    academicYear: { type: String, default: '2025-2026' },
    category: {
      type: String,
      enum: ['Tuition Fee', 'Hostel Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Admission Fee', 'Other'],
      required: true,
      default: 'Tuition Fee',
    },
    title: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    baseAmount: { type: Number, required: true, min: 0 },
    fineAmount: { type: Number, default: 0, min: 0 },
    scholarshipAmount: { type: Number, default: 0, min: 0 },
    totalPayable: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'PENDING', 'OVERDUE'],
      default: 'PENDING',
    },
    remarks: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FeeRecord || mongoose.model<IFeeRecord>('FeeRecord', FeeRecordSchema);
