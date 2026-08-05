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
  LinearProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';

import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GradeIcon from '@mui/icons-material/Grade';
import PrintIcon from '@mui/icons-material/Print';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

import { useAuth } from '../../context/AuthContext.js';
import { Exam, ExamHall, ExamMark, ExamType, ExamStatus, Student } from '../../types/index.js';
import { examService, SaveExamPayload, SaveExamHallPayload } from '../../services/examService.js';
import { departmentService } from '../../services/departmentService.js';
import { courseService } from '../../services/courseService.js';
import { subjectService } from '../../services/subjectService.js';
import { studentService } from '../../services/studentService.js';

export const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'SUPER_ADMIN';

  // Navigation Tabs: 0 -> Schedules, 1 -> Marks Entry, 2 -> Halls, 3 -> Student Report Card
  const [activeTab, setActiveTab] = useState<number>(0);

  // Metadata dropdown lists
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // ---------------------------------------------------------------------------
  // TAB 0: EXAM SCHEDULES STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState<boolean>(false);

  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterCourse, setFilterCourse] = useState<string>('ALL');
  const [filterSemester, setFilterSemester] = useState<string>('ALL');
  const [filterExamType, setFilterExamType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Exam Create/Edit Dialog State
  const [openExamModal, setOpenExamModal] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState<SaveExamPayload>({
    title: '',
    examType: 'INTERNAL',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    semester: 3,
    academicYear: '2025-2026',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS301',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    totalMarks: 100,
    passMarks: 40,
    weightagePercentage: 20,
    hall: 'Main Exam Hall A',
    invigilator: 'Dr. Sarah Connor',
    status: 'SCHEDULED',
    instructions: '',
  });
  const [savingExam, setSavingExam] = useState<boolean>(false);

  // Delete Exam Dialog
  const [openDeleteExamModal, setOpenDeleteExamModal] = useState<boolean>(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 1: MARKS ENTRY & EVALUATION STATE
  // ---------------------------------------------------------------------------
  const [selectedEvalExamId, setSelectedEvalExamId] = useState<string>('');
  const [evalExam, setEvalExam] = useState<Exam | null>(null);
  const [evalMarks, setEvalMarks] = useState<ExamMark[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);
  const [savingMarks, setSavingMarks] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 2: EXAM HALLS STATE
  // ---------------------------------------------------------------------------
  const [halls, setHalls] = useState<ExamHall[]>([]);
  const [loadingHalls, setLoadingHalls] = useState<boolean>(false);

  // Hall Create/Edit Dialog
  const [openHallModal, setOpenHallModal] = useState<boolean>(false);
  const [selectedHall, setSelectedHall] = useState<ExamHall | null>(null);
  const [hallForm, setHallForm] = useState<SaveExamHallPayload>({
    name: '',
    block: '',
    capacity: 60,
    rows: 6,
    columns: 10,
    facilities: ['CCTV Monitoring', 'Central AC'],
    status: 'AVAILABLE',
  });
  const [savingHall, setSavingHall] = useState<boolean>(false);

  // Delete Hall Dialog
  const [openDeleteHallModal, setOpenDeleteHallModal] = useState<boolean>(false);
  const [hallToDelete, setHallToDelete] = useState<ExamHall | null>(null);
  const [deletingHall, setDeletingHall] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 3: STUDENT REPORT CARD STATE
  // ---------------------------------------------------------------------------
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentReport, setStudentReport] = useState<any>(null);
  const [loadingReportCard, setLoadingReportCard] = useState<boolean>(false);

  // Snackbar Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sync faculty department on user load
  useEffect(() => {
    if ((user?.role === 'FACULTY' || user?.role === 'HOD') && user?.department) {
      setFilterDept(user.department);
      setExamForm((prev) => ({ ...prev, department: user.department || '' }));
    }
  }, [user?.role, user?.department]);

  // Load Reference Metadata
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
      console.error('Error fetching metadata:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Fetch Exams (Tab 0)
  const fetchExamsList = useCallback(async () => {
    setLoadingExams(true);
    try {
      const res = await examService.getExams({
        department: filterDept,
        course: filterCourse,
        semester: filterSemester,
        examType: filterExamType,
        status: filterStatus,
        search: searchQuery,
      });

      if (res.success) {
        setExams(res.exams || []);
        if (res.exams.length > 0 && !selectedEvalExamId) {
          setSelectedEvalExamId(res.exams[0]._id);
        }
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error loading exams', severity: 'error' });
    } finally {
      setLoadingExams(false);
    }
  }, [filterDept, filterCourse, filterSemester, filterExamType, filterStatus, searchQuery, selectedEvalExamId]);

  useEffect(() => {
    if (activeTab === 0) {
      fetchExamsList();
    }
  }, [activeTab, fetchExamsList]);

  // Save / Update Exam Schedule
  const handleSaveExam = async () => {
    if (!examForm.title || !examForm.subject || !examForm.examDate) {
      setSnackbar({ open: true, message: 'Title, Subject, and Exam Date are required.', severity: 'error' });
      return;
    }
    setSavingExam(true);
    try {
      if (selectedExam) {
        await examService.updateExam(selectedExam._id, examForm);
        setSnackbar({ open: true, message: 'Exam schedule updated successfully!', severity: 'success' });
      } else {
        await examService.createExam(examForm);
        setSnackbar({ open: true, message: 'Exam schedule created successfully!', severity: 'success' });
      }
      setOpenExamModal(false);
      fetchExamsList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save exam schedule', severity: 'error' });
    } finally {
      setSavingExam(false);
    }
  };

  // Open Edit Exam Dialog
  const handleOpenEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setExamForm({
      title: exam.title,
      examType: exam.examType,
      department: exam.department,
      course: exam.course,
      semester: exam.semester,
      academicYear: exam.academicYear,
      subject: exam.subject,
      subjectCode: exam.subjectCode,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      weightagePercentage: exam.weightagePercentage || 100,
      hall: exam.hall,
      invigilator: exam.invigilator,
      status: exam.status,
      instructions: exam.instructions || '',
    });
    setOpenExamModal(true);
  };

  // Open Create Exam Dialog
  const handleOpenCreateExam = () => {
    setSelectedExam(null);
    setExamForm({
      title: '',
      examType: 'INTERNAL',
      department: departments[0]?.name || 'Computer Science & Engineering',
      course: courses[0]?.title || courses[0]?.name || 'B.Tech Computer Science',
      semester: 3,
      academicYear: '2025-2026',
      subject: subjects[0]?.name || 'Data Structures & Algorithms',
      subjectCode: subjects[0]?.code || 'CS301',
      examDate: new Date().toISOString().split('T')[0],
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      totalMarks: 100,
      passMarks: 40,
      weightagePercentage: 20,
      hall: 'Main Exam Hall A',
      invigilator: user?.name || 'Dr. Sarah Connor',
      status: 'SCHEDULED',
      instructions: '',
    });
    setOpenExamModal(true);
  };

  // Confirm Delete Exam
  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    setDeletingExam(true);
    try {
      await examService.deleteExam(examToDelete._id);
      setSnackbar({ open: true, message: 'Exam deleted successfully!', severity: 'success' });
      setOpenDeleteExamModal(false);
      fetchExamsList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error deleting exam', severity: 'error' });
    } finally {
      setDeletingExam(false);
    }
  };

  // Fetch Marks for Evaluation (Tab 1)
  const fetchMarksForExam = useCallback(async (examId: string) => {
    if (!examId) return;
    setLoadingMarks(true);
    try {
      const res = await examService.getExamMarks(examId);
      if (res.success) {
        setEvalExam(res.exam);
        setEvalMarks(res.marks || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error loading marks roster', severity: 'error' });
    } finally {
      setLoadingMarks(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 1 && selectedEvalExamId) {
      fetchMarksForExam(selectedEvalExamId);
    }
  }, [activeTab, selectedEvalExamId, fetchMarksForExam]);

  // Handle Marks input change
  const handleMarkChange = (studentId: string, value: number) => {
    setEvalMarks((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId) {
          const total = evalExam?.totalMarks || 100;
          const marksObtained = Math.max(0, Math.min(total, value));
          const percentage = Math.round((marksObtained / total) * 100);

          let grade = 'F';
          let isPassed = false;
          if (percentage >= 90) { grade = 'A+'; isPassed = true; }
          else if (percentage >= 80) { grade = 'A'; isPassed = true; }
          else if (percentage >= 70) { grade = 'B'; isPassed = true; }
          else if (percentage >= 60) { grade = 'C'; isPassed = true; }
          else if (percentage >= 40) { grade = 'D'; isPassed = true; }

          return {
            ...item,
            marksObtained,
            percentage,
            grade,
            isPassed,
          };
        }
        return item;
      })
    );
  };

  // Handle Remarks change
  const handleRemarkChange = (studentId: string, remarks: string) => {
    setEvalMarks((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  // Save Bulk Marks
  const handleSaveBulkMarks = async () => {
    if (!selectedEvalExamId || evalMarks.length === 0) return;
    setSavingMarks(true);
    try {
      await examService.saveBulkMarks(selectedEvalExamId, {
        evaluatedBy: user?.name || 'Faculty Evaluator',
        records: evalMarks.map((m) => ({
          studentId: m.studentId,
          studentRollNo: m.studentRollNo,
          studentName: m.studentName,
          marksObtained: m.marksObtained,
          remarks: m.remarks,
        })),
      });

      setSnackbar({ open: true, message: `Successfully saved marks for ${evalMarks.length} students!`, severity: 'success' });
      fetchMarksForExam(selectedEvalExamId);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save marks', severity: 'error' });
    } finally {
      setSavingMarks(false);
    }
  };

  // Fetch Halls (Tab 2)
  const fetchHallsList = useCallback(async () => {
    setLoadingHalls(true);
    try {
      const res = await examService.getHalls();
      if (res.success) {
        setHalls(res.halls || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching exam halls', severity: 'error' });
    } finally {
      setLoadingHalls(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 2) {
      fetchHallsList();
    }
  }, [activeTab, fetchHallsList]);

  // Save Exam Hall
  const handleSaveHall = async () => {
    if (!hallForm.name || !hallForm.block) {
      setSnackbar({ open: true, message: 'Hall Name and Block are required.', severity: 'error' });
      return;
    }
    setSavingHall(true);
    try {
      if (selectedHall) {
        await examService.updateHall(selectedHall._id, hallForm);
        setSnackbar({ open: true, message: 'Exam hall updated!', severity: 'success' });
      } else {
        await examService.createHall(hallForm);
        setSnackbar({ open: true, message: 'Exam hall created!', severity: 'success' });
      }
      setOpenHallModal(false);
      fetchHallsList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save exam hall', severity: 'error' });
    } finally {
      setSavingHall(false);
    }
  };

  // Delete Hall
  const handleDeleteHall = async () => {
    if (!hallToDelete) return;
    setDeletingHall(true);
    try {
      await examService.deleteHall(hallToDelete._id);
      setSnackbar({ open: true, message: 'Exam hall deleted successfully!', severity: 'success' });
      setOpenDeleteHallModal(false);
      fetchHallsList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error deleting hall', severity: 'error' });
    } finally {
      setDeletingHall(false);
    }
  };

  // Fetch Student Report Card (Tab 3)
  const fetchReportCard = useCallback(async (stdId: string) => {
    if (!stdId) return;
    setLoadingReportCard(true);
    try {
      const res = await examService.getStudentReportCard(stdId);
      if (res.success) {
        setStudentReport(res);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error generating report card', severity: 'error' });
    } finally {
      setLoadingReportCard(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3 && selectedStudentId) {
      fetchReportCard(selectedStudentId);
    }
  }, [activeTab, selectedStudentId, fetchReportCard]);

  // Type Badges
  const getExamTypeChip = (type: ExamType) => {
    switch (type) {
      case 'INTERNAL':
        return <Chip label="Internal Exam" size="small" color="primary" sx={{ fontWeight: 800 }} />;
      case 'SEMESTER':
        return <Chip label="Semester Exam" size="small" color="secondary" sx={{ fontWeight: 800 }} />;
      case 'PRACTICAL':
        return <Chip label="Practical Lab" size="small" color="info" sx={{ fontWeight: 800 }} />;
      case 'ASSIGNMENT':
        return <Chip label="Assignment" size="small" color="warning" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  // Status Badges
  const getStatusChip = (status: ExamStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return <Chip label="SCHEDULED" size="small" color="warning" icon={<AccessTimeIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'ONGOING':
        return <Chip label="ONGOING" size="small" color="info" icon={<FactCheckIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'COMPLETED':
        return <Chip label="COMPLETED" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'RESULTS_PUBLISHED':
        return <Chip label="RESULTS PUBLISHED" size="small" color="secondary" icon={<GradeIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'CANCELLED':
        return <Chip label="CANCELLED" size="small" color="error" icon={<CancelIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Examination Management System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Schedule internal, semester, practical, and assignment exams, manage halls, evaluate marks, and generate official grade sheets.
        </Typography>
      </Box>

      {/* Tabs */}
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
          <Tab
            icon={<QuizIcon />}
            iconPosition="start"
            label="Exam Schedules & CRUD"
            sx={{ fontWeight: 700, py: 2 }}
          />
          <Tab
            icon={<FactCheckIcon />}
            iconPosition="start"
            label="Marks Entry & Evaluation"
            sx={{ fontWeight: 700, py: 2 }}
          />
          <Tab
            icon={<MeetingRoomIcon />}
            iconPosition="start"
            label="Exam Halls & Seating"
            sx={{ fontWeight: 700, py: 2 }}
          />
          <Tab
            icon={<GradeIcon />}
            iconPosition="start"
            label="Student Grade Sheets"
            sx={{ fontWeight: 700, py: 2 }}
          />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: EXAM SCHEDULES & CRUD */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Filters Toolbar */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search exam, subject, hall..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Exam Type</InputLabel>
                  <Select value={filterExamType} label="Exam Type" onChange={(e) => setFilterExamType(e.target.value)}>
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="INTERNAL">Internal Exam</MenuItem>
                    <MenuItem value="SEMESTER">Semester Exam</MenuItem>
                    <MenuItem value="PRACTICAL">Practical Lab</MenuItem>
                    <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                    <MenuItem value="ONGOING">Ongoing</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="RESULTS_PUBLISHED">Results Published</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={filterDept} label="Department" onChange={(e) => setFilterDept(e.target.value)}>
                    {!(user?.role === 'FACULTY' || user?.role === 'HOD') && <MenuItem value="ALL">All Departments</MenuItem>}
                    {((user?.role === 'FACULTY' || user?.role === 'HOD') && user?.department
                      ? [{ _id: 'dept-user', name: user.department }]
                      : departments
                    ).map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchExamsList}>
                  Refresh
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateExam} sx={{ fontWeight: 800 }}>
                  Schedule Exam
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Exam Schedules Table */}
          {loadingExams ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : exams.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No exam schedules found.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateExam} sx={{ mt: 2 }}>
                Schedule First Exam
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Exam Title & Type</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Department & Subject</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Date & Timing</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Hall & Invigilator</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Marks & Pass</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exams.map((e) => (
                      <TableRow key={e._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {e.title}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>{getExamTypeChip(e.examType)}</Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {e.subject} ({e.subjectCode})
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {e.course} • Sem {e.semester}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventAvailableIcon fontSize="small" color="action" /> {e.examDate}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.startTime} - {e.endTime}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {e.hall}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.invigilator}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {e.totalMarks} Marks
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pass: {e.passMarks}
                          </Typography>
                        </TableCell>

                        <TableCell>{getStatusChip(e.status)}</TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Evaluate Marks">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedEvalExamId(e._id);
                                  setActiveTab(1);
                                }}
                              >
                                <FactCheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit Schedule">
                              <IconButton size="small" color="info" onClick={() => handleOpenEditExam(e)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Schedule">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setExamToDelete(e);
                                  setOpenDeleteExamModal(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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
      {/* TAB 1: MARKS ENTRY & EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Scheduled Exam for Evaluation</InputLabel>
                  <Select
                    value={selectedEvalExamId}
                    label="Select Scheduled Exam for Evaluation"
                    onChange={(e) => setSelectedEvalExamId(e.target.value)}
                  >
                    {exams.map((ex) => (
                      <MenuItem key={ex._id} value={ex._id}>
                        {ex.title} — {ex.subject} ({ex.examType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchMarksForExam(selectedEvalExamId)}>
                  Refresh Roster
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveBulkMarks}
                  disabled={savingMarks || evalMarks.length === 0}
                  sx={{ fontWeight: 800 }}
                >
                  {savingMarks ? 'Saving...' : 'Save All Marks'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {evalExam && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">EXAM TITLE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{evalExam.title}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <Typography variant="caption" color="text.secondary">TYPE</Typography>
                  <Box sx={{ mt: 0.5 }}>{getExamTypeChip(evalExam.examType)}</Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <Typography variant="caption" color="text.secondary">TOTAL / PASS MARKS</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{evalExam.totalMarks} / {evalExam.passMarks}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">HALL & INVIGILATOR</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{evalExam.hall} ({evalExam.invigilator})</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Typography variant="caption" color="text.secondary">STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>{getStatusChip(evalExam.status)}</Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {loadingMarks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : evalMarks.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <FactCheckIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Select an exam above to view student evaluation list.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Roll No</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 800, width: 180 }}>Marks Obtained (Out of {evalExam?.totalMarks})</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Percentage %</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Pass / Fail</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evalMarks.map((m) => (
                      <TableRow key={m.studentId} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                          {m.studentRollNo}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Avatar src={m.photo} sx={{ width: 32, height: 32 }}>
                              {m.studentName.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {m.studentName}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={m.marksObtained}
                            onChange={(e) => handleMarkChange(m.studentId, Number(e.target.value))}
                            slotProps={{
                              htmlInput: { min: 0, max: evalExam?.totalMarks || 100 },
                            }}
                            sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {m.percentage}%
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip label={m.grade} size="small" color={m.isPassed ? 'success' : 'error'} sx={{ fontWeight: 800 }} />
                        </TableCell>

                        <TableCell>
                          {m.isPassed ? (
                            <Chip label="PASSED" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                          ) : (
                            <Chip label="FAILED" size="small" color="error" icon={<CancelIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                          )}
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Optional remark..."
                            value={m.remarks}
                            onChange={(e) => handleRemarkChange(m.studentId, e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', bgcolor: 'grey.50' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveBulkMarks}
                  disabled={savingMarks}
                  sx={{ px: 4, borderRadius: 2.5, fontWeight: 800 }}
                >
                  {savingMarks ? 'Saving...' : 'Save & Publish Evaluation Marks'}
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXAM HALLS */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Examination Halls & Seating Infrastructure
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configure hall seating capacity, rows, columns, CCTV, and AC facilities.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedHall(null);
                setHallForm({
                  name: '',
                  block: 'Science Block',
                  capacity: 60,
                  rows: 6,
                  columns: 10,
                  facilities: ['CCTV Monitoring', 'Central AC'],
                  status: 'AVAILABLE',
                });
                setOpenHallModal(true);
              }}
              sx={{ fontWeight: 800 }}
            >
              Add Exam Hall
            </Button>
          </Box>

          {loadingHalls ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {halls.map((h) => (
                <Grid key={h._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1, position: 'relative' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MeetingRoomIcon color="primary" /> {h.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Block: <strong>{h.block}</strong>
                          </Typography>
                        </Box>

                        <Chip
                          label={h.status}
                          size="small"
                          color={h.status === 'AVAILABLE' ? 'success' : h.status === 'OCCUPIED' ? 'warning' : 'error'}
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Capacity</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {h.capacity} Desk Seats
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Grid Layout</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {h.rows} Rows x {h.columns} Cols
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Facilities:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {h.facilities.map((fac, idx) => (
                            <Chip key={idx} label={fac} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedHall(h);
                            setHallForm({
                              name: h.name,
                              block: h.block,
                              capacity: h.capacity,
                              rows: h.rows,
                              columns: h.columns,
                              facilities: h.facilities,
                              status: h.status,
                            });
                            setOpenHallModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setHallToDelete(h);
                            setOpenDeleteHallModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT GRADE SHEETS & REPORT CARDS */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Box>
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Student to View Grade Sheet</InputLabel>
                  <Select
                    value={selectedStudentId}
                    label="Select Student to View Grade Sheet"
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

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                  Print Grade Sheet
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchReportCard(selectedStudentId)}>
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loadingReportCard ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !studentReport ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <GradeIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Select a student to generate official exam grade report card.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* Header Summary */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        OVERALL PERFORMANCE GRADE
                      </Typography>
                      <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main', my: 1 }}>
                        {studentReport.summary.overallGrade}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {studentReport.summary.overallPercentage}% Cumulative
                      </Typography>
                      <Box sx={{ px: 3, my: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, studentReport.summary.overallPercentage)}
                          color={studentReport.summary.overallPercentage >= 40 ? 'success' : 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">EXAMS TAKEN</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                          {studentReport.summary.totalExamsTaken}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">PASSED EXAMS</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
                          {studentReport.summary.passedExamsCount}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">MARKS OBTAINED</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                          {studentReport.summary.totalMarksObtained}
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">MAX MARKS</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                          {studentReport.summary.totalMaxMarks}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Student Details Banner */}
                  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'grey.50' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2"><strong>Student Name:</strong> {studentReport.student.name}</Typography>
                        <Typography variant="body2"><strong>Roll Number:</strong> {studentReport.student.rollNo}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2"><strong>Department:</strong> {studentReport.student.department}</Typography>
                        <Typography variant="body2"><strong>Course & Sem:</strong> {studentReport.student.course} (Sem {studentReport.student.semester})</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Subject Marks Table */}
              <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Marks Obtained</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Total Marks</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Percentage %</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Result Status</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Evaluated By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentReport.marksList.map((m: any) => (
                        <TableRow key={m.markId} hover>
                          <TableCell sx={{ fontWeight: 800 }}>{m.subject}</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>{m.marksObtained}</TableCell>
                          <TableCell>{m.totalMarks}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>{m.percentage}%</TableCell>
                          <TableCell>
                            <Chip label={m.grade} size="small" color={m.isPassed ? 'success' : 'error'} sx={{ fontWeight: 800 }} />
                          </TableCell>
                          <TableCell>
                            {m.isPassed ? (
                              <Chip label="PASS" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                            ) : (
                              <Chip label="FAIL" size="small" color="error" icon={<CancelIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                            )}
                          </TableCell>
                          <TableCell color="text.secondary">{m.evaluatedBy || 'Faculty'}</TableCell>
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
      {/* DIALOG 1: CREATE / EDIT EXAM SCHEDULE */}
      {/* ========================================================================= */}
      <Dialog
        open={openExamModal}
        onClose={() => setOpenExamModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedExam ? 'Edit Exam Schedule' : 'Schedule New Examination'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Exam Title"
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="e.g. Mid-Semester Assessment 1"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={examForm.examType}
                  label="Exam Type"
                  onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as ExamType })}
                >
                  <MenuItem value="INTERNAL">Internal Exam</MenuItem>
                  <MenuItem value="SEMESTER">Semester Exam</MenuItem>
                  <MenuItem value="PRACTICAL">Practical Lab</MenuItem>
                  <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={examForm.department}
                  label="Department"
                  onChange={(e) => setExamForm({ ...examForm, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <MenuItem key={d._id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Course</InputLabel>
                <Select
                  value={examForm.course}
                  label="Course"
                  onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                >
                  {(() => {
                    const fromDb = courses.map((c) => c.title || c.name || c.code).filter(Boolean);
                    const defaultCourses = [
                      'B.Tech Computer Science',
                      'B.Tech Electronics & Communication',
                      'B.Tech Mechanical Engineering',
                      'B.Tech Civil Engineering',
                      'Master of Computer Applications (MCA)',
                      'Master of Business Administration (MBA)',
                    ];
                    const set = new Set<string>();
                    fromDb.forEach((c) => set.add(c));
                    defaultCourses.forEach((c) => set.add(c));
                    if (examForm.course) set.add(examForm.course);
                    return Array.from(set).map((cName) => (
                      <MenuItem key={cName} value={cName}>
                        {cName}
                      </MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={examForm.semester}
                  label="Semester"
                  onChange={(e) => setExamForm({ ...examForm, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <MenuItem key={s} value={s}>
                      Sem {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Academic Year"
                value={examForm.academicYear}
                onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Subject Name"
                value={examForm.subject}
                onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Subject Code"
                value={examForm.subjectCode}
                onChange={(e) => setExamForm({ ...examForm, subjectCode: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Exam Date"
                value={examForm.examDate}
                onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Start Time"
                value={examForm.startTime}
                onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="End Time"
                value={examForm.endTime}
                onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Total Marks"
                value={examForm.totalMarks}
                onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Pass Marks"
                value={examForm.passMarks}
                onChange={(e) => setExamForm({ ...examForm, passMarks: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={examForm.status}
                  label="Status"
                  onChange={(e) => setExamForm({ ...examForm, status: e.target.value as ExamStatus })}
                >
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="ONGOING">Ongoing</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="RESULTS_PUBLISHED">Results Published</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Exam Hall Name"
                value={examForm.hall}
                onChange={(e) => setExamForm({ ...examForm, hall: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Invigilator Name"
                value={examForm.invigilator}
                onChange={(e) => setExamForm({ ...examForm, invigilator: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Instructions for Students"
                value={examForm.instructions}
                onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenExamModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveExam} disabled={savingExam} sx={{ fontWeight: 800 }}>
            {savingExam ? 'Saving...' : selectedExam ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: DELETE EXAM */}
      {/* ========================================================================= */}
      <Dialog
        open={openDeleteExamModal}
        onClose={() => setOpenDeleteExamModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Delete Exam Schedule?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong>{examToDelete?.title}</strong>? This will also remove any evaluation marks recorded for this exam.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteExamModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteExam} disabled={deletingExam} sx={{ fontWeight: 800 }}>
            {deletingExam ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 3: CREATE / EDIT EXAM HALL */}
      {/* ========================================================================= */}
      <Dialog
        open={openHallModal}
        onClose={() => setOpenHallModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedHall ? 'Edit Examination Hall' : 'Add New Exam Hall'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Hall Name"
                value={hallForm.name}
                onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                placeholder="e.g. Main Hall A"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Block Name"
                value={hallForm.block}
                onChange={(e) => setHallForm({ ...hallForm, block: e.target.value })}
                placeholder="e.g. Science Block"
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Capacity"
                value={hallForm.capacity}
                onChange={(e) => setHallForm({ ...hallForm, capacity: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Rows"
                value={hallForm.rows}
                onChange={(e) => setHallForm({ ...hallForm, rows: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Columns"
                value={hallForm.columns}
                onChange={(e) => setHallForm({ ...hallForm, columns: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={hallForm.status}
                  label="Status"
                  onChange={(e) => setHallForm({ ...hallForm, status: e.target.value as any })}
                >
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="OCCUPIED">Occupied</MenuItem>
                  <MenuItem value="MAINTENANCE">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenHallModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHall} disabled={savingHall} sx={{ fontWeight: 800 }}>
            {savingHall ? 'Saving...' : selectedHall ? 'Update Hall' : 'Create Hall'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 4: DELETE HALL */}
      {/* ========================================================================= */}
      <Dialog
        open={openDeleteHallModal}
        onClose={() => setOpenDeleteHallModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          Delete Exam Hall?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete hall <strong>{hallToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteHallModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteHall} disabled={deletingHall} sx={{ fontWeight: 800 }}>
            {deletingHall ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
