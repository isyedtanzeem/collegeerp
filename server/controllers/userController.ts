import { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { syncUserToEntity, syncUserDeletion } from '../services/userSyncService.js';

// @desc Get all users with search and role filter
// @route GET /api/v1/users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, department, search } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc Get user by ID
// @route GET /api/v1/users/:id
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc Create user (Admin / HOD)
// @route POST /api/v1/users
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, designation, enrollmentNo, employeeId, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password: password || 'DefaultPass123!',
      role,
      department: department || 'Computer Science',
      designation,
      enrollmentNo,
      employeeId,
      phone,
    });

    // Auto sync user to corresponding Faculty or Student collection
    await syncUserToEntity(user);

    res.status(201).json({
      success: true,
      message: 'User created and mapped to system directory successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc Update user
// @route PUT /api/v1/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    Object.assign(user, req.body);
    const updated = await user.save();

    // Auto sync updated details to Faculty or Student collection
    await syncUserToEntity(updated);

    res.json({ success: true, message: 'User updated and synchronized successfully', user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc Delete user
// @route DELETE /api/v1/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userEmail = user.email;
    await user.deleteOne();
    await syncUserDeletion(userEmail);

    res.json({ success: true, message: 'User and mapped record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
