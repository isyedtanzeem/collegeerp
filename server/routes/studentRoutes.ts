import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Student from '../models/Student.js';

const router = express.Router();

// Configure Multer Storage for Student Photos
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
    cb(null, `student-${uniqueSuffix}${ext}`);
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

// 1. GET ALL STUDENTS (With Search, Filter & Pagination)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      course,
      semester,
      section,
      gender,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    // Search by Name, Admission Number, Student ID, Email, Phone
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { admissionNumber: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (course && course !== 'ALL') {
      query.course = course;
    }

    if (semester && semester !== 'ALL') {
      query.semester = Number(semester);
    }

    if (section && section !== 'ALL') {
      query.section = section;
    }

    if (gender && gender !== 'ALL') {
      query.gender = gender;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [students, total, activeCount, maleCount, femaleCount] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Student.countDocuments(query),
      Student.countDocuments({ status: 'ACTIVE' }),
      Student.countDocuments({ gender: 'MALE' }),
      Student.countDocuments({ gender: 'FEMALE' }),
    ]);

    res.json({
      success: true,
      students,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      activeCount,
      maleCount,
      femaleCount,
    });
  } catch (err: any) {
    console.error('Error in GET /students:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch students' });
  }
});

// 2. GET SINGLE STUDENT BY ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student profile' });
  }
});

// 3. UPLOAD PHOTO ENDPOINT
router.post('/upload', upload.single('photo'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded' });
      return;
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      photoUrl,
      filename: req.file.filename,
      message: 'Student photo uploaded successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to upload photo' });
  }
});

// 4. CREATE NEW STUDENT (REGISTER)
router.post('/', upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // Check for existing admissionNumber, studentId, or email
    const existing = await Student.findOne({
      $or: [
        { admissionNumber: body.admissionNumber?.toUpperCase() },
        { studentId: body.studentId?.toUpperCase() },
        { email: body.email?.toLowerCase() },
      ],
    });

    if (existing) {
      let duplicateField = 'Record';
      if (existing.admissionNumber === body.admissionNumber?.toUpperCase()) duplicateField = 'Admission Number';
      else if (existing.studentId === body.studentId?.toUpperCase()) duplicateField = 'Student ID';
      else if (existing.email === body.email?.toLowerCase()) duplicateField = 'Email address';

      res.status(400).json({
        success: false,
        message: `${duplicateField} already exists in the system.`,
      });
      return;
    }

    let photoUrl = body.photo || '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Format guardian object if stringified or separate fields
    let guardianObj = { name: '', phone: '', relation: 'Parent' };
    if (typeof body.guardian === 'string') {
      try {
        guardianObj = JSON.parse(body.guardian);
      } catch (e) {
        guardianObj = { name: body.guardianName || '', phone: body.guardianPhone || '', relation: body.guardianRelation || 'Parent' };
      }
    } else if (body.guardian && typeof body.guardian === 'object') {
      guardianObj = body.guardian;
    } else if (body.guardianName || body.guardianPhone) {
      guardianObj = {
        name: body.guardianName || '',
        phone: body.guardianPhone || '',
        relation: body.guardianRelation || 'Parent',
      };
    }

    const newStudent = await Student.create({
      admissionNumber: body.admissionNumber,
      studentId: body.studentId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      dob: body.dob || '',
      gender: body.gender || 'MALE',
      bloodGroup: body.bloodGroup || 'O+',
      department: body.department,
      course: body.course,
      semester: Number(body.semester) || 1,
      section: body.section || 'A',
      guardian: guardianObj,
      address: body.address || '',
      photo: photoUrl,
      status: body.status || 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: newStudent,
    });
  } catch (err: any) {
    console.error('Error creating student:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to register student' });
  }
});

// 5. UPDATE STUDENT
router.put('/:id', upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const body = req.body;

    // Check duplicate admissionNumber / studentId / email if modified
    if (
      (body.admissionNumber && body.admissionNumber.toUpperCase() !== student.admissionNumber) ||
      (body.studentId && body.studentId.toUpperCase() !== student.studentId) ||
      (body.email && body.email.toLowerCase() !== student.email)
    ) {
      const existing = await Student.findOne({
        _id: { $ne: student._id },
        $or: [
          ...(body.admissionNumber ? [{ admissionNumber: body.admissionNumber.toUpperCase() }] : []),
          ...(body.studentId ? [{ studentId: body.studentId.toUpperCase() }] : []),
          ...(body.email ? [{ email: body.email.toLowerCase() }] : []),
        ],
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Admission Number, Student ID, or Email already belongs to another student.',
        });
        return;
      }
    }

    if (req.file) {
      body.photo = `/uploads/${req.file.filename}`;
    }

    // Format guardian object
    if (typeof body.guardian === 'string') {
      try {
        body.guardian = JSON.parse(body.guardian);
      } catch (e) {
        body.guardian = {
          name: body.guardianName || student.guardian?.name || '',
          phone: body.guardianPhone || student.guardian?.phone || '',
          relation: body.guardianRelation || student.guardian?.relation || 'Parent',
        };
      }
    } else if (body.guardianName || body.guardianPhone || body.guardianRelation) {
      body.guardian = {
        name: body.guardianName !== undefined ? body.guardianName : student.guardian?.name,
        phone: body.guardianPhone !== undefined ? body.guardianPhone : student.guardian?.phone,
        relation: body.guardianRelation !== undefined ? body.guardianRelation : student.guardian?.relation,
      };
    }

    if (body.admissionNumber) student.admissionNumber = body.admissionNumber;
    if (body.studentId) student.studentId = body.studentId;
    if (body.name) student.name = body.name;
    if (body.email) student.email = body.email;
    if (body.phone) student.phone = body.phone;
    if (body.dob !== undefined) student.dob = body.dob;
    if (body.gender) student.gender = body.gender;
    if (body.bloodGroup) student.bloodGroup = body.bloodGroup;
    if (body.department) student.department = body.department;
    if (body.course) student.course = body.course;
    if (body.semester !== undefined) student.semester = Number(body.semester);
    if (body.section) student.section = body.section;
    if (body.guardian) student.guardian = body.guardian;
    if (body.address !== undefined) student.address = body.address;
    if (body.photo) student.photo = body.photo;
    if (body.status) student.status = body.status;

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      student,
    });
  } catch (err: any) {
    console.error('Error updating student:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update student' });
  }
});

// 6. DELETE STUDENT
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({
      success: true,
      message: `Student ${student.name} (${student.studentId}) deleted successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete student' });
  }
});

export default router;
