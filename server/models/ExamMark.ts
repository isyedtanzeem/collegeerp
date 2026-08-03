import mongoose, { Schema, Document } from 'mongoose';

export interface IExamMark extends Document {
  examId: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  isPassed: boolean;
  remarks?: string;
  evaluatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamMarkSchema: Schema<IExamMark> = new Schema(
  {
    examId: { type: String, required: true, ref: 'Exam' },
    studentId: { type: String, required: true, ref: 'Student' },
    studentRollNo: { type: String, required: true, uppercase: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    marksObtained: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 100 },
    percentage: { type: Number, required: true, default: 0 },
    grade: { type: String, required: true, default: 'F' },
    isPassed: { type: Boolean, required: true, default: false },
    remarks: { type: String, default: '' },
    evaluatedBy: { type: String, default: 'Faculty Evaluator' },
  },
  { timestamps: true }
);

// Compound index: 1 mark entry per student per exam
ExamMarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IExamMark>('ExamMark', ExamMarkSchema);
