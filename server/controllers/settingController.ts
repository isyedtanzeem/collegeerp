import { Response } from 'express';
import SystemSetting from '../models/SystemSetting.js';
import RolePermission from '../models/RolePermission.js';
import User, { UserRole } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Default initial permissions matrix for seed/fallback
const DEFAULT_ROLE_PERMISSIONS = [
  {
    role: 'SUPER_ADMIN',
    description: 'Full Unrestricted System Access & Configuration',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'faculty', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'academics', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'attendance', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'fees', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'library', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'reports', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'settings', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
    ],
  },
  {
    role: 'PRINCIPAL',
    description: 'Institutional Executive Oversight & Policy Control',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'faculty', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'academics', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'attendance', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'fees', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'library', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'reports', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'settings', canRead: true, canCreate: false, canUpdate: true, canDelete: false, canExport: false },
    ],
  },
  {
    role: 'HOD',
    description: 'Department Head Management & Curriculum Oversight',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'faculty', canRead: true, canCreate: false, canUpdate: true, canDelete: false, canExport: true },
      { module: 'academics', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'attendance', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'fees', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'library', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'reports', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'settings', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
    ],
  },
  {
    role: 'FACULTY',
    description: 'Academic Educator - Class Marks, Assignments & Attendance',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'faculty', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'academics', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'attendance', canRead: true, canCreate: true, canUpdate: true, canDelete: false, canExport: true },
      { module: 'fees', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'library', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'reports', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'settings', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
    ],
  },
  {
    role: 'STUDENT',
    description: 'Enrolled Scholar - View Grade, Attendance & Fee Invoices',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'faculty', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'academics', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'attendance', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'fees', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'library', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'reports', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'settings', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
    ],
  },
  {
    role: 'ACCOUNTANT',
    description: 'Financial Desk & Tuition Fee Management',
    isSystemRole: true,
    permissions: [
      { module: 'students', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'faculty', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'academics', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'attendance', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'fees', canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true },
      { module: 'library', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
      { module: 'reports', canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: true },
      { module: 'settings', canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false },
    ],
  },
];

// @desc    Get System Settings
// @route   GET /api/v1/settings/system
// @access  Protected
export const getSystemSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update System Settings
// @route   PUT /api/v1/settings/system
// @access  Protected (Super Admin / Principal)
export const updateSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    const updated = await settings.save();
    res.json({ success: true, message: 'System settings updated successfully', settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get Role Permissions Matrix
// @route   GET /api/v1/settings/permissions
// @access  Protected
export const getRolePermissions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let permissions = await RolePermission.find().sort({ role: 1 });
    if (!permissions || permissions.length === 0) {
      await RolePermission.insertMany(DEFAULT_ROLE_PERMISSIONS);
      permissions = await RolePermission.find().sort({ role: 1 });
    }
    res.json({ success: true, permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update Role Permission Matrix
// @route   PUT /api/v1/settings/permissions/:role
// @access  Protected (Super Admin)
export const updateRolePermission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    const { permissions, description } = req.body;

    let rolePerm = await RolePermission.findOne({ role: role as UserRole });
    if (!rolePerm) {
      rolePerm = new RolePermission({ role, description, permissions });
    } else {
      if (permissions) rolePerm.permissions = permissions;
      if (description) rolePerm.description = description;
    }

    const updated = await rolePerm.save();
    res.json({ success: true, message: `Permissions for ${role} updated successfully`, rolePermission: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update Current User Profile (with Profile Picture / Avatar)
// @route   PUT /api/v1/settings/profile
// @access  Protected
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found' });
      return;
    }

    const { name, phone, avatar, department, designation } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        designation: updatedUser.designation,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        enrollmentNo: updatedUser.enrollmentNo,
        employeeId: updatedUser.employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Change User Password
// @route   PUT /api/v1/settings/change-password
// @access  Protected
export const changeUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide current and new password' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
