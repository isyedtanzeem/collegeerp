import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Tab,
  Tabs,
  Avatar,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Badge,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { useAuth } from '../../context/AuthContext.js';
import { AttendanceStatus, AttendanceRecord, Student } from '../../types/index.js';
import { attendanceService, MonthlyReportResponse, AttendanceSummaryResponse } from '../../services/attendanceService.js';
import { departmentService } from '../../services/departmentService.js';
import { courseService } from '../../services/courseService.js';
import { subjectService } from '../../services/subjectService.js';
import { studentService } from '../../services/studentService.js';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'SUPER_ADMIN';

  // Active Tab View: 0 -> Faculty Mark Attendance, 1 -> Monthly Reports, 2 -> Student View, 3 -> Admin Summary & Logs
  const [activeTab, setActiveTab] = useState<number>(
    userRole === 'FACULTY' ? 0 : userRole === 'STUDENT' ? 2 : 0
  );

  // Common Reference Lists
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // -------------------------------------------------------------
  // TAB 0: FACULTY MARK ATTENDANCE STATE
  // -------------------------------------------------------------
  const [markDept, setMarkDept] = useState<string>('Computer Science & Engineering');
  const [markCourse, setMarkCourse] = useState<string>('B.Tech Computer Science');
  const [markSemester, setMarkSemester] = useState<number>(3);
  const [markSection, setMarkSection] = useState<string>('A');
  const [markSubject, setMarkSubject] = useState<string>('Data Structures & Algorithms');
  const [markDate, setMarkDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [classRoster, setClassRoster] = useState<
    {
      studentId: string;
      studentRollNo: string;
      studentName: string;
      status: AttendanceStatus;
      remarks: string;
      photo?: string;
    }[]
  >([]);

  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);
  const [savingAttendance, setSavingAttendance] = useState<boolean>(false);

  // -------------------------------------------------------------
  // TAB 1: MONTHLY REPORT STATE
  // -------------------------------------------------------------
  const [reportDept, setReportDept] = useState<string>('Computer Science & Engineering');
  const [reportCourse, setReportCourse] = useState<string>('B.Tech Computer Science');
  const [reportSemester, setReportSemester] = useState<string>('3');
  const [reportSection, setReportSection] = useState<string>('A');
  const [reportSubject, setReportSubject] = useState<string>('ALL');
  const [reportMonth, setReportMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );

  const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // -------------------------------------------------------------
  // TAB 2: STUDENT ATTENDANCE VIEW STATE
  // -------------------------------------------------------------
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentStats, setStudentStats] = useState<any>(null);
  const [loadingStudentStats, setLoadingStudentStats] = useState<boolean>(false);

  // -------------------------------------------------------------
  // TAB 3: ADMIN SUMMARY & LOGS STATE
  // -------------------------------------------------------------
  const [adminSummary, setAdminSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch Metadata Options
  const fetchMetadata = useCallback(async () => {
    try {
      const [deptRes, courseRes, subjRes, stdRes] = await Promise.all([
        departmentService.getDepartments(),
        courseService.getCourses(),
        subjectService.getSubjects({ limit: 100 }),
        studentService.getStudents({ limit: 200 }),
      ]);

      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (courseRes.success) setCourses(courseRes.courses || []);
      if (subjRes.success) setSubjects(subjRes.subjects || []);
      if (stdRes.success) {
        setStudents(stdRes.students || []);
        if (stdRes.students.length > 0) {
          setSelectedStudentId(stdRes.students[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading metadata for attendance:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Sync faculty department on user load
  useEffect(() => {
    if ((userRole === 'FACULTY' || userRole === 'HOD') && user?.department) {
      setMarkDept(user.department);
      setReportDept(user.department);
    }
  }, [userRole, user?.department]);

  // Helper options generator to guarantee non-empty robust dropdown options
  const getCourseOptions = (currentSelected?: string) => {
    let dbCourses = courses;
    if ((userRole === 'FACULTY' || userRole === 'HOD') && user?.department) {
      dbCourses = courses.filter((c) => !c.department || c.department === user.department);
    }
    const fromDb = dbCourses.map((c) => c.title || c.name || c.code).filter(Boolean);
    
    let standardCourses = [
      'B.Tech Computer Science',
      'B.Tech Electronics & Communication',
      'B.Tech Mechanical Engineering',
      'B.Tech Civil Engineering',
      'B.Tech Electrical Engineering',
      'Master of Computer Applications (MCA)',
      'Master of Business Administration (MBA)',
      'B.Sc Computer Science',
      'M.Tech Computer Science',
    ];

    if ((userRole === 'FACULTY' || userRole === 'HOD') && user?.department) {
      const deptLower = user.department.toLowerCase();
      if (deptLower.includes('computer') || deptLower.includes('cs') || deptLower.includes('it')) {
        standardCourses = ['B.Tech Computer Science', 'Master of Computer Applications (MCA)', 'B.Sc Computer Science', 'M.Tech Computer Science'];
      } else if (deptLower.includes('electronics') || deptLower.includes('ece')) {
        standardCourses = ['B.Tech Electronics & Communication', 'M.Tech Electronics'];
      } else if (deptLower.includes('mechanical') || deptLower.includes('me')) {
        standardCourses = ['B.Tech Mechanical Engineering', 'M.Tech Thermal Engg'];
      } else if (deptLower.includes('civil') || deptLower.includes('ce')) {
        standardCourses = ['B.Tech Civil Engineering', 'M.Tech Structural Engg'];
      } else if (deptLower.includes('management') || deptLower.includes('business') || deptLower.includes('mba')) {
        standardCourses = ['Master of Business Administration (MBA)', 'BBA'];
      }
    }

    const set = new Set<string>();
    fromDb.forEach((c) => set.add(c));
    standardCourses.forEach((c) => set.add(c));
    if (currentSelected) set.add(currentSelected);
    return Array.from(set);
  };

  const getDepartmentOptions = (currentSelected?: string) => {
    if ((userRole === 'FACULTY' || userRole === 'HOD') && user?.department) {
      return [user.department];
    }
    const fromDb = departments.map((d) => d.name || d.title).filter(Boolean);
    const standardDepts = [
      'Computer Science & Engineering',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Management Studies',
    ];
    const set = new Set<string>();
    fromDb.forEach((d) => set.add(d));
    standardDepts.forEach((d) => set.add(d));
    if (currentSelected) set.add(currentSelected);
    return Array.from(set);
  };

  const getSubjectOptions = (currentSelected?: string) => {
    let dbSubjects = subjects;
    if ((userRole === 'FACULTY' || userRole === 'HOD') && user?.department) {
      dbSubjects = subjects.filter((s) => !s.department || s.department === user.department || s.facultyName === user.name);
    }
    const fromDb = dbSubjects.map((s) => s.name).filter(Boolean);
    const standardSubjs = [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering',
      'Web Technologies',
      'Object Oriented Programming',
    ];
    const set = new Set<string>();
    fromDb.forEach((s) => set.add(s));
    standardSubjs.forEach((s) => set.add(s));
    if (currentSelected) set.add(currentSelected);
    return Array.from(set);
  };

  // Load Roster for Faculty Marking
  const handleLoadClassRoster = useCallback(async () => {
    if (!markDept || !markCourse) return;
    setLoadingRoster(true);
    try {
      // 1. Fetch enrolled students for this class
      const stdRes = await studentService.getStudents({
        department: markDept,
        course: markCourse,
        semester: markSemester,
        section: markSection,
        limit: 100,
      });

      // 2. Fetch existing attendance records if already marked for this date and subject
      const attRes = await attendanceService.getAttendance({
        department: markDept,
        course: markCourse,
        semester: markSemester,
        section: markSection,
        subject: markSubject,
        date: markDate,
      });

      const existingMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      if (attRes.success && attRes.attendance) {
        attRes.attendance.forEach((record) => {
          existingMap[record.studentId] = {
            status: record.status,
            remarks: record.remarks || '',
          };
        });
      }

      const roster = (stdRes.students || []).map((std) => ({
        studentId: std._id,
        studentRollNo: std.studentId || std.admissionNumber,
        studentName: std.name,
        photo: std.photo,
        status: existingMap[std._id]?.status || ('PRESENT' as AttendanceStatus),
        remarks: existingMap[std._id]?.remarks || '',
      }));

      setClassRoster(roster);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error loading class roster',
        severity: 'error',
      });
    } finally {
      setLoadingRoster(false);
    }
  }, [markDept, markCourse, markSemester, markSection, markSubject, markDate]);

  useEffect(() => {
    if (activeTab === 0) {
      handleLoadClassRoster();
    }
  }, [activeTab, handleLoadClassRoster]);

  // Bulk Quick Actions
  const handleSetAllStatus = (status: AttendanceStatus) => {
    setClassRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status,
      }))
    );
  };

  // Individual Student Status Change
  const handleIndividualStatusChange = (studentId: string, status: AttendanceStatus) => {
    setClassRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  // Individual Remarks Change
  const handleIndividualRemarksChange = (studentId: string, remarks: string) => {
    setClassRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  // Save Attendance (Faculty View)
  const handleSaveAttendance = async () => {
    if (classRoster.length === 0) {
      setSnackbar({ open: true, message: 'No students in roster to save', severity: 'info' });
      return;
    }
    setSavingAttendance(true);
    try {
      await attendanceService.markBulkAttendance({
        date: markDate,
        subject: markSubject,
        department: markDept,
        course: markCourse,
        semester: markSemester,
        section: markSection,
        markedBy: user?.name || 'Faculty Instructor',
        records: classRoster.map((item) => ({
          studentId: item.studentId,
          studentRollNo: item.studentRollNo,
          studentName: item.studentName,
          status: item.status,
          remarks: item.remarks,
        })),
      });

      setSnackbar({
        open: true,
        message: `Attendance for ${classRoster.length} students on ${markDate} saved successfully!`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to save attendance',
        severity: 'error',
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  // Generate Monthly Report (Tab 1)
  const handleGenerateMonthlyReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const res = await attendanceService.getMonthlyReport({
        department: reportDept,
        course: reportCourse,
        semester: reportSemester,
        section: reportSection,
        subject: reportSubject,
        month: reportMonth,
      });

      if (res.success) {
        setMonthlyReportData(res);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to generate monthly report',
        severity: 'error',
      });
    } finally {
      setLoadingReport(false);
    }
  }, [reportDept, reportCourse, reportSemester, reportSection, reportSubject, reportMonth]);

  useEffect(() => {
    if (activeTab === 1) {
      handleGenerateMonthlyReport();
    }
  }, [activeTab, handleGenerateMonthlyReport]);

  // Fetch Individual Student Stats (Tab 2)
  const fetchStudentStats = useCallback(async (stdId: string) => {
    if (!stdId) return;
    setLoadingStudentStats(true);
    try {
      const res = await attendanceService.getStudentStats(stdId);
      if (res.success) {
        setStudentStats(res);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error fetching student attendance stats',
        severity: 'error',
      });
    } finally {
      setLoadingStudentStats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 2 && selectedStudentId) {
      fetchStudentStats(selectedStudentId);
    }
  }, [activeTab, selectedStudentId, fetchStudentStats]);

  // Fetch Admin Summary & Logs (Tab 3)
  const fetchAdminSummary = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const [sumRes, logRes] = await Promise.all([
        attendanceService.getSummary(),
        attendanceService.getAttendance({ month: new Date().toISOString().substring(0, 7) }),
      ]);

      if (sumRes.success) setAdminSummary(sumRes);
      if (logRes.success) setAttendanceLogs(logRes.attendance || []);
    } catch (err) {
      console.error('Error fetching admin summary:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3) {
      fetchAdminSummary();
    }
  }, [activeTab, fetchAdminSummary]);

  // Status Badge Colors
  const getStatusChip = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <Chip label="PRESENT" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'ABSENT':
        return <Chip label="ABSENT" size="small" color="error" icon={<CancelIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'LATE':
        return <Chip label="LATE" size="small" color="warning" icon={<AccessTimeIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'HOLIDAY':
        return <Chip label="HOLIDAY" size="small" color="info" icon={<BeachAccessIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Title Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Attendance Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mark daily faculty attendance, review student percentage metrics, and generate printable monthly reports.
        </Typography>
      </Box>

      {/* Role Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {userRole !== 'STUDENT' && (
            <Tab
              icon={<HowToRegIcon />}
              iconPosition="start"
              label="Faculty Attendance Marker"
              sx={{ fontWeight: 700, py: 2 }}
            />
          )}
          {userRole !== 'STUDENT' && (
            <Tab
              icon={<AssessmentIcon />}
              iconPosition="start"
              label="Monthly Reports & Matrix"
              sx={{ fontWeight: 700, py: 2 }}
            />
          )}
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label="My Attendance & Subject Breakdown"
            sx={{ fontWeight: 700, py: 2 }}
          />
          {userRole !== 'STUDENT' && (
            <Tab
              icon={<CalendarMonthIcon />}
              iconPosition="start"
              label="Admin Summary & Audit Logs"
              sx={{ fontWeight: 700, py: 2 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: FACULTY ATTENDANCE MARKER */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Class Selector Panel */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> Class & Lecture Details
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={markDept} label="Department" onChange={(e) => setMarkDept(e.target.value)}>
                    {getDepartmentOptions(markDept).map((dName) => (
                      <MenuItem key={dName} value={dName}>
                        {dName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Course</InputLabel>
                  <Select value={markCourse} label="Course" onChange={(e) => setMarkCourse(e.target.value)}>
                    {getCourseOptions(markCourse).map((cName) => (
                      <MenuItem key={cName} value={cName}>
                        {cName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select value={markSemester} label="Semester" onChange={(e) => setMarkSemester(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <MenuItem key={s} value={s}>
                        Sem {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={markSection} label="Section" onChange={(e) => setMarkSection(e.target.value)}>
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        Section {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Teaching Subject</InputLabel>
                  <Select value={markSubject} label="Teaching Subject" onChange={(e) => setMarkSubject(e.target.value)}>
                    {getSubjectOptions(markSubject).map((sName) => (
                      <MenuItem key={sName} value={sName}>
                        {sName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Attendance Date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleLoadClassRoster}
                  disabled={loadingRoster}
                  sx={{ borderRadius: 2 }}
                >
                  Reload Roster
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Roster & Marking Area */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Student Attendance List ({classRoster.length} Enrolled)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mark Present, Absent, Late, or Holiday for date: <strong>{markDate}</strong>
                </Typography>
              </Box>

              {/* Bulk Actions */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" color="success" onClick={() => handleSetAllStatus('PRESENT')}>
                  All Present
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => handleSetAllStatus('ABSENT')}>
                  All Absent
                </Button>
                <Button size="small" variant="outlined" color="info" onClick={() => handleSetAllStatus('HOLIDAY')}>
                  All Holiday
                </Button>
              </Stack>
            </Box>

            {loadingRoster ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : classRoster.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  No enrolled students found for the selected class criteria.
                </Typography>
              </Box>
            ) : (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 340 }}>Attendance Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Remarks / Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {classRoster.map((item) => (
                        <TableRow key={item.studentId} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                            {item.studentRollNo}
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                              <Avatar src={item.photo} alt={item.studentName} sx={{ width: 36, height: 36 }}>
                                {item.studentName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {item.studentName}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <RadioGroup
                              row
                              value={item.status}
                              onChange={(e) =>
                                handleIndividualStatusChange(item.studentId, e.target.value as AttendanceStatus)
                              }
                            >
                              <FormControlLabel
                                value="PRESENT"
                                control={<Radio size="small" color="success" />}
                                label={<Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>Present</Typography>}
                              />
                              <FormControlLabel
                                value="ABSENT"
                                control={<Radio size="small" color="error" />}
                                label={<Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>Absent</Typography>}
                              />
                              <FormControlLabel
                                value="LATE"
                                control={<Radio size="small" color="warning" />}
                                label={<Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main' }}>Late</Typography>}
                              />
                              <FormControlLabel
                                value="HOLIDAY"
                                control={<Radio size="small" color="info" />}
                                label={<Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main' }}>Holiday</Typography>}
                              />
                            </RadioGroup>
                          </TableCell>

                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Optional remarks..."
                              value={item.remarks}
                              onChange={(e) => handleIndividualRemarksChange(item.studentId, e.target.value)}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    sx={{ px: 4, py: 1.2, borderRadius: 2.5, fontWeight: 800 }}
                  >
                    {savingAttendance ? 'Saving Attendance...' : 'Save Class Attendance'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MONTHLY REPORTS & MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" /> Monthly Attendance Filter Parameters
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={reportDept} label="Department" onChange={(e) => setReportDept(e.target.value)}>
                    {getDepartmentOptions(reportDept).map((dName) => (
                      <MenuItem key={dName} value={dName}>
                        {dName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Course</InputLabel>
                  <Select value={reportCourse} label="Course" onChange={(e) => setReportCourse(e.target.value)}>
                    {getCourseOptions(reportCourse).map((cName) => (
                      <MenuItem key={cName} value={cName}>
                        {cName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select value={reportSemester} label="Semester" onChange={(e) => setReportSemester(e.target.value)}>
                    <MenuItem value="ALL">All Semesters</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <MenuItem key={s} value={String(s)}>
                        Sem {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select value={reportSection} label="Section" onChange={(e) => setReportSection(e.target.value)}>
                    <MenuItem value="ALL">All Sections</MenuItem>
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        Section {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="month"
                  label="Select Month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{ borderRadius: 2 }}
                >
                  Print Report
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={handleGenerateMonthlyReport}
                  disabled={loadingReport}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Report Data Matrix Table */}
          {loadingReport ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !monthlyReportData || monthlyReportData.report.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No monthly attendance records found for this query.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Monthly Attendance Matrix — {reportMonth}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Total Conducted Sessions: {monthlyReportData.dates.length} Days | Enrolled Students: {monthlyReportData.totalStudents}
                  </Typography>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, bgcolor: 'grey.100', minWidth: 100 }}>Roll No</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: 'grey.100', minWidth: 160 }}>Student Name</TableCell>

                      {/* Day Columns */}
                      {monthlyReportData.dates.map((d) => (
                        <TableCell key={d} align="center" sx={{ fontWeight: 800, bgcolor: 'grey.100', px: 1, minWidth: 40 }}>
                          {d.split('-')[2]}
                        </TableCell>
                      ))}

                      <TableCell align="center" sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Present</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Absent</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Late</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, bgcolor: 'grey.100' }}>Attendance %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlyReportData.report.map((row) => (
                      <TableRow key={row.studentId} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{row.rollNo}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>

                        {/* Daily Status Cells */}
                        {monthlyReportData.dates.map((d) => {
                          const st = row.dailyStatus[d];
                          let symbol = '-';
                          let colorStr = 'text.secondary';
                          if (st === 'PRESENT') {
                            symbol = 'P';
                            colorStr = 'success.main';
                          } else if (st === 'ABSENT') {
                            symbol = 'A';
                            colorStr = 'error.main';
                          } else if (st === 'LATE') {
                            symbol = 'L';
                            colorStr = 'warning.main';
                          } else if (st === 'HOLIDAY') {
                            symbol = 'H';
                            colorStr = 'info.main';
                          }

                          return (
                            <TableCell key={d} align="center" sx={{ fontWeight: 800, color: colorStr, px: 1 }}>
                              {symbol}
                            </TableCell>
                          );
                        })}

                        <TableCell align="center" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {row.presentCount}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: 'error.main' }}>
                          {row.absentCount}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: 'warning.main' }}>
                          {row.lateCount}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${row.percentage}%`}
                            size="small"
                            color={row.percentage >= 75 ? 'success' : 'error'}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT ATTENDANCE % VIEW */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Box>
          {userRole !== 'STUDENT' && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Student Profile</InputLabel>
                    <Select
                      value={selectedStudentId}
                      label="Select Student Profile"
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      {students.map((std) => (
                        <MenuItem key={std._id} value={std._id}>
                          {std.name} ({std.studentId || std.admissionNumber}) — {std.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => fetchStudentStats(selectedStudentId)}
                    disabled={loadingStudentStats}
                    sx={{ borderRadius: 2 }}
                  >
                    Refresh Stats
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {loadingStudentStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !studentStats ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="body1" color="text.secondary">
                Select a student to view subject-wise attendance percentage breakdown.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* Overall Percentage Card */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                        OVERALL ATTENDANCE %
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          my: 1,
                          color: studentStats.summary.overallPercentage >= 75 ? 'success.main' : 'error.main',
                        }}
                      >
                        {studentStats.summary.overallPercentage}%
                      </Typography>

                      <Box sx={{ px: 3, my: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, studentStats.summary.overallPercentage)}
                          color={studentStats.summary.overallPercentage >= 75 ? 'success' : 'error'}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>

                      {studentStats.summary.overallPercentage < 75 && (
                        <Alert severity="warning" sx={{ mt: 2, textAlign: 'left', borderRadius: 2 }}>
                          Attendance is below mandatory 75% threshold. At risk of exam eligibility.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">PRESENT</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
                          {studentStats.summary.present}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">ABSENT</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
                          {studentStats.summary.absent}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">LATE</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
                          {studentStats.summary.late}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">HOLIDAYS</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
                          {studentStats.summary.holiday}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Student Details Card */}
                  <Paper sx={{ p: 2, mt: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'grey.50' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2"><strong>Student:</strong> {studentStats.student.name}</Typography>
                        <Typography variant="body2"><strong>Roll No:</strong> {studentStats.student.rollNo}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2"><strong>Department:</strong> {studentStats.student.department}</Typography>
                        <Typography variant="body2"><strong>Course & Sem:</strong> {studentStats.student.course} (Sem {studentStats.student.semester})</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Subject Wise Percentage Breakdown */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Subject-Wise Attendance Percentage
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Subject Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Classes</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Present</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Absent</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Late</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 220 }}>Progress & %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentStats.subjectBreakdown.map((sb: any) => (
                        <TableRow key={sb.subject} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{sb.subject}</TableCell>
                          <TableCell>{sb.totalClasses}</TableCell>
                          <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>{sb.present}</TableCell>
                          <TableCell sx={{ color: 'error.main', fontWeight: 700 }}>{sb.absent}</TableCell>
                          <TableCell sx={{ color: 'warning.main', fontWeight: 700 }}>{sb.late}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, sb.percentage)}
                                  color={sb.percentage >= 75 ? 'success' : 'error'}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Chip
                                label={`${sb.percentage}%`}
                                size="small"
                                color={sb.percentage >= 75 ? 'success' : 'error'}
                                sx={{ fontWeight: 800 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Recent History */}
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Recent Attendance Logs
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Marked By</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentStats.recentHistory.map((rec: AttendanceRecord) => (
                        <TableRow key={rec._id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{rec.date}</TableCell>
                          <TableCell>{rec.subject}</TableCell>
                          <TableCell>{getStatusChip(rec.status)}</TableCell>
                          <TableCell>{rec.markedBy}</TableCell>
                          <TableCell color="text.secondary">{rec.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMIN SUMMARY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Box>
          {loadingLogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Today's High Level Overview */}
              {adminSummary && (
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 48, height: 48 }}>
                          <CheckCircleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">TODAY PRESENT</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {adminSummary.today.present}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 48, height: 48 }}>
                          <CancelIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">TODAY ABSENT</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {adminSummary.today.absent}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 48, height: 48 }}>
                          <AccessTimeIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">TODAY LATE</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {adminSummary.today.late}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
                          <BeachAccessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">TODAY HOLIDAY</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {adminSummary.today.holiday}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* At Risk Students (<75%) */}
              {adminSummary && adminSummary.atRiskStudents.length > 0 && (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon /> Low Attendance Warning (&lt;75% Mandatory Minimum)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The following students currently have attendance below 75% threshold:
                  </Typography>

                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Classes Conducted</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Attended</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {adminSummary.atRiskStudents.map((st) => (
                          <TableRow key={st._id}>
                            <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{st.studentRollNo}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{st.studentName}</TableCell>
                            <TableCell>{st.department}</TableCell>
                            <TableCell>{st.total}</TableCell>
                            <TableCell>{st.present}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${Math.round(st.percentage)}%`}
                                size="small"
                                color="error"
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Attendance System Audit Logs */}
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  System-wide Attendance Audit Logs ({attendanceLogs.length} Records)
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Department / Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Marked By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceLogs.slice(0, 50).map((log) => (
                        <TableRow key={log._id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{log.date}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{log.studentRollNo}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{log.studentName}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.subject}</Typography>
                            <Typography variant="caption" color="text.secondary">{log.department}</Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(log.status)}</TableCell>
                          <TableCell>{log.markedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
