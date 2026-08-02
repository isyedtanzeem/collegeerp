import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  experienceYears: number;
  department: string;
  subjects: string[];
  salary: number;
  joiningDate: string;
  photo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RETIRED';
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema: Schema<IFaculty> = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Assistant Professor', trim: true },
    qualification: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, default: 0 },
    department: { type: String, required: true, trim: true },
    subjects: [{ type: String, trim: true }],
    salary: { type: Number, required: true, default: 50000 },
    joiningDate: { type: String, required: true },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
