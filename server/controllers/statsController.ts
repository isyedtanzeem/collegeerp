import { Response } from 'express';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Book from '../models/Book.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalFaculties = await User.countDocuments({ role: 'FACULTY' });
    const totalDepartments = await Department.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalNotices = await Notice.countDocuments();

    // Fees aggregation
    const paidFees = await Fee.aggregate([{ $match: { status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const pendingFees = await Fee.aggregate([{ $match: { status: { $in: ['PENDING', 'OVERDUE'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    const totalCollectedAmount = paidFees[0]?.total || 1450000;
    const totalPendingAmount = pendingFees[0]?.total || 320000;

    const statsByRole: Record<string, any> = {
      SUPER_ADMIN: {
        cards: [
          { label: 'Total Enrolled Students', value: totalStudents || 1250, change: '+12% this term', color: 'primary' },
          { label: 'Total Faculty Staff', value: totalFaculties || 85, change: '+4 new joined', color: 'info' },
          { label: 'Academic Departments', value: totalDepartments || 8, change: '100% operational', color: 'success' },
          { label: 'Active System Users', value: (totalStudents || 1250) + (totalFaculties || 85) + 15, change: '99.8% active', color: 'warning' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'Computer Science', students: 380, faculty: 22 },
            { name: 'Electronics', students: 260, faculty: 16 },
            { name: 'Mechanical', students: 220, faculty: 14 },
            { name: 'Civil Eng', students: 160, faculty: 12 },
            { name: 'Management', students: 150, faculty: 10 },
            { name: 'Computer App', students: 120, faculty: 8 },
          ],
          userGrowthTrend: [
            { month: 'Jan', students: 1100, faculty: 78 },
            { month: 'Feb', students: 1140, faculty: 80 },
            { month: 'Mar', students: 1190, faculty: 82 },
            { month: 'Apr', students: 1220, faculty: 84 },
            { month: 'May', students: 1250, faculty: 85 },
          ],
          roleDistribution: [
            { name: 'Students', value: totalStudents || 1250, color: '#0284c7' },
            { name: 'Faculty', value: totalFaculties || 85, color: '#10b981' },
            { name: 'Department Heads', value: 8, color: '#f59e0b' },
            { name: 'Administrative Staff', value: 15, color: '#8b5cf6' },
          ],
        },
        statistics: [
          { label: 'System Uptime', value: '99.98%' },
          { label: 'Database Records', value: '45,210' },
          { label: 'Server CPU Load', value: '18%' },
          { label: 'Active Concurrent Sessions', value: '142' },
        ],
        recentActivities: [
          { title: 'New Faculty Account Registered', time: '10 mins ago', user: 'Dr. Robert Vance', category: 'USER_MGMT' },
          { title: 'System Security Audit Completed', time: '2 hours ago', user: 'System Sentinel', category: 'SECURITY' },
          { title: 'Database Automated Backup Successful', time: '5 hours ago', user: 'Cron Service', category: 'SYSTEM' },
          { title: 'Global ERP Permission Matrix Updated', time: '1 day ago', user: 'Super Admin', category: 'PERMISSIONS' },
        ],
        quickActions: [
          { label: 'Manage All Users', route: '/users', icon: 'People' },
          { label: 'View Departments', route: '/departments', icon: 'Business' },
          { label: 'Course Catalog', route: '/courses', icon: 'Book' },
          { label: 'Publish Global Notice', route: '/notices', icon: 'Campaign' },
        ],
      },

      PRINCIPAL: {
        cards: [
          { label: 'Academic Departments', value: totalDepartments || 8, change: 'All Accredited', color: 'primary' },
          { label: 'Total Enrolled Students', value: totalStudents || 1250, change: '100% capacity', color: 'success' },
          { label: 'Overall Pass Percentage', value: '89.6%', change: '+2.4% vs last year', color: 'info' },
          { label: 'Average Student Attendance', value: '92.4%', change: 'Above target', color: 'warning' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'CSE', passRate: 94, attendance: 95 },
            { name: 'ECE', passRate: 91, attendance: 92 },
            { name: 'EEE', passRate: 88, attendance: 90 },
            { name: 'MECH', passRate: 86, attendance: 89 },
            { name: 'MBA', passRate: 95, attendance: 96 },
            { name: 'MCA', passRate: 92, attendance: 93 },
          ],
          userGrowthTrend: [
            { month: 'Jan', passRate: 86, attendance: 89 },
            { month: 'Feb', passRate: 87, attendance: 90 },
            { month: 'Mar', passRate: 88, attendance: 91 },
            { month: 'Apr', passRate: 89, attendance: 92 },
            { month: 'May', passRate: 89.6, attendance: 92.4 },
          ],
        },
        statistics: [
          { label: 'Research Papers Published', value: '34' },
          { label: 'Campus Placement Rate', value: '88.5%' },
          { label: 'NIRF Ranking Band', value: '101 - 150' },
          { label: 'Active R&D Grants', value: '$420,000' },
        ],
        recentActivities: [
          { title: 'CSE Department Monthly Audit Submitted', time: '1 hour ago', user: 'HOD Computer Science', category: 'ACADEMICS' },
          { title: 'NAAC Accreditation Review Prepared', time: '3 hours ago', user: 'Internal Quality Cell', category: 'QUALITY' },
          { title: 'Annual Governing Body Meeting Scheduled', time: 'Yesterday', user: 'Principal Office', category: 'ADMIN' },
          { title: 'New MoU Signed with Tech Corporation', time: '2 days ago', user: 'Placement Office', category: 'INDUSTRY' },
        ],
        quickActions: [
          { label: 'Department Directory', route: '/departments', icon: 'Business' },
          { label: 'Course Structure', route: '/courses', icon: 'Book' },
          { label: 'Issue Campus Circular', route: '/notices', icon: 'Campaign' },
          { label: 'User Registry', route: '/users', icon: 'People' },
        ],
      },

      HOD: {
        cards: [
          { label: 'Department Students', value: 380, change: '100% registered', color: 'primary' },
          { label: 'Faculty Staff Members', value: 22, change: 'Full faculty strength', color: 'info' },
          { label: 'Assigned Courses', value: totalCourses || 18, change: 'Spring Term', color: 'success' },
          { label: 'Dept Attendance Rate', value: '94.2%', change: '+1.8% this week', color: 'warning' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'Data Structures', passRate: 92, students: 120 },
            { name: 'Operating Systems', passRate: 88, students: 115 },
            { name: 'Database Systems', passRate: 95, students: 125 },
            { name: 'Web Engineering', passRate: 96, students: 130 },
            { name: 'AI & Machine Learning', passRate: 90, students: 110 },
          ],
          userGrowthTrend: [
            { month: 'Mon', attendance: 96 },
            { month: 'Tue', attendance: 94 },
            { month: 'Wed', attendance: 95 },
            { month: 'Thu', attendance: 93 },
            { month: 'Fri', attendance: 92 },
          ],
        },
        statistics: [
          { label: 'Lab Equipment Utilization', value: '88%' },
          { label: 'Syllabus Completion', value: '82%' },
          { label: 'Mid-Term Evaluation Completed', value: '94%' },
          { label: 'Faculty Seminars Conducted', value: '6' },
        ],
        recentActivities: [
          { title: 'Faculty Lecture Swap Request Approved', time: '20 mins ago', user: 'Prof. Alan Turing', category: 'SCHEDULE' },
          { title: 'Student Leave Petition Verified', time: '2 hours ago', user: 'Rahul Sharma (CS2026)', category: 'LEAVE' },
          { title: 'Internal Assessment Marks Uploaded', time: 'Yesterday', user: 'Dr. Sarah Connor', category: 'EXAMS' },
          { title: 'Lab Maintenance Ticket Resolved', time: '2 days ago', user: 'Lab Technician', category: 'INFRA' },
        ],
        quickActions: [
          { label: 'Department Courses', route: '/courses', icon: 'Book' },
          { label: 'Department Faculty & Students', route: '/users', icon: 'People' },
          { label: 'Department Notices', route: '/notices', icon: 'Campaign' },
          { label: 'Department Overview', route: '/departments', icon: 'Business' },
        ],
      },

      FACULTY: {
        cards: [
          { label: 'Classes Conducted Today', value: 3, change: 'Schedule Completed', color: 'primary' },
          { label: 'Total Enrolled Students', value: 140, change: '3 Course Batches', color: 'info' },
          { label: 'Assignments Received', value: 28, change: '85% submission', color: 'success' },
          { label: 'Pending Evaluations', value: 6, change: 'Due in 2 days', color: 'warning' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'A Grade (90%+)', students: 35 },
            { name: 'B Grade (75-89%)', students: 58 },
            { name: 'C Grade (60-74%)', students: 28 },
            { name: 'D/F Grade (<60%)', students: 9 },
          ],
          userGrowthTrend: [
            { month: 'Week 1', attendance: 92 },
            { month: 'Week 2', attendance: 94 },
            { month: 'Week 3', attendance: 91 },
            { month: 'Week 4', attendance: 95 },
            { month: 'Week 5', attendance: 93 },
          ],
        },
        statistics: [
          { label: 'Teaching Hours This Week', value: '18 Hours' },
          { label: 'Quiz Class Average', value: '84%' },
          { label: 'Attendance Recorded', value: '100%' },
          { label: 'Student Rating', value: '4.8 / 5.0' },
        ],
        recentActivities: [
          { title: 'Graded Assignment #3: Data Structures', time: '30 mins ago', user: 'You', category: 'GRADING' },
          { title: 'Recorded Attendance for CS301 Batch A', time: '3 hours ago', user: 'You', category: 'ATTENDANCE' },
          { title: 'Uploaded Lecture Slides & Code Repo', time: 'Yesterday', user: 'You', category: 'RESOURCE' },
          { title: 'Published Mid-Semester Quiz Results', time: '3 days ago', user: 'You', category: 'EXAMS' },
        ],
        quickActions: [
          { label: 'View My Courses', route: '/courses', icon: 'Book' },
          { label: 'Class Notices', route: '/notices', icon: 'Campaign' },
          { label: 'Department Info', route: '/departments', icon: 'Business' },
          { label: 'Profile Settings', route: '/profile', icon: 'People' },
        ],
      },

      STUDENT: {
        cards: [
          { label: 'Enrolled Courses', value: 6, change: 'Spring Semester 2026', color: 'primary' },
          { label: 'Overall Attendance', value: '88.5%', change: 'Target: >80%', color: 'success' },
          { label: 'Current CGPA / Grade', value: '3.82 / 4.0', change: 'Top 5% in class', color: 'info' },
          { label: 'Pending Fee Balance', value: '$0.00', change: 'All Dues Clear', color: 'secondary' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'Data Structures', attendance: 94, marks: 92 },
            { name: 'Database Systems', attendance: 92, marks: 88 },
            { name: 'Operating Systems', attendance: 85, marks: 84 },
            { name: 'Web Development', attendance: 96, marks: 95 },
            { name: 'Discrete Math', attendance: 80, marks: 78 },
          ],
          userGrowthTrend: [
            { month: 'Sem 1', cgpa: 3.65 },
            { month: 'Sem 2', cgpa: 3.72 },
            { month: 'Sem 3', cgpa: 3.78 },
            { month: 'Sem 4', cgpa: 3.82 },
          ],
        },
        statistics: [
          { label: 'Credits Earned', value: '68 / 120' },
          { label: 'Assignments Pending', value: '2' },
          { label: 'Library Books Issued', value: '2' },
          { label: 'Class Rank', value: '#4 out of 120' },
        ],
        recentActivities: [
          { title: 'Submitted Assignment #3 in Web Tech', time: '1 hour ago', user: 'You', category: 'SUBMISSION' },
          { title: 'Semester Fee Payment Confirmed ($1,250)', time: '2 days ago', user: 'Accounts Office', category: 'FINANCE' },
          { title: 'Issued "Clean Code" Book from Library', time: '4 days ago', user: 'Central Library', category: 'LIBRARY' },
          { title: 'Mid-term Result Published: 94% in DS', time: '1 week ago', user: 'Exam Cell', category: 'RESULT' },
        ],
        quickActions: [
          { label: 'My Enrolled Courses', route: '/courses', icon: 'Book' },
          { label: 'Student Notices', route: '/notices', icon: 'Campaign' },
          { label: 'Department Details', route: '/departments', icon: 'Business' },
          { label: 'My Profile & ID', route: '/profile', icon: 'People' },
        ],
      },

      ACCOUNTANT: {
        cards: [
          { label: 'Total Fees Collected', value: `$${totalCollectedAmount.toLocaleString()}`, change: '+14% YTD', color: 'success' },
          { label: 'Pending Dues Balance', value: `$${totalPendingAmount.toLocaleString()}`, change: '45 Accounts Overdue', color: 'error' },
          { label: 'Daily Receipts Collected', value: 42, change: 'Today', color: 'primary' },
          { label: 'Invoices Generated', value: 380, change: 'Spring Term', color: 'warning' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'Tuition Fee', amount: 950000 },
            { name: 'Hostel & Mess', amount: 320000 },
            { name: 'Transport', amount: 120000 },
            { name: 'Exam & Lab Fees', amount: 60000 },
          ],
          userGrowthTrend: [
            { month: 'Jan', collected: 180000 },
            { month: 'Feb', collected: 220000 },
            { month: 'Mar', collected: 310000 },
            { month: 'Apr', collected: 280000 },
            { month: 'May', collected: 460000 },
          ],
        },
        statistics: [
          { label: 'On-Time Payment Compliance', value: '82.4%' },
          { label: 'Scholarship Grants Approved', value: '$120,000' },
          { label: 'Accounts Under Notice', value: '18' },
          { label: 'Collection Efficiency Rate', value: '91.2%' },
        ],
        recentActivities: [
          { title: 'Issued Tuition Fee Receipt #8492 ($1,250)', time: '15 mins ago', user: 'Counter #1', category: 'RECEIPT' },
          { title: 'Generated Automated Late Fee Reminders', time: '2 hours ago', user: 'Billing Service', category: 'INVOICE' },
          { title: 'Monthly Staff Salary Payroll Processed', time: 'Yesterday', user: 'Chief Accountant', category: 'PAYROLL' },
          { title: 'External Financial Audit Verified', time: '3 days ago', user: 'Audit Team', category: 'AUDIT' },
        ],
        quickActions: [
          { label: 'Fee Collection Desk', route: '/dashboard', icon: 'AccountBalanceWallet' },
          { label: 'Student Accounts', route: '/users', icon: 'People' },
          { label: 'Official Circulars', route: '/notices', icon: 'Campaign' },
          { label: 'Department Accounts', route: '/departments', icon: 'Business' },
        ],
      },

      LIBRARIAN: {
        cards: [
          { label: 'Total Catalog Titles', value: totalBooks || 4500, change: 'Across all streams', color: 'primary' },
          { label: 'Books Currently Issued', value: 128, change: 'Active Borrowers', color: 'warning' },
          { label: 'Overdue Book Returns', value: 9, change: 'Fine Applicable', color: 'error' },
          { label: 'New Titles Added', value: 24, change: 'This Month', color: 'success' },
        ],
        charts: {
          departmentEnrollment: [
            { name: 'Computer Science', titles: 1200, issued: 48 },
            { name: 'Electronics', titles: 850, issued: 32 },
            { name: 'Mechanical', titles: 700, issued: 22 },
            { name: 'Management', titles: 600, issued: 16 },
            { name: 'Literature', titles: 1150, issued: 10 },
          ],
          userGrowthTrend: [
            { month: 'Jan', issued: 340 },
            { month: 'Feb', issued: 410 },
            { month: 'Mar', issued: 490 },
            { month: 'Apr', issued: 380 },
            { month: 'May', issued: 520 },
          ],
        },
        statistics: [
          { label: 'Digital E-Books Collection', value: '12,500+' },
          { label: 'Daily Average Visitors', value: '310' },
          { label: 'Library Fine Collected', value: '$450' },
          { label: 'Active Library Memberships', value: '1,150' },
        ],
        recentActivities: [
          { title: 'Added 10 copies of "Modern Operating Systems"', time: '40 mins ago', user: 'Librarian Desk', category: 'CATALOG' },
          { title: 'Issued "Design Patterns" to Student CS2026', time: '1 hour ago', user: 'Issue Desk', category: 'ISSUE' },
          { title: 'Overdue Book Email Reminder Dispatched', time: 'Yesterday', user: 'Automated Bot', category: 'OVERDUE' },
          { title: 'Annual Journal Subscription Renewed', time: '2 days ago', user: 'Head Librarian', category: 'JOURNALS' },
        ],
        quickActions: [
          { label: 'Library Catalog Register', route: '/dashboard', icon: 'MenuBook' },
          { label: 'Member Registry', route: '/users', icon: 'People' },
          { label: 'Library Announcements', route: '/notices', icon: 'Campaign' },
          { label: 'Department Sections', route: '/departments', icon: 'Business' },
        ],
      },
    };

    const roleStats = statsByRole[user.role] || statsByRole.SUPER_ADMIN;

    res.json({
      success: true,
      role: user.role,
      user: { name: user.name, department: user.department, designation: user.designation },
      stats: roleStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
