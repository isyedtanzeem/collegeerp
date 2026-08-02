import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  code: string;
  duration: string;
  credits: number;
  department: string;
  semester: number;
  eligibility: string;
  description?: string;
  facultyName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    duration: { type: String, default: '4 Years' },
    credits: { type: Number, required: true, default: 4 },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, default: 1 },
    eligibility: { type: String, default: '10+2 or equivalent with 50% minimum aggregate' },
    description: { type: String, default: '' },
    facultyName: { type: String, default: 'TBD' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);

