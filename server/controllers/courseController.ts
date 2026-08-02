import { Response } from 'express';
import Course from '../models/Course.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get courses with search, department/semester/status filters & pagination
// @route   GET /api/courses
export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, semester, status, page, limit } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { code: searchRegex },
        { department: searchRegex },
        { eligibility: searchRegex },
        { facultyName: searchRegex },
        { description: searchRegex },
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

    // Counts for overview
    const totalCourses = await Course.countDocuments(query);
    const activeCount = await Course.countDocuments({ ...query, status: 'ACTIVE' });
    const inactiveCount = await Course.countDocuments({ ...query, status: 'INACTIVE' });

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 0;

    let coursesQuery = Course.find(query).sort({ createdAt: -1 });

    let courses;
    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      courses = await coursesQuery.skip(skip).limit(limitNum);
    } else {
      courses = await coursesQuery;
    }

    const totalPages = limitNum > 0 ? Math.ceil(totalCourses / limitNum) : 1;

    res.json({
      success: true,
      count: courses.length,
      total: totalCourses,
      activeCount,
      inactiveCount,
      page: pageNum,
      totalPages,
      courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new course
// @route   POST /api/courses
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, name, courseName, code, duration, credits, department, semester, eligibility, facultyName, description, status } = req.body;

    const finalTitle = (title || name || courseName || '').trim();
    const finalCode = (code || '').trim().toUpperCase();

    // Validation
    if (!finalTitle) {
      res.status(400).json({ success: false, message: 'Course Name / Title is required' });
      return;
    }

    if (!finalCode) {
      res.status(400).json({ success: false, message: 'Course Code is required' });
      return;
    }

    if (!department || typeof department !== 'string' || department.trim() === '') {
      res.status(400).json({ success: false, message: 'Department is required' });
      return;
    }

    const exists = await Course.findOne({ code: finalCode });
    if (exists) {
      res.status(400).json({ success: false, message: `Course with code '${finalCode}' already exists` });
      return;
    }

    const course = await Course.create({
      title: finalTitle,
      code: finalCode,
      duration: duration ? duration.trim() : '4 Years',
      credits: Number(credits) || 4,
      department: department.trim(),
      semester: Number(semester) || 1,
      eligibility: eligibility ? eligibility.trim() : '10+2 with 50% minimum aggregate',
      facultyName: facultyName ? facultyName.trim() : 'TBD',
      description: description ? description.trim() : '',
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const { title, name, courseName, code, duration, credits, department, semester, eligibility, facultyName, description, status } = req.body;

    const updateData: any = {};

    const finalTitle = title !== undefined ? title : name !== undefined ? name : courseName;
    if (finalTitle !== undefined) {
      if (!finalTitle || typeof finalTitle !== 'string' || finalTitle.trim() === '') {
        res.status(400).json({ success: false, message: 'Course name cannot be empty' });
        return;
      }
      updateData.title = finalTitle.trim();
    }

    if (code !== undefined) {
      if (!code || typeof code !== 'string' || code.trim() === '') {
        res.status(400).json({ success: false, message: 'Course code cannot be empty' });
        return;
      }
      const newCode = code.trim().toUpperCase();
      const duplicate = await Course.findOne({ _id: { $ne: req.params.id }, code: newCode });
      if (duplicate) {
        res.status(400).json({ success: false, message: `Another course with code '${newCode}' already exists` });
        return;
      }
      updateData.code = newCode;
    }

    if (duration !== undefined) updateData.duration = duration.trim();
    if (credits !== undefined) updateData.credits = Number(credits) || 1;
    if (department !== undefined) updateData.department = department.trim();
    if (semester !== undefined) updateData.semester = Number(semester) || 1;
    if (eligibility !== undefined) updateData.eligibility = eligibility.trim();
    if (facultyName !== undefined) updateData.facultyName = facultyName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

