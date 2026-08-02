import { Response } from 'express';
import Department from '../models/Department.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get all departments (with search, status filter, pagination)
// @route   GET /api/departments
export const getDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, page, limit } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { hodName: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Calculate metrics
    const totalDepartments = await Department.countDocuments(query);
    const activeCount = await Department.countDocuments({ ...query, status: 'ACTIVE' });
    const inactiveCount = await Department.countDocuments({ ...query, status: 'INACTIVE' });

    let departmentsQuery = Department.find(query).sort({ createdAt: -1 });

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 0;

    let departments;
    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      departments = await departmentsQuery.skip(skip).limit(limitNum);
    } else {
      departments = await departmentsQuery;
    }

    const totalPages = limitNum > 0 ? Math.ceil(totalDepartments / limitNum) : 1;

    res.json({
      success: true,
      count: departments.length,
      total: totalDepartments,
      activeCount,
      inactiveCount,
      page: pageNum,
      totalPages,
      departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
export const getDepartmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }
    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new department
// @route   POST /api/departments
export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, hodName, description, status, totalFaculties, totalStudents } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ success: false, message: 'Department name is required' });
      return;
    }

    if (!code || typeof code !== 'string' || code.trim() === '') {
      res.status(400).json({ success: false, message: 'Department code is required' });
      return;
    }

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const exists = await Department.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
        { code: cleanCode },
      ],
    });

    if (exists) {
      const conflict = exists.code === cleanCode ? 'code' : 'name';
      res.status(400).json({ success: false, message: `Department with this ${conflict} already exists` });
      return;
    }

    const dept = await Department.create({
      name: cleanName,
      code: cleanCode,
      hodName: hodName ? hodName.trim() : 'Unassigned',
      description: description ? description.trim() : '',
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      totalFaculties: Number(totalFaculties) || 0,
      totalStudents: Number(totalStudents) || 0,
    });

    res.status(201).json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
export const updateDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, hodName, description, status, totalFaculties, totalStudents } = req.body;

    const existingDept = await Department.findById(req.params.id);
    if (!existingDept) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ success: false, message: 'Department name cannot be empty' });
        return;
      }
      updateData.name = name.trim();
    }

    if (code !== undefined) {
      if (!code || typeof code !== 'string' || code.trim() === '') {
        res.status(400).json({ success: false, message: 'Department code cannot be empty' });
        return;
      }
      updateData.code = code.trim().toUpperCase();
    }

    // Check conflict with other departments
    if (updateData.name || updateData.code) {
      const conflict = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(updateData.name ? [{ name: { $regex: new RegExp(`^${updateData.name}$`, 'i') } }] : []),
          ...(updateData.code ? [{ code: updateData.code }] : []),
        ],
      });

      if (conflict) {
        const field = conflict.code === updateData.code ? 'code' : 'name';
        res.status(400).json({ success: false, message: `Another department with this ${field} already exists` });
        return;
      }
    }

    if (hodName !== undefined) updateData.hodName = hodName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (totalFaculties !== undefined) updateData.totalFaculties = Number(totalFaculties) || 0;
    if (totalStudents !== undefined) updateData.totalStudents = Number(totalStudents) || 0;

    const dept = await Department.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, department: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found' });
      return;
    }
    res.json({ success: true, message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
