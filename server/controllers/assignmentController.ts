import { Request, Response } from 'express';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Public / Protected
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { department, subject, semester, status, search } = req.query;

    const query: any = {};

    if (department && department !== 'ALL') {
      query.department = department;
    }
    if (subject && subject !== 'ALL') {
      query.subject = subject;
    }
    if (semester && semester !== 'ALL') {
      query.semester = Number(semester);
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { facultyName: searchRegex },
        { description: searchRegex },
      ];
    }

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });

    // Fetch submission counts for each assignment
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });

    const submissionCountMap: Record<string, number> = {};
    const gradedCountMap: Record<string, number> = {};

    submissions.forEach((sub) => {
      const idStr = sub.assignmentId.toString();
      submissionCountMap[idStr] = (submissionCountMap[idStr] || 0) + 1;
      if (sub.status === 'GRADED') {
        gradedCountMap[idStr] = (gradedCountMap[idStr] || 0) + 1;
      }
    });

    const enrichedAssignments = assignments.map((a) => {
      const doc = a.toObject();
      const idStr = a._id.toString();
      return {
        ...doc,
        totalSubmissions: submissionCountMap[idStr] || 0,
        gradedSubmissions: gradedCountMap[idStr] || 0,
      };
    });

    res.json({
      success: true,
      count: enrichedAssignments.length,
      assignments: enrichedAssignments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get assignment stats
// @route   GET /api/v1/assignments/stats
// @access  Public / Protected
export const getAssignmentStats = async (_req: Request, res: Response) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    const activeAssignments = await Assignment.countDocuments({ status: 'PUBLISHED', dueDate: { $gte: new Date() } });
    const totalSubmissions = await Submission.countDocuments();
    const pendingGrading = await Submission.countDocuments({ status: { $in: ['SUBMITTED', 'LATE'] } });
    const totalGraded = await Submission.countDocuments({ status: 'GRADED' });

    res.json({
      success: true,
      stats: {
        totalAssignments,
        activeAssignments,
        totalSubmissions,
        pendingGrading,
        totalGraded,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/v1/assignments/:id
// @access  Public / Protected
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissions = await Submission.find({ assignmentId: id }).sort({ submissionDate: -1 });

    res.json({
      success: true,
      assignment: {
        ...assignment.toObject(),
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter((s) => s.status === 'GRADED').length,
      },
      submissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Create new assignment (Faculty upload)
// @route   POST /api/v1/assignments
// @access  Protected (Faculty/HOD/Admin)
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      department,
      course,
      subject,
      semester,
      section,
      facultyId,
      facultyName,
      totalMarks,
      dueDate,
      status,
    } = req.body;

    let attachmentUrl = '';
    let attachmentName = '';

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    } else if (req.body.attachmentUrl) {
      attachmentUrl = req.body.attachmentUrl;
      attachmentName = req.body.attachmentName || 'attachment.pdf';
    }

    const assignment = await Assignment.create({
      title,
      description,
      department,
      course: course || 'B.Tech',
      subject,
      semester: semester ? Number(semester) : 1,
      section: section || 'A',
      facultyId,
      facultyName: facultyName || 'Faculty Member',
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      attachmentUrl,
      attachmentName,
      status: status || 'PUBLISHED',
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update assignment details
// @route   PUT /api/v1/assignments/:id
// @access  Protected
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const updateData: any = { ...req.body };

    if (req.file) {
      updateData.attachmentUrl = `/uploads/${req.file.filename}`;
      updateData.attachmentName = req.file.originalname;
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.totalMarks) {
      updateData.totalMarks = Number(updateData.totalMarks);
    }
    if (updateData.semester) {
      updateData.semester = Number(updateData.semester);
    }

    assignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Protected
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await Assignment.findByIdAndDelete(id);
    await Submission.deleteMany({ assignmentId: id });

    res.json({
      success: true,
      message: 'Assignment and all associated submissions deleted',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Student Submit Assignment Work
// @route   POST /api/v1/assignments/:id/submit
// @access  Protected (Student)
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, studentRollNo, department, comments } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || 'submission.pdf';
    }

    if (!fileUrl && !comments) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a submission file or submission notes/comments.',
      });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const status = isLate ? 'LATE' : 'SUBMITTED';

    // Check if submission already exists for this student & assignment
    let submission = await Submission.findOne({ assignmentId: id, studentId });

    if (submission) {
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.fileName = fileName || submission.fileName;
      submission.comments = comments || submission.comments;
      submission.submissionDate = now;
      submission.status = status;
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentId: id,
        studentId: studentId || 'STU-001',
        studentName: studentName || 'Student User',
        studentRollNo: studentRollNo || 'ROLL-101',
        department: department || assignment.department,
        submissionDate: now,
        fileUrl,
        fileName,
        comments,
        status,
      });
    }

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (Marked as Late)' : 'Assignment submitted successfully!',
      submission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Faculty Grade Submission & Give Feedback
// @route   PUT /api/v1/assignments/submissions/:submissionId/grade
// @access  Protected (Faculty/Admin)
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks, feedback, status, gradedBy } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission record not found' });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    const maxMarks = assignment ? assignment.totalMarks : 100;

    if (obtainedMarks !== undefined && Number(obtainedMarks) > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Obtained marks cannot exceed total assignment marks (${maxMarks}).`,
      });
    }

    if (obtainedMarks !== undefined) {
      submission.obtainedMarks = Number(obtainedMarks);
    }
    if (feedback !== undefined) {
      submission.feedback = feedback;
    }
    submission.status = status || 'GRADED';
    submission.gradedBy = gradedBy || 'Faculty Examiner';
    submission.gradedAt = new Date();

    await submission.save();

    res.json({
      success: true,
      message: 'Submission graded successfully with feedback',
      submission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get Submissions for an Assignment
// @route   GET /api/v1/assignments/:id/submissions
// @access  Protected
export const getSubmissionsForAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ assignmentId: id }).sort({ submissionDate: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get Student's Own Submissions across all assignments
// @route   GET /api/v1/assignments/student/my-submissions
// @access  Protected
export const getStudentSubmissions = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    const query: any = {};
    if (studentId) {
      query.studentId = String(studentId);
    }

    const submissions = await Submission.find(query).sort({ submissionDate: -1 }).populate('assignmentId');

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
