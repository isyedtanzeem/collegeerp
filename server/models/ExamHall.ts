import mongoose, { Schema, Document } from 'mongoose';

export interface IExamHall extends Document {
  name: string;
  block: string;
  capacity: number;
  rows: number;
  columns: number;
  facilities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  createdAt: Date;
  updatedAt: Date;
}

const ExamHallSchema: Schema<IExamHall> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    block: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, default: 60 },
    rows: { type: Number, default: 6 },
    columns: { type: Number, default: 10 },
    facilities: [{ type: String }],
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExamHall>('ExamHall', ExamHallSchema);
