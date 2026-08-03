import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  admissionNumber: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  department: string;
  course: string;
  semester: number;
  section: string;
  guardian?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  address?: string;
  photo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema<IStudent> = new Schema(
  {
    admissionNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dob: { type: String, default: '' },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'MALE' },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], default: 'O+' },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, required: true, default: 'A', uppercase: true, trim: true },
    guardian: {
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      relation: { type: String, default: 'Parent', trim: true },
    },
    address: { type: String, default: '', trim: true },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

StudentSchema.index({ department: 1, course: 1, semester: 1, section: 1 });
StudentSchema.index({ name: 'text', studentId: 'text', admissionNumber: 'text' });

export default mongoose.model<IStudent>('Student', StudentSchema);
