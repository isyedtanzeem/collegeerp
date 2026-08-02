import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  course: string;
  semester: number;
  section: string;
  subject: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY';
  remarks?: string;
  markedBy: string;
  markedByRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    studentId: { type: String, required: true },
    studentRollNo: { type: String, required: true, uppercase: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, required: true, uppercase: true, default: 'A' },
    subject: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HOLIDAY'],
      default: 'PRESENT',
    },
    remarks: { type: String, default: '' },
    markedBy: { type: String, required: true, default: 'System Faculty' },
    markedByRole: { type: String, default: 'FACULTY' },
  },
  { timestamps: true }
);

// Compound index to ensure 1 attendance record per student per subject per date
AttendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
