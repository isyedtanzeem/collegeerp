import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EXAM' | 'EVENT' | 'FEE' | 'GENERAL';
  targetRole: 'ALL' | 'FACULTY' | 'STUDENT' | 'HOD';
  postedBy: string;
  isImportant: boolean;
  createdAt: Date;
}

const NoticeSchema: Schema<INotice> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['ACADEMIC', 'EXAM', 'EVENT', 'FEE', 'GENERAL'],
      default: 'GENERAL',
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'FACULTY', 'STUDENT', 'HOD'],
      default: 'ALL',
    },
    postedBy: { type: String, required: true, default: 'Admin Office' },
    isImportant: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>('Notice', NoticeSchema);
