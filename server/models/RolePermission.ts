import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './User.js';

export interface IPermissionModule {
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface IRolePermission extends Document {
  role: UserRole;
  description: string;
  isSystemRole: boolean;
  permissions: IPermissionModule[];
  updatedAt: Date;
}

const PermissionModuleSchema = new Schema(
  {
    module: { type: String, required: true },
    canRead: { type: Boolean, default: true },
    canCreate: { type: Boolean, default: false },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false },
  },
  { _id: false }
);

const RolePermissionSchema: Schema<IRolePermission> = new Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      enum: ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'ACCOUNTANT', 'LIBRARIAN'],
    },
    description: { type: String, default: '' },
    isSystemRole: { type: Boolean, default: true },
    permissions: [PermissionModuleSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IRolePermission>('RolePermission', RolePermissionSchema);
