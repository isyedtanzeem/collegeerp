import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Configure Multer Storage for Faculty Photos
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `faculty-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed'));
    }
  },
});

// 1. GET ALL FACULTY (With Search, Filter & Pagination)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      designation,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    // Search by Name, Employee ID, Email, Qualification, Phone, Subjects
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { qualification: searchRegex },
        { designation: searchRegex },
        { subjects: searchRegex },
      ];
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (designation && designation !== 'ALL') {
      query.designation = designation;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [facultyMembers, total, activeCount, totalPayroll] = await Promise.all([
      Faculty.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Faculty.countDocuments(query),
      Faculty.countDocuments({ status: 'ACTIVE' }),
      Faculty.aggregate([{ $group: { _id: null, totalSalary: { $sum: '$salary' } } }]),
    ]);

    const totalSalaryVal = totalPayroll.length > 0 ? totalPayroll[0].totalSalary : 0;

    res.json({
      success: true,
      faculty: facultyMembers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      activeCount,
      totalSalary: totalSalaryVal,
    });
  } catch (err: any) {
    console.error('Error in GET /faculty:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch faculty list' });
  }
});

// 2. GET SINGLE FACULTY BY ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      res.status(404).json({ success: false, message: 'Faculty member not found' });
      return;
    }
    res.json({ success: true, faculty });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching faculty details' });
  }
});

// 3. UPLOAD FACULTY PHOTO ENDPOINT
router.post('/upload', upload.single('photo'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No photo uploaded' });
      return;
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      photoUrl,
      filename: req.file.filename,
      message: 'Faculty photo uploaded successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upload photo' });
  }
});

// 4. CREATE NEW FACULTY
router.post('/', upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // Check duplicate employeeId or email
    const existing = await Faculty.findOne({
      $or: [
        { employeeId: body.employeeId?.toUpperCase() },
        { email: body.email?.toLowerCase() },
      ],
    });

    if (existing) {
      const isIdMatch = existing.employeeId === body.employeeId?.toUpperCase();
      res.status(400).json({
        success: false,
        message: isIdMatch
          ? 'Employee ID already exists.'
          : 'Email address already belongs to another faculty member.',
      });
      return;
    }

    let photoUrl = body.photo || '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Process subjects array
    let subjectsArr: string[] = [];
    if (Array.isArray(body.subjects)) {
      subjectsArr = body.subjects;
    } else if (typeof body.subjects === 'string') {
      try {
        subjectsArr = JSON.parse(body.subjects);
      } catch (e) {
        subjectsArr = body.subjects.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    const newFaculty = await Faculty.create({
      employeeId: body.employeeId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      designation: body.designation || 'Assistant Professor',
      qualification: body.qualification,
      experienceYears: Number(body.experienceYears) || 0,
      department: body.department,
      subjects: subjectsArr,
      salary: Number(body.salary) || 50000,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      photo: photoUrl,
      status: body.status || 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Faculty registered successfully',
      faculty: newFaculty,
    });
  } catch (err: any) {
    console.error('Error registering faculty:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to register faculty' });
  }
});

// 5. UPDATE FACULTY
router.put('/:id', upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      res.status(404).json({ success: false, message: 'Faculty member not found' });
      return;
    }

    const body = req.body;

    // Check duplicate employeeId/email
    if (
      (body.employeeId && body.employeeId.toUpperCase() !== faculty.employeeId) ||
      (body.email && body.email.toLowerCase() !== faculty.email)
    ) {
      const existing = await Faculty.findOne({
        _id: { $ne: faculty._id },
        $or: [
          ...(body.employeeId ? [{ employeeId: body.employeeId.toUpperCase() }] : []),
          ...(body.email ? [{ email: body.email.toLowerCase() }] : []),
        ],
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Employee ID or Email belongs to another faculty member.',
        });
        return;
      }
    }

    if (req.file) {
      body.photo = `/uploads/${req.file.filename}`;
    }

    // Process subjects array
    if (body.subjects !== undefined) {
      if (Array.isArray(body.subjects)) {
        faculty.subjects = body.subjects;
      } else if (typeof body.subjects === 'string') {
        try {
          faculty.subjects = JSON.parse(body.subjects);
        } catch (e) {
          faculty.subjects = body.subjects.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (body.employeeId) faculty.employeeId = body.employeeId;
    if (body.name) faculty.name = body.name;
    if (body.email) faculty.email = body.email;
    if (body.phone) faculty.phone = body.phone;
    if (body.designation) faculty.designation = body.designation;
    if (body.qualification) faculty.qualification = body.qualification;
    if (body.experienceYears !== undefined) faculty.experienceYears = Number(body.experienceYears);
    if (body.department) faculty.department = body.department;
    if (body.salary !== undefined) faculty.salary = Number(body.salary);
    if (body.joiningDate) faculty.joiningDate = body.joiningDate;
    if (body.photo) faculty.photo = body.photo;
    if (body.status) faculty.status = body.status;

    await faculty.save();

    res.json({
      success: true,
      message: 'Faculty details updated successfully',
      faculty,
    });
  } catch (err: any) {
    console.error('Error updating faculty:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update faculty details' });
  }
});

// 6. DELETE FACULTY
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      res.status(404).json({ success: false, message: 'Faculty member not found' });
      return;
    }

    res.json({
      success: true,
      message: `Faculty ${faculty.name} (${faculty.employeeId}) removed successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete faculty' });
  }
});

export default router;
