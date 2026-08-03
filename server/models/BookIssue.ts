import mongoose, { Schema, Document } from 'mongoose';

export interface IBookIssue extends Document {
  issueSlipNo: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  bookCategory: string;
  borrowerType: 'STUDENT' | 'FACULTY';
  studentId?: string;
  studentRollNo?: string;
  borrowerName: string;
  department: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fineAmount: number;
  fineStatus: 'NONE' | 'PENDING' | 'PAID' | 'WAIVED';
  issuedBy: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookIssueSchema: Schema<IBookIssue> = new Schema(
  {
    issueSlipNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    bookId: { type: String, required: true, index: true },
    bookTitle: { type: String, required: true, trim: true },
    bookIsbn: { type: String, required: true, trim: true },
    bookCategory: { type: String, default: 'General' },
    borrowerType: {
      type: String,
      enum: ['STUDENT', 'FACULTY'],
      default: 'STUDENT',
    },
    studentId: { type: String, index: true },
    studentRollNo: { type: String, uppercase: true, trim: true },
    borrowerName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: { type: String },
    status: {
      type: String,
      enum: ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'],
      default: 'ISSUED',
    },
    fineAmount: { type: Number, default: 0, min: 0 },
    fineStatus: {
      type: String,
      enum: ['NONE', 'PENDING', 'PAID', 'WAIVED'],
      default: 'NONE',
    },
    issuedBy: { type: String, default: 'Librarian' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.BookIssue || mongoose.model<IBookIssue>('BookIssue', BookIssueSchema);
