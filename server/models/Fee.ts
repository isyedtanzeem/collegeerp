import mongoose, { Schema, Document } from 'mongoose';

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  enrollmentNo: string;
  department: string;
  title: string;
  amount: number;
  dueDate: Date;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentDate?: Date;
  receiptNo?: string;
}

const FeeSchema: Schema<IFee> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    enrollmentNo: { type: String, required: true },
    department: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING' },
    paymentDate: { type: Date },
    receiptNo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IFee>('Fee', FeeSchema);
