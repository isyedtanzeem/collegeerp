import mongoose, { Schema, Document } from 'mongoose';

export interface IBookCategory extends Document {
  name: string;
  code: string;
  description?: string;
  locationSection: string;
  maxIssueDays: number;
  finePerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookCategorySchema: Schema<IBookCategory> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    locationSection: { type: String, default: 'Main Library Floor 1' },
    maxIssueDays: { type: Number, default: 14, min: 1 },
    finePerDay: { type: Number, default: 2, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.BookCategory || mongoose.model<IBookCategory>('BookCategory', BookCategorySchema);
