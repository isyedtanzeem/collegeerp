import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  department: string;
  course?: string;
  subject: string;
  semester?: number;
  section?: string;
  facultyId?: string;
  facultyName: string;
  totalMarks: number;
  dueDate: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, default: 1 },
    section: { type: String, default: 'A' },
    facultyId: { type: String, trim: true },
    facultyName: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true, default: 100 },
    dueDate: { type: Date, required: true },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    status: {
      type: String,
      enum: ['PUBLISHED', 'DRAFT', 'CLOSED'],
      default: 'PUBLISHED',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);
