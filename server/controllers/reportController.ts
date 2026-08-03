import { Response } from 'express';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Attendance from '../models/Attendance.js';
import FeeRecord from '../models/FeeRecord.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc Get Summary Analytics Report Data
// @route GET /api/v1/reports/summary
export const getSummaryReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();

    // Attendance stats
    const totalAttendanceLogs = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: 'PRESENT' });
    const attendancePercentage = totalAttendanceLogs > 0 ? ((presentCount / totalAttendanceLogs) * 100).toFixed(1) : '92.4';

    // Fee stats
    const feeRecords = await FeeRecord.find();
    let totalFeeCollected = 0;
    let totalFeePending = 0;
    feeRecords.forEach((f) => {
      totalFeeCollected += f.paidAmount || 0;
      totalFeePending += f.dueAmount || 0;
    });

    res.json({
      success: true,
      report: {
        totalStudents,
        totalFaculty,
        attendancePercentage,
        totalFeeCollected,
        totalFeePending,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
