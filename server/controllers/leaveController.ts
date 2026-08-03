import { Request, Response } from 'express';
import Leave from '../models/Leave.js';

// @desc    Get all leave requests with filters
// @route   GET /api/v1/leaves
// @access  Public / Protected
export const getLeaves = async (req: Request, res: Response) => {
  try {
    const { applicantType, department, status, applicantId, search } = req.query;

    const query: any = {};

    if (applicantType && applicantType !== 'ALL') {
      query.applicantType = applicantType;
    }
    if (department && department !== 'ALL') {
      query.department = department;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (applicantId) {
      query.applicantId = String(applicantId);
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { applicantName: searchRegex },
        { applicantRollNoOrCode: searchRegex },
        { reason: searchRegex },
        { leaveType: searchRegex },
        { department: searchRegex },
      ];
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get leave metrics and statistics
// @route   GET /api/v1/leaves/stats
// @access  Public / Protected
export const getLeaveStats = async (_req: Request, res: Response) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'PENDING' });
    const approvedLeaves = await Leave.countDocuments({ status: 'APPROVED' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'REJECTED' });

    const studentLeaves = await Leave.countDocuments({ applicantType: 'STUDENT' });
    const facultyLeaves = await Leave.countDocuments({ applicantType: 'FACULTY' });

    res.json({
      success: true,
      stats: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        studentLeaves,
        facultyLeaves,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get single leave details
// @route   GET /api/v1/leaves/:id
// @access  Public / Protected
export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    res.json({
      success: true,
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Apply for leave (Student or Faculty)
// @route   POST /api/v1/leaves
// @access  Protected
export const applyLeave = async (req: Request, res: Response) => {
  try {
    const {
      applicantType,
      applicantId,
      applicantName,
      applicantRollNoOrCode,
      department,
      leaveType,
      reason,
      startDate,
      endDate,
    } = req.body;

    if (!applicantName || !department || !reason || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required leave fields: applicant name, department, reason, start & end date.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
    }

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let attachmentUrl = '';
    let attachmentName = '';

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    } else if (req.body.attachmentUrl) {
      attachmentUrl = req.body.attachmentUrl;
      attachmentName = req.body.attachmentName || 'leave_document.pdf';
    }

    const leave = await Leave.create({
      applicantType: applicantType || 'STUDENT',
      applicantId: applicantId || 'USER-101',
      applicantName,
      applicantRollNoOrCode: applicantRollNoOrCode || 'CODE-101',
      department,
      leaveType: leaveType || 'CASUAL',
      reason,
      startDate: start,
      endDate: end,
      totalDays,
      attachmentUrl,
      attachmentName,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully! Sent to authority for approval.',
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Approve or Reject Leave Application (Approval Workflow)
// @route   PUT /api/v1/leaves/:id/workflow
// @access  Protected (HOD / Principal / Admin)
export const approveOrRejectLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approverId, approverName, approverRole, approverComments } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or REJECTED.',
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave record not found' });
    }

    leave.status = status;
    leave.approverId = approverId || 'APPROVER-001';
    leave.approverName = approverName || 'HOD / Approval Authority';
    leave.approverRole = approverRole || 'HOD';
    leave.approverComments = approverComments || '';
    leave.actionDate = new Date();

    await leave.save();

    res.json({
      success: true,
      message: `Leave application successfully ${status.toLowerCase()}!`,
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Cancel Leave Request (by applicant)
// @route   PUT /api/v1/leaves/:id/cancel
// @access  Protected
export const cancelLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    if (leave.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already approved leave application. Please contact HOD.',
      });
    }

    leave.status = 'CANCELLED';
    await leave.save();

    res.json({
      success: true,
      message: 'Leave application cancelled successfully',
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete leave application
// @route   DELETE /api/v1/leaves/:id
// @access  Protected
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    await Leave.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Leave application record deleted',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
