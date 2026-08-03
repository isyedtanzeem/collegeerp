import mongoose, { Schema, Document } from 'mongoose';

export interface IFeePayment extends Document {
  receiptNo: string;
  feeRecordId: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department: string;
  course: string;
  feeCategory: string;
  amountPaid: number;
  paymentMode: 'ONLINE' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  transactionRef: string;
  paymentDate: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  receivedBy: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentSchema: Schema<IFeePayment> = new Schema(
  {
    receiptNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    feeRecordId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    studentRollNo: { type: String, required: true, uppercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    feeCategory: { type: String, required: true, trim: true },
    amountPaid: { type: Number, required: true, min: 1 },
    paymentMode: {
      type: String,
      enum: ['ONLINE', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHEQUE'],
      default: 'ONLINE',
    },
    transactionRef: { type: String, required: true, uppercase: true, trim: true },
    paymentDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED'],
      default: 'SUCCESS',
    },
    receivedBy: { type: String, default: 'Accounts Officer' },
    remarks: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FeePayment || mongoose.model<IFeePayment>('FeePayment', FeePaymentSchema);
