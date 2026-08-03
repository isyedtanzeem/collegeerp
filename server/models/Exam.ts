import mongoose, { Schema, Document } from 'mongoose';

export type ExamType = 'INTERNAL' | 'SEMESTER' | 'PRACTICAL' | 'ASSIGNMENT';
export type ExamStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'RESULTS_PUBLISHED';

export interface IExam extends Document {
  title: string;
  examType: ExamType;
  department: string;
  course: string;
  semester: number;
  academicYear: string;
  subject: string;
  subjectCode: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. '09:30 AM'
  endTime: string; // e.g. '12:30 PM'
  totalMarks: number;
  passMarks: number;
  weightagePercentage?: number;
  hall: string;
  invigilator: string;
  status: ExamStatus;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema<IExam> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    examType: {
      type: String,
      enum: ['INTERNAL', 'SEMESTER', 'PRACTICAL', 'ASSIGNMENT'],
      default: 'INTERNAL',
    },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, default: 1 },
    academicYear: { type: String, required: true, default: '2025-2026' },
    subject: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true, uppercase: true },
    examDate: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true, default: '09:30 AM' },
    endTime: { type: String, required: true, default: '12:30 PM' },
    totalMarks: { type: Number, required: true, default: 100 },
    passMarks: { type: Number, required: true, default: 40 },
    weightagePercentage: { type: Number, default: 100 },
    hall: { type: String, required: true, default: 'Main Exam Hall A' },
    invigilator: { type: String, required: true, default: 'Faculty Invigilator' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESULTS_PUBLISHED'],
      default: 'SCHEDULED',
    },
    instructions: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', ExamSchema);
