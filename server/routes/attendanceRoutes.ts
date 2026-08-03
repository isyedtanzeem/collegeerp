import express, { Request, Response } from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

const router = express.Router();

// 1. BULK MARK ATTENDANCE (Faculty View)
router.post('/mark-bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, subject, department, course, semester, section, markedBy, records } = req.body;

    if (!date || !subject || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Date, subject, and student attendance records are required.',
      });
      return;
    }

    const bulkOps = records.map((record: any) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          subject: subject,
          date: date,
        },
        update: {
          $set: {
            studentId: record.studentId,
            studentRollNo: record.studentRollNo,
            studentName: record.studentName,
            department: department || record.department || 'N/A',
            course: course || record.course || 'N/A',
            semester: Number(semester) || Number(record.semester) || 1,
            section: section || record.section || 'A',
            subject: subject,
            date: date,
            status: record.status || 'PRESENT',
            remarks: record.remarks || '',
            markedBy: markedBy || 'Faculty Member',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: `Successfully saved attendance for ${records.length} students on ${date}.`,
    });
  } catch (err: any) {
    console.error('Error marking bulk attendance:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to save attendance records' });
  }
});

// 2. GET ATTENDANCE LIST (With Filters)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, date, department, course, semester, section, subject, month } = req.query;

    const query: any = {};

    if (studentId) query.studentId = studentId;
    if (date) query.date = date;
    if (department && department !== 'ALL') query.department = department;
    if (course && course !== 'ALL') query.course = course;
    if (semester && semester !== 'ALL') query.semester = Number(semester);
    if (section && section !== 'ALL') query.section = section;
    if (subject && subject !== 'ALL') query.subject = subject;

    if (month && typeof month === 'string') {
      // Month format YYYY-MM
      query.date = new RegExp(`^${month}`);
    }

    const records = await Attendance.find(query).sort({ date: -1, studentRollNo: 1 });

    res.json({
      success: true,
      total: records.length,
      attendance: records,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching attendance records' });
  }
});

// 3. STUDENT INDIVIDUAL ATTENDANCE STATS (Student View)
router.get('/student-stats/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const records = await Attendance.find({ studentId }).sort({ date: -1 });

    let present = 0;
    let absent = 0;
    let late = 0;
    let holiday = 0;

    const subjectStatsMap: Record<
      string,
      { total: number; present: number; absent: number; late: number; holiday: number; percentage: number }
    > = {};

    records.forEach((rec) => {
      if (rec.status === 'PRESENT') present++;
      else if (rec.status === 'ABSENT') absent++;
      else if (rec.status === 'LATE') late++;
      else if (rec.status === 'HOLIDAY') holiday++;

      if (!subjectStatsMap[rec.subject]) {
        subjectStatsMap[rec.subject] = { total: 0, present: 0, absent: 0, late: 0, holiday: 0, percentage: 0 };
      }

      const subObj = subjectStatsMap[rec.subject];
      subObj.total += 1;
      if (rec.status === 'PRESENT') subObj.present += 1;
      else if (rec.status === 'ABSENT') subObj.absent += 1;
      else if (rec.status === 'LATE') subObj.late += 1; // Late counts as attendance or partial depending on policy
      else if (rec.status === 'HOLIDAY') subObj.holiday += 1;
    });

    // Calculate subject percentages (effective working days = total - holiday)
    const subjectBreakdown = Object.keys(subjectStatsMap).map((subName) => {
      const item = subjectStatsMap[subName];
      const workingDays = item.total - item.holiday;
      const attended = item.present + item.late; // Present + Late
      const percentage = workingDays > 0 ? Math.round((attended / workingDays) * 100) : 100;
      return {
        subject: subName,
        totalClasses: item.total,
        present: item.present,
        absent: item.absent,
        late: item.late,
        holiday: item.holiday,
        workingDays,
        attended,
        percentage,
      };
    });

    const totalWorkingDays = records.length - holiday;
    const totalAttended = present + late;
    const overallPercentage = totalWorkingDays > 0 ? Math.round((totalAttended / totalWorkingDays) * 100) : 100;

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.studentId || student.admissionNumber || 'N/A',
        department: student.department,
        course: student.course,
        semester: student.semester,
        section: student.section,
      },
      summary: {
        totalRecords: records.length,
        workingDays: totalWorkingDays,
        present,
        absent,
        late,
        holiday,
        overallPercentage,
      },
      subjectBreakdown,
      recentHistory: records.slice(0, 30),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student stats' });
  }
});

