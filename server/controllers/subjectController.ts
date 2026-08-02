import { Response } from 'express';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get subjects with search, department, semester, status filters & pagination
// @route   GET /api/v1/subjects
export const getSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, semester, status, type, page, limit } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { department: searchRegex },
        { facultyName: searchRegex },
      ];
    }

    // Department filter
    if (department && department !== 'ALL') {
      query.department = department;
    }

    // Semester filter
    if (semester && semester !== 'ALL') {
      query.semester = Number(semester);
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Type filter
    if (type && type !== 'ALL') {
      query.type = type;
    }

    // Total counts & stats
    const totalSubjects = await Subject.countDocuments(query);
    const activeCount = await Subject.countDocuments({ ...query, status: 'ACTIVE' });
    const inactiveCount = await Subject.countDocuments({ ...query, status: 'INACTIVE' });

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 0;

    let subjectsQuery = Subject.find(query).sort({ code: 1 });

    let subjects;
    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      subjects = await subjectsQuery.skip(skip).limit(limitNum);
    } else {
      subjects = await subjectsQuery;
    }

    const totalPages = limitNum > 0 ? Math.ceil(totalSubjects / limitNum) : 1;

    res.json({
      success: true,
      count: subjects.length,
      total: totalSubjects,
      activeCount,
      inactiveCount,
      page: pageNum,
      totalPages,
      subjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single subject by ID
// @route   GET /api/v1/subjects/:id
export const getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new subject
// @route   POST /api/v1/subjects
export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, credits, semester, department, facultyName, facultyId, type, status } = req.body;

    const finalName = (name || '').trim();
    const finalCode = (code || '').trim().toUpperCase();

    // Validation
    if (!finalName) {
      res.status(400).json({ success: false, message: 'Subject Name is required' });
      return;
    }

    if (!finalCode) {
      res.status(400).json({ success: false, message: 'Subject Code is required' });
      return;
    }

    if (!department || typeof department !== 'string' || department.trim() === '') {
      res.status(400).json({ success: false, message: 'Department is required' });
      return;
    }

    const exists = await Subject.findOne({ code: finalCode });
    if (exists) {
      res.status(400).json({ success: false, message: `Subject with code '${finalCode}' already exists` });
      return;
    }

    const subject = await Subject.create({
      name: finalName,
      code: finalCode,
      credits: Number(credits) || 4,
      semester: Number(semester) || 1,
      department: department.trim(),
      facultyName: facultyName ? facultyName.trim() : 'Unassigned',
      facultyId: facultyId || null,
      type: ['THEORY', 'PRACTICAL', 'ELECTIVE'].includes(type) ? type : 'THEORY',
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existingSubject = await Subject.findById(req.params.id);
    if (!existingSubject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    const { name, code, credits, semester, department, facultyName, facultyId, type, status } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ success: false, message: 'Subject name cannot be empty' });
        return;
      }
      updateData.name = name.trim();
    }

    if (code !== undefined) {
      if (!code || typeof code !== 'string' || code.trim() === '') {
        res.status(400).json({ success: false, message: 'Subject code cannot be empty' });
        return;
      }
      const newCode = code.trim().toUpperCase();
      const duplicate = await Subject.findOne({ _id: { $ne: req.params.id }, code: newCode });
      if (duplicate) {
        res.status(400).json({ success: false, message: `Another subject with code '${newCode}' already exists` });
        return;
      }
      updateData.code = newCode;
    }

    if (credits !== undefined) updateData.credits = Number(credits) || 1;
    if (semester !== undefined) updateData.semester = Number(semester) || 1;
    if (department !== undefined) updateData.department = department.trim();
    if (facultyName !== undefined) updateData.facultyName = facultyName.trim();
    if (facultyId !== undefined) updateData.facultyId = facultyId || null;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Assign Faculty to Subject
// @route   PATCH /api/v1/subjects/:id/assign-faculty
export const assignFaculty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { facultyId, facultyName } = req.body;

    if (!facultyName || typeof facultyName !== 'string' || facultyName.trim() === '') {
      res.status(400).json({ success: false, message: 'Faculty Name is required for assignment' });
      return;
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }

    // Optional verification if facultyId is provided
    if (facultyId) {
      const facultyUser = await User.findById(facultyId);
      if (facultyUser) {
        subject.facultyName = facultyUser.name;
        subject.facultyId = facultyUser._id as any;
      } else {
        subject.facultyName = facultyName.trim();
        subject.facultyId = undefined;
      }
    } else {
      subject.facultyName = facultyName.trim();
    }

    await subject.save();

    res.json({
      success: true,
      message: `Faculty '${subject.facultyName}' assigned successfully to '${subject.code}'`,
      subject,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      res.status(404).json({ success: false, message: 'Subject not found' });
      return;
    }
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
