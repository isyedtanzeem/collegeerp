import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  locationRack?: string;
}

const BookSchema: Schema<IBook> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, default: 'General' },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    locationRack: { type: String, default: 'Rack A1' },
  },
  { timestamps: true }
);

export default mongoose.model<IBook>('Book', BookSchema);
