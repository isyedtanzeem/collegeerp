import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId | string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department?: string;
  submissionDate: Date;
  fileUrl?: string;
  fileName?: string;
  comments?: string;
  obtainedMarks?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'LATE' | 'GRADED' | 'RESUBMISSION_REQUESTED';
  gradedBy?: string;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentRollNo: { type: String, required: true },
    department: { type: String },
    submissionDate: { type: Date, default: Date.now },
    fileUrl: { type: String },
    fileName: { type: String },
    comments: { type: String },
    obtainedMarks: { type: Number },
    feedback: { type: String },
    status: {
      type: String,
      enum: ['SUBMITTED', 'LATE', 'GRADED', 'RESUBMISSION_REQUESTED'],
      default: 'SUBMITTED',
    },
    gradedBy: { type: String },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
