import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  credits: number;
  semester: number;
  department: string;
  facultyName?: string;
  facultyId?: mongoose.Types.ObjectId;
  type?: 'THEORY' | 'PRACTICAL' | 'ELECTIVE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema<ISubject> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    credits: { type: Number, required: true, default: 4 },
    semester: { type: Number, required: true, default: 1 },
    department: { type: String, required: true, trim: true },
    facultyName: { type: String, default: 'Unassigned', trim: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ['THEORY', 'PRACTICAL', 'ELECTIVE'], default: 'THEORY' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);
