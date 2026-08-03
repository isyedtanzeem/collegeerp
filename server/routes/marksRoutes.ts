import express, { Request, Response } from 'express';
import ExamMark from '../models/ExamMark.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';

const router = express.Router();

// Grade Point and Letter Grade Calculator
export const calculateGradeAndGPA = (percentage: number) => {
  if (percentage >= 90) return { grade: 'A+', gradePoint: 10.0, isPassed: true, performance: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', gradePoint: 9.0, isPassed: true, performance: 'Excellent' };
  if (percentage >= 70) return { grade: 'B+', gradePoint: 8.0, isPassed: true, performance: 'Very Good' };
  if (percentage >= 60) return { grade: 'B', gradePoint: 7.0, isPassed: true, performance: 'Good' };
  if (percentage >= 50) return { grade: 'C', gradePoint: 6.0, isPassed: true, performance: 'Average' };
  if (percentage >= 40) return { grade: 'D', gradePoint: 5.0, isPassed: true, performance: 'Satisfactory' };
  return { grade: 'F', gradePoint: 0.0, isPassed: false, performance: 'Fail' };
};

// ============================================================================
// 1. GET ALL MARKS (Filter & Search)
// ============================================================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, subject, examId, grade, isPassed, search } = req.query;

    const query: any = {};
    if (studentId && studentId !== 'ALL') query.studentId = studentId;
    if (examId && examId !== 'ALL') query.examId = examId;
    if (subject && subject !== 'ALL') query.subject = subject;
    if (grade && grade !== 'ALL') query.grade = grade;
    if (isPassed !== undefined && isPassed !== 'ALL') query.isPassed = isPassed === 'true';

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { studentName: searchRegex },
        { studentRollNo: searchRegex },
        { subject: searchRegex },
        { grade: searchRegex },
      ];
    }

    const marksList = await ExamMark.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: marksList.length,
      marks: marksList,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching marks' });
  }
});

// ============================================================================
// 2. CREATE SINGLE MARK RECORD
// ============================================================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      examId,
      subject,
      marksObtained,
      totalMarks,
      remarks,
      evaluatedBy,
    } = req.body;

    if (!studentId || !examId || !subject || marksObtained === undefined) {
      res.status(400).json({
        success: false,
        message: 'Student, Exam, Subject, and Marks Obtained are required.',
      });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    const maxMarks = Number(totalMarks) || exam.totalMarks || 100;
    const obtained = Math.max(0, Math.min(maxMarks, Number(marksObtained)));
    const percentage = Math.round((obtained / maxMarks) * 100);
    const { grade, isPassed } = calculateGradeAndGPA(percentage);

    // Upsert mark record
    const markRecord = await ExamMark.findOneAndUpdate(
      { examId, studentId },
      {
        examId,
        studentId,
        studentRollNo: student.studentId || student.admissionNumber || 'N/A',
        studentName: student.name,
        subject,
        marksObtained: obtained,
        totalMarks: maxMarks,
        percentage,
        grade,
        isPassed,
        remarks: remarks || '',
        evaluatedBy: evaluatedBy || 'Faculty Evaluator',
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Mark record saved successfully!',
      mark: markRecord,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating mark record' });
  }
});

// ============================================================================
// 3. UPDATE MARK RECORD
// ============================================================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { marksObtained, totalMarks, remarks, evaluatedBy } = req.body;

    const existing = await ExamMark.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mark record not found.' });
      return;
    }

    const maxMarks = totalMarks !== undefined ? Number(totalMarks) : existing.totalMarks;
    const obtained = marksObtained !== undefined ? Number(marksObtained) : existing.marksObtained;
    const percentage = Math.round((obtained / maxMarks) * 100);
    const { grade, isPassed } = calculateGradeAndGPA(percentage);

    existing.marksObtained = obtained;
    existing.totalMarks = maxMarks;
    existing.percentage = percentage;
    existing.grade = grade;
    existing.isPassed = isPassed;
    if (remarks !== undefined) existing.remarks = remarks;
    if (evaluatedBy !== undefined) existing.evaluatedBy = evaluatedBy;

    await existing.save();

    res.json({
      success: true,
      message: 'Mark record updated successfully!',
      mark: existing,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating mark record' });
  }
});

// ============================================================================
// 4. DELETE MARK RECORD
// ============================================================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ExamMark.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Mark record not found.' });
      return;
    }

    res.json({ success: true, message: 'Mark record deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting mark record' });
  }
});

