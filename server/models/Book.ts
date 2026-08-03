import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies: number;
  locationRack?: string;
  price?: number;
  callNumber?: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'MAINTENANCE';
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema<IBook> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true, uppercase: true },
    category: { type: String, required: true, default: 'General' },
    publisher: { type: String, default: 'Academic Press' },
    edition: { type: String, default: '1st Edition' },
    totalCopies: { type: Number, required: true, default: 1, min: 0 },
    availableCopies: { type: Number, required: true, default: 1, min: 0 },
    locationRack: { type: String, default: 'Rack A-1' },
    price: { type: Number, default: 0 },
    callNumber: { type: String, default: 'LIB-001' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OUT_OF_STOCK', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
