import mongoose, { Schema, Document } from 'mongoose';

export interface INoticeAttachment {
  name: string;
  url: string;
  fileType: string;
  size?: string;
}

export interface INotice extends Document {
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EXAM' | 'EVENT' | 'FEE' | 'GENERAL' | 'ADMIN' | 'PLACEMENT' | 'SPORTS';
  postType: 'ADMIN_POST' | 'FACULTY_POST' | 'STUDENT_NOTICE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetRole: 'ALL' | 'FACULTY' | 'STUDENT' | 'HOD';
  department?: string;
  semester?: number;
  section?: string;
  postedBy: string;
  postedByRole?: string;
  postedById?: string;
  isImportant: boolean;
  pinned: boolean;
  attachments: INoticeAttachment[];
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema<INotice> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['ACADEMIC', 'EXAM', 'EVENT', 'FEE', 'GENERAL', 'ADMIN', 'PLACEMENT', 'SPORTS'],
      default: 'GENERAL',
    },
    postType: {
      type: String,
      enum: ['ADMIN_POST', 'FACULTY_POST', 'STUDENT_NOTICE'],
      default: 'STUDENT_NOTICE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'FACULTY', 'STUDENT', 'HOD'],
      default: 'ALL',
    },
    department: { type: String, default: 'ALL' },
    semester: { type: Number, default: 0 },
    section: { type: String, default: 'ALL' },
    postedBy: { type: String, required: true, default: 'Admin Office' },
    postedByRole: { type: String, default: 'SUPER_ADMIN' },
    postedById: { type: String },
    isImportant: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String, default: 'pdf' },
        size: { type: String, default: '1.2 MB' },
      },
    ],
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>('Notice', NoticeSchema);