// ============================================================================
// 5. BULK RESULT GENERATION & CGPA COMPUTATION
// ============================================================================
router.post('/generate-results', async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId, department, course, semester } = req.body;

    const examQuery: any = {};
    if (examId) examQuery._id = examId;
    if (department) examQuery.department = department;
    if (course) examQuery.course = course;
    if (semester) examQuery.semester = Number(semester);

    const targetExams = await Exam.find(examQuery);
    if (targetExams.length === 0) {
      res.status(404).json({ success: false, message: 'No matching exams found to generate results.' });
      return;
    }

    const examIds = targetExams.map((e) => e._id.toString());
    const markRecords = await ExamMark.find({ examId: { $in: examIds } });

    // Group marks by studentId
    const studentMap: Record<string, typeof markRecords> = {};
    markRecords.forEach((m) => {
      if (!studentMap[m.studentId]) studentMap[m.studentId] = [];
      studentMap[m.studentId].push(m);
    });

    let processedCount = 0;
    const studentResults: any[] = [];

    for (const [studentId, studentMarks] of Object.entries(studentMap)) {
      let totalObtained = 0;
      let totalMax = 0;
      let totalGradePoints = 0;
      let passedCount = 0;

      studentMarks.forEach((m) => {
        totalObtained += m.marksObtained;
        totalMax += m.totalMarks;
        const { gradePoint } = calculateGradeAndGPA(m.percentage);
        totalGradePoints += gradePoint;
        if (m.isPassed) passedCount++;
      });

      const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const cgpa = studentMarks.length > 0 ? Number((totalGradePoints / studentMarks.length).toFixed(2)) : 0;
      const { grade: overallGrade } = calculateGradeAndGPA(overallPercentage);
      const isOverallPassed = passedCount === studentMarks.length;

      processedCount++;
      studentResults.push({
        studentId,
        studentName: studentMarks[0]?.studentName || 'Student',
        studentRollNo: studentMarks[0]?.studentRollNo || 'N/A',
        totalSubjects: studentMarks.length,
        passedSubjects: passedCount,
        failedSubjects: studentMarks.length - passedCount,
        totalObtained,
        totalMax,
        overallPercentage,
        cgpa,
        overallGrade,
        status: isOverallPassed ? 'PASSED' : 'FAILED / ATKT',
      });
    }

    // Mark exams as RESULTS_PUBLISHED
    await Exam.updateMany({ _id: { $in: examIds } }, { $set: { status: 'RESULTS_PUBLISHED' } });

    res.json({
      success: true,
      message: `Results successfully generated and published for ${processedCount} students across ${targetExams.length} exams!`,
      resultsSummary: studentResults,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating results' });
  }
});

// ============================================================================
// 6. STUDENT RESULT PAGE / OVERALL GRADEBOOK LOOKUP
// ============================================================================
router.get('/student-result/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const marks = await ExamMark.find({ studentId }).sort({ createdAt: -1 });

    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;
    let passedCount = 0;

    const subjectsBreakdown = marks.map((m) => {
      totalObtained += m.marksObtained;
      totalMax += m.totalMarks;
      const { gradePoint, performance } = calculateGradeAndGPA(m.percentage);
      totalGradePoints += gradePoint;
      if (m.isPassed) passedCount++;

      return {
        markId: m._id,
        examId: m.examId,
        subject: m.subject,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        gradePoint,
        performance,
        isPassed: m.isPassed,
        remarks: m.remarks,
        evaluatedBy: m.evaluatedBy,
      };
    });

    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const cgpa = marks.length > 0 ? Number((totalGradePoints / marks.length).toFixed(2)) : 0;
    const { grade: overallGrade, performance: overallPerformance } = calculateGradeAndGPA(overallPercentage);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.studentId || student.admissionNumber || 'N/A',
        department: student.department,
        course: student.course,
        semester: student.semester,
        academicYear: '2025-2026',
        photo: student.photo,
        email: student.email,
      },
      resultSummary: {
        totalExams: marks.length,
        passedCount,
        failedCount: marks.length - passedCount,
        totalObtained,
        totalMax,
        overallPercentage,
        cgpa,
        overallGrade,
        overallPerformance,
        resultStatus: passedCount === marks.length && marks.length > 0 ? 'PASSED' : marks.length === 0 ? 'NO MARKS RECORDED' : 'FAIL / RE-EXAM',
      },
      marks: subjectsBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating student result' });
  }
});

// ============================================================================
// 7. ACADEMIC TRANSCRIPT GENERATION
// ============================================================================
router.get('/transcript/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const allMarks = await ExamMark.find({ studentId }).sort({ createdAt: 1 });

    // Build Transcript payload with official university seal and verification token
    let cumulativeObtained = 0;
    let cumulativeMax = 0;
    let totalGradePoints = 0;

    const transcriptSubjects = allMarks.map((m) => {
      cumulativeObtained += m.marksObtained;
      cumulativeMax += m.totalMarks;
      const { gradePoint } = calculateGradeAndGPA(m.percentage);
      totalGradePoints += gradePoint;

      return {
        subject: m.subject,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        gradePoint,
        credits: 4, // Default course credit
        status: m.isPassed ? 'PASS' : 'FAIL',
      };
    });

    const cumulativePercentage = cumulativeMax > 0 ? Math.round((cumulativeObtained / cumulativeMax) * 100) : 0;
    const cgpa = allMarks.length > 0 ? Number((totalGradePoints / allMarks.length).toFixed(2)) : 0;
    const { grade: finalGrade } = calculateGradeAndGPA(cumulativePercentage);

    res.json({
      success: true,
      transcriptHeader: {
        institution: 'Apex Institute of Technology & Management',
        affiliation: 'Affiliated to State Technological University',
        accreditation: 'NAAC A+ Grade Accredited',
        issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        transcriptNo: `TR-${Math.floor(100000 + Math.random() * 900000)}`,
        verificationHash: `VERIFY-${Buffer.from(`${student._id}-${Date.now()}`).toString('hex').slice(0, 12).toUpperCase()}`,
      },
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.studentId || student.admissionNumber || 'N/A',
        department: student.department,
        course: student.course,
        semester: student.semester,
        admissionYear: '2024',
        photo: student.photo,
      },
      transcriptSummary: {
        totalSubjects: allMarks.length,
        totalEarnedCredits: allMarks.filter((m) => m.isPassed).length * 4,
        cumulativeObtained,
        cumulativeMax,
        cumulativePercentage,
        cgpa,
        finalGrade,
        division: cumulativePercentage >= 75 ? 'First Class with Distinction' : cumulativePercentage >= 60 ? 'First Class' : cumulativePercentage >= 50 ? 'Second Class' : 'Pass Division',
      },
      subjects: transcriptSubjects,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating transcript' });
  }
});

export default router;
