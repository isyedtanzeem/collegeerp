import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'HOD'
  | 'FACULTY'
  | 'STUDENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN';

export interface IUserModulePermission {
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  designation?: string; // e.g. Professor, Assistant Professor, Chief Accountant
  enrollmentNo?: string; // For students
  employeeId?: string; // For staff
  semester?: number; // For students
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  customPermissions?: IUserModulePermission[];
  allowedBehaviors?: string[];
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'ACCOUNTANT', 'LIBRARIAN'],
      default: 'STUDENT',
    },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    department: { type: String, default: 'General' },
    designation: { type: String, default: '' },
    enrollmentNo: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    semester: { type: Number, default: 1 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    customPermissions: [
      {
        module: { type: String },
        canRead: { type: Boolean, default: true },
        canCreate: { type: Boolean, default: false },
        canUpdate: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
        canExport: { type: Boolean, default: false },
      },
    ],
    allowedBehaviors: [{ type: String }],
    refreshToken: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function (): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export default mongoose.model<IUser>('User', UserSchema);
