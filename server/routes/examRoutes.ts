import express, { Request, Response } from 'express';
import Exam from '../models/Exam.js';
import ExamHall from '../models/ExamHall.js';
import ExamMark from '../models/ExamMark.js';
import Student from '../models/Student.js';

const router = express.Router();

// Helper to calculate grade from percentage
const calculateGrade = (pct: number): { grade: string; isPassed: boolean } => {
  if (pct >= 90) return { grade: 'A+', isPassed: true };
  if (pct >= 80) return { grade: 'A', isPassed: true };
  if (pct >= 70) return { grade: 'B', isPassed: true };
  if (pct >= 60) return { grade: 'C', isPassed: true };
  if (pct >= 40) return { grade: 'D', isPassed: true };
  return { grade: 'F', isPassed: false };
};

// ============================================================================
// 1. EXAM SCHEDULES (CRUD)
// ============================================================================

// GET all exams (with filters and search)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, course, semester, examType, status, search } = req.query;

    const query: any = {};

    if (department && department !== 'ALL') query.department = department;
    if (course && course !== 'ALL') query.course = course;
    if (semester && semester !== 'ALL') query.semester = Number(semester);
    if (examType && examType !== 'ALL') query.examType = examType;
    if (status && status !== 'ALL') query.status = status;

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { subjectCode: searchRegex },
        { hall: searchRegex },
        { invigilator: searchRegex },
      ];
    }

    const exams = await Exam.find(query).sort({ examDate: 1, startTime: 1 });

    res.json({
      success: true,
      total: exams.length,
      exams,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching exams' });
  }
});

// GET single exam details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }
    res.json({ success: true, exam });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching exam details' });
  }
});

// POST create a new exam schedule
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      examType,
      department,
      course,
      semester,
      academicYear,
      subject,
      subjectCode,
      examDate,
      startTime,
      endTime,
      totalMarks,
      passMarks,
      weightagePercentage,
      hall,
      invigilator,
      status,
      instructions,
    } = req.body;

    if (!title || !department || !course || !subject || !subjectCode || !examDate) {
      res.status(400).json({
        success: false,
        message: 'Title, Department, Course, Subject, Subject Code, and Exam Date are required.',
      });
      return;
    }

    const newExam = new Exam({
      title,
      examType: examType || 'INTERNAL',
      department,
      course,
      semester: Number(semester) || 1,
      academicYear: academicYear || '2025-2026',
      subject,
      subjectCode: subjectCode.toUpperCase(),
      examDate,
      startTime: startTime || '09:30 AM',
      endTime: endTime || '12:30 PM',
      totalMarks: Number(totalMarks) || 100,
      passMarks: Number(passMarks) || 40,
      weightagePercentage: Number(weightagePercentage) || 100,
      hall: hall || 'Main Exam Hall A',
      invigilator: invigilator || 'Faculty Invigilator',
      status: status || 'SCHEDULED',
      instructions: instructions || '',
    });

    await newExam.save();

    res.status(201).json({
      success: true,
      message: 'Exam schedule created successfully!',
      exam: newExam,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create exam schedule' });
  }
});

// PUT update an exam schedule
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedExam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Exam schedule updated successfully!',
      exam: updatedExam,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update exam' });
  }
});

// DELETE an exam schedule
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }

    // Optionally cleanup associated marks
    await ExamMark.deleteMany({ examId: req.params.id });

    res.json({
      success: true,
      message: 'Exam schedule and associated marks deleted successfully!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete exam' });
  }
});

// ============================================================================
// 2. EXAM HALLS (CRUD)
// ============================================================================

// GET list of halls
router.get('/halls/list', async (_req: Request, res: Response): Promise<void> => {
  try {
    const halls = await ExamHall.find().sort({ name: 1 });
    res.json({ success: true, total: halls.length, halls });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching exam halls' });
  }
});

// POST create a hall
router.post('/halls/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, block, capacity, rows, columns, facilities, status } = req.body;

    if (!name || !block) {
      res.status(400).json({ success: false, message: 'Hall name and Block are required.' });
      return;
    }

    const hall = new ExamHall({
      name,
      block,
      capacity: Number(capacity) || 60,
      rows: Number(rows) || 6,
      columns: Number(columns) || 10,
      facilities: facilities || ['CCTV', 'AC'],
      status: status || 'AVAILABLE',
    });

    await hall.save();
    res.status(201).json({ success: true, message: 'Exam hall created successfully!', hall });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating exam hall' });
  }
});

