import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetableSlot extends Document {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string; // e.g., '09:00'
  endTime: string;   // e.g., '10:00'
  department: string;
  course?: string;
  subject: string;
  subjectCode?: string;
  semester: number;
  section: string;
  facultyId?: string;
  facultyName: string;
  roomNumber: string;
  building?: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR';
  academicYear?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSlotSchema = new Schema<ITimetableSlot>(
  {
    dayOfWeek: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
    },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, default: 'B.Tech CS' },
    subject: { type: String, required: true, trim: true },
    subjectCode: { type: String, trim: true },
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, required: true, default: 'A' },
    facultyId: { type: String, trim: true },
    facultyName: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    building: { type: String, default: 'Main Academic Block' },
    slotType: {
      type: String,
      enum: ['LECTURE', 'LAB', 'TUTORIAL', 'SEMINAR'],
      default: 'LECTURE',
    },
    academicYear: { type: String, default: '2026-2027' },
  },
  { timestamps: true }
);

export default mongoose.model<ITimetableSlot>('TimetableSlot', timetableSlotSchema);