// 4. MONTHLY REPORT GENERATOR (Admin / Faculty View)
router.get('/monthly-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, course, semester, section, subject, month } = req.query;

    if (!department || !course || !month) {
      res.status(400).json({
        success: false,
        message: 'Department, Course, and Month (YYYY-MM) are required parameters.',
      });
      return;
    }

    // 1. Fetch all students in this class
    const studentQuery: any = { department, course };
    if (semester && semester !== 'ALL') studentQuery.semester = Number(semester);
    if (section && section !== 'ALL') studentQuery.section = section;

    const students = await Student.find(studentQuery).sort({ rollNo: 1 });

    // 2. Fetch attendance for this month
    const attQuery: any = {
      department,
      course,
      date: new RegExp(`^${month}`),
    };
    if (semester && semester !== 'ALL') attQuery.semester = Number(semester);
    if (section && section !== 'ALL') attQuery.section = section;
    if (subject && subject !== 'ALL') attQuery.subject = subject;

    const attendanceRecords = await Attendance.find(attQuery);

    // Group attendance by date and studentId
    const dateStudentMap: Record<string, Record<string, string>> = {}; // date -> { studentId: status }
    const datesSet = new Set<string>();

    attendanceRecords.forEach((rec) => {
      datesSet.add(rec.date);
      if (!dateStudentMap[rec.date]) {
        dateStudentMap[rec.date] = {};
      }
      dateStudentMap[rec.date][rec.studentId] = rec.status;
    });

    const sortedDates = Array.from(datesSet).sort();

    // Calculate report per student
    const report = students.map((std) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let holidayCount = 0;

      const dailyStatus: Record<string, string> = {};

      sortedDates.forEach((d) => {
        const st = dateStudentMap[d]?.[std._id.toString()] || 'N/A';
        dailyStatus[d] = st;

        if (st === 'PRESENT') presentCount++;
        else if (st === 'ABSENT') absentCount++;
        else if (st === 'LATE') lateCount++;
        else if (st === 'HOLIDAY') holidayCount++;
      });

      const totalConducted = sortedDates.length;
      const workingDays = totalConducted - holidayCount;
      const attended = presentCount + lateCount;
      const percentage = workingDays > 0 ? Math.round((attended / workingDays) * 100) : 100;

      return {
        studentId: std._id,
        rollNo: std.studentId || std.admissionNumber || 'N/A',
        name: std.name,
        dailyStatus,
        totalConducted,
        presentCount,
        absentCount,
        lateCount,
        holidayCount,
        workingDays,
        attended,
        percentage,
      };
    });

    res.json({
      success: true,
      month,
      dates: sortedDates,
      totalStudents: students.length,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating monthly report' });
  }
});

// 5. ADMIN / HIGH LEVEL DASHBOARD SUMMARY
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [todayRecords, totalStudents] = await Promise.all([
      Attendance.find({ date: todayStr }),
      Student.countDocuments({ status: 'ACTIVE' }),
    ]);

    let todayPresent = 0;
    let todayAbsent = 0;
    let todayLate = 0;
    let todayHoliday = 0;

    todayRecords.forEach((rec) => {
      if (rec.status === 'PRESENT') todayPresent++;
      else if (rec.status === 'ABSENT') todayAbsent++;
      else if (rec.status === 'LATE') todayLate++;
      else if (rec.status === 'HOLIDAY') todayHoliday++;
    });

    // Find students with attendance percentage < 75%
    const studentAgg = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          studentRollNo: { $first: '$studentRollNo' },
          studentName: { $first: '$studentName' },
          department: { $first: '$department' },
          course: { $first: '$course' },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          studentRollNo: 1,
          studentName: 1,
          department: 1,
          course: 1,
          total: 1,
          present: 1,
          absent: 1,
          percentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
      {
        $match: {
          percentage: { $lt: 75 },
          total: { $gte: 3 }, // At least 3 recorded sessions
        },
      },
      { $limit: 15 },
    ]);

    res.json({
      success: true,
      today: {
        date: todayStr,
        totalMarkedToday: todayRecords.length,
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate,
        holiday: todayHoliday,
      },
      atRiskStudents: studentAgg,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching summary stats' });
  }
});

export default router;