// PUT update hall
router.put('/halls/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedHall = await ExamHall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHall) {
      res.status(404).json({ success: false, message: 'Exam hall not found' });
      return;
    }
    res.json({ success: true, message: 'Exam hall updated!', hall: updatedHall });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating exam hall' });
  }
});

// DELETE hall
router.delete('/halls/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ExamHall.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Exam hall not found' });
      return;
    }
    res.json({ success: true, message: 'Exam hall deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting exam hall' });
  }
});

// ============================================================================
// 3. EXAM MARKS ENTRY & EVALUATION
// ============================================================================

// GET student marks for an exam
router.get('/:examId/marks', async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }

    // Get all enrolled students for this department/course/semester
    const students = await Student.find({
      department: exam.department,
      course: exam.course,
      semester: exam.semester,
    }).sort({ rollNo: 1, admissionNumber: 1 });

    // Get existing marks
    const existingMarks = await ExamMark.find({ examId });
    const markMap: Record<string, any> = {};
    existingMarks.forEach((m) => {
      markMap[m.studentId] = m;
    });

    const studentMarksList = students.map((std) => {
      const existing = markMap[std._id.toString()];
      return {
        studentId: std._id,
        studentRollNo: std.studentId || std.admissionNumber || 'N/A',
        studentName: std.name,
        photo: std.photo,
        marksObtained: existing ? existing.marksObtained : 0,
        totalMarks: exam.totalMarks,
        percentage: existing ? existing.percentage : 0,
        grade: existing ? existing.grade : 'F',
        isPassed: existing ? existing.isPassed : false,
        remarks: existing ? existing.remarks : '',
      };
    });

    res.json({
      success: true,
      exam,
      totalStudents: students.length,
      marks: studentMarksList,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching exam marks' });
  }
});

// POST bulk save/update marks for an exam
router.post('/:examId/marks/bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const { records, evaluatedBy } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ success: false, message: 'Records array is required.' });
      return;
    }

    const bulkOps = records.map((record: any) => {
      const marksObtained = Number(record.marksObtained) || 0;
      const totalMarks = exam.totalMarks || 100;
      const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
      const { grade, isPassed } = calculateGrade(percentage);

      return {
        updateOne: {
          filter: { examId, studentId: record.studentId },
          update: {
            $set: {
              examId,
              studentId: record.studentId,
              studentRollNo: record.studentRollNo,
              studentName: record.studentName,
              subject: exam.subject,
              marksObtained,
              totalMarks,
              percentage,
              grade,
              isPassed,
              remarks: record.remarks || '',
              evaluatedBy: evaluatedBy || 'Faculty Evaluator',
            },
          },
          upsert: true,
        },
      };
    });

    await ExamMark.bulkWrite(bulkOps);

    // Update exam status to COMPLETED if it was SCHEDULED
    if (exam.status === 'SCHEDULED' || exam.status === 'ONGOING') {
      exam.status = 'COMPLETED';
      await exam.save();
    }

    res.json({
      success: true,
      message: `Successfully evaluated marks for ${records.length} students!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error saving marks' });
  }
});

// GET Student Report Card / Transcript Summary
router.get('/student/:studentId/report-card', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const markRecords = await ExamMark.find({ studentId }).sort({ createdAt: -1 });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let passedExamsCount = 0;

    const formattedRecords = markRecords.map((m) => {
      totalMarksObtained += m.marksObtained;
      totalMaxMarks += m.totalMarks;
      if (m.isPassed) passedExamsCount++;

      return {
        markId: m._id,
        examId: m.examId,
        subject: m.subject,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        isPassed: m.isPassed,
        remarks: m.remarks,
        evaluatedBy: m.evaluatedBy,
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const { grade: overallGrade } = calculateGrade(overallPercentage);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.studentId || student.admissionNumber || 'N/A',
        department: student.department,
        course: student.course,
        semester: student.semester,
        photo: student.photo,
      },
      summary: {
        totalExamsTaken: markRecords.length,
        passedExamsCount,
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
        overallGrade,
      },
      marksList: formattedRecords,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating report card' });
  }
});

export default router;
