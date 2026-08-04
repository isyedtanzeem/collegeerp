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
  InputAdornment,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SendIcon from '@mui/icons-material/Send';
import AttachmentIcon from '@mui/icons-material/Attachment';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

import { useAuth } from '../../context/AuthContext.js';
import { Assignment, Submission, AssignmentStats, Department, Subject, Student } from '../../types/index.js';
import { assignmentService, SaveAssignmentPayload } from '../../services/assignmentService.js';
import { departmentService } from '../../services/departmentService.js';
import { subjectService } from '../../services/subjectService.js';
import { studentService } from '../../services/studentService.js';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab Index
  const [activeTab, setActiveTab] = useState<number>(0);

  // Stats & Master Data State
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false);
  const [assignmentSearch, setAssignmentSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Submissions State for Grading
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [gradingAssignmentFilter, setGradingAssignmentFilter] = useState<string>('ALL');
  const [gradingStatusFilter, setGradingStatusFilter] = useState<string>('ALL');

  // Student Submissions State
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [loadingStudentSubmissions, setLoadingStudentSubmissions] = useState<boolean>(false);

  // Dialog States
  // 1. Faculty Upload / Edit Assignment Dialog
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<{
    title: string;
    description: string;
    department: string;
    course: string;
    subject: string;
    semester: number;
    section: string;
    totalMarks: number;
    dueDate: string;
    status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
    attachmentFile: File | null;
  }>({
    title: '',
    description: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS',
    subject: 'Data Structures & Algorithms',
    semester: 3,
    section: 'A',
    totalMarks: 100,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'PUBLISHED',
    attachmentFile: null,
  });

  // 2. Student Submission Dialog
  const [openSubmitDialog, setOpenSubmitDialog] = useState<boolean>(false);
  const [selectedAssignmentToSubmit, setSelectedAssignmentToSubmit] = useState<Assignment | null>(null);
  const [submissionFormData, setSubmissionFormData] = useState<{
    studentId: string;
    studentName: string;
    studentRollNo: string;
    department: string;
    comments: string;
    submissionFile: File | null;
  }>({
    studentId: user?._id || 'STU-1001',
    studentName: user?.name || 'Student User',
    studentRollNo: user?.enrollmentNo || 'ROLL-101',
    department: user?.department || 'Computer Science & Engineering',
    comments: '',
    submissionFile: null,
  });

  // 3. Faculty Grading & Feedback Dialog
  const [openGradeDialog, setOpenGradeDialog] = useState<boolean>(false);
  const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<Submission | null>(null);
  const [gradeFormData, setGradeFormData] = useState<{
    obtainedMarks: number;
    feedback: string;
    status: 'GRADED' | 'RESUBMISSION_REQUESTED';
  }>({
    obtainedMarks: 0,
    feedback: '',
    status: 'GRADED',
  });

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // FETCHERS
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await assignmentService.getStats();
      if (res.success) setStats(res.stats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const res = await assignmentService.getAssignments({
        department: departmentFilter,
        subject: subjectFilter,
        search: assignmentSearch,
      });
      if (res.success) setAssignments(res.assignments);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  }, [departmentFilter, subjectFilter, assignmentSearch]);

  const fetchDepartmentsAndSubjects = useCallback(async () => {
    try {
      const [deptRes, subjRes, studRes] = await Promise.all([
        departmentService.getDepartments(),
        subjectService.getSubjects(),
        studentService.getStudents(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (subjRes.success) setSubjects(subjRes.subjects);
      if (studRes.success) setStudents(studRes.students);
    } catch (err: any) {
      console.error('Error fetching master data:', err);
    }
  }, []);

  const fetchSubmissionsForGrading = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      if (gradingAssignmentFilter !== 'ALL') {
        const res = await assignmentService.getSubmissionsForAssignment(gradingAssignmentFilter);
        if (res.success) {
          let filtered = res.submissions;
          if (gradingStatusFilter !== 'ALL') {
            filtered = filtered.filter((s) => s.status === gradingStatusFilter);
          }
          setSubmissions(filtered);
        }
      } else {
        // Fetch all submissions from active assignments
        const allSubs: Submission[] = [];
        for (const assign of assignments) {
          const res = await assignmentService.getSubmissionsForAssignment(assign._id);
          if (res.success) {
            allSubs.push(...res.submissions);
          }
        }
        let filtered = allSubs;
        if (gradingStatusFilter !== 'ALL') {
          filtered = filtered.filter((s) => s.status === gradingStatusFilter);
        }
        setSubmissions(filtered);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [gradingAssignmentFilter, gradingStatusFilter, assignments]);

  const fetchMySubmissions = useCallback(async () => {
    setLoadingStudentSubmissions(true);
    try {
      const res = await assignmentService.getStudentSubmissions(user?._id);
      if (res.success) setStudentSubmissions(res.submissions);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStudentSubmissions(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchStats();
    fetchDepartmentsAndSubjects();
  }, [fetchStats, fetchDepartmentsAndSubjects]);

  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) fetchAssignments();
    if (activeTab === 2) fetchSubmissionsForGrading();
    if (activeTab === 3) fetchMySubmissions();
  }, [activeTab, fetchAssignments, fetchSubmissionsForGrading, fetchMySubmissions]);

  // FACULTY CREATE / EDIT ASSIGNMENT HANDLERS
  const handleOpenCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentFormData({
      title: '',
      description: '',
      department: departments[0]?.name || 'Computer Science & Engineering',
      course: 'B.Tech CS',
      subject: subjects[0]?.name || 'Data Structures & Algorithms',
      semester: 3,
      section: 'A',
      totalMarks: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PUBLISHED',
      attachmentFile: null,
    });
    setOpenAssignmentDialog(true);
  };

  const handleOpenEditAssignment = (assign: Assignment) => {
    setEditingAssignment(assign);
    setAssignmentFormData({
      title: assign.title,
      description: assign.description || '',
      department: assign.department,
      course: assign.course || 'B.Tech',
      subject: assign.subject,
      semester: assign.semester || 1,
      section: assign.section || 'A',
      totalMarks: assign.totalMarks,
      dueDate: new Date(assign.dueDate).toISOString().split('T')[0],
      status: assign.status,
      attachmentFile: null,
    });
    setOpenAssignmentDialog(true);
  };

  const handleSaveAssignment = async () => {
    if (!assignmentFormData.title || !assignmentFormData.subject || !assignmentFormData.department) {
      showSnackbar('Title, Subject, and Department are required fields.', 'warning');
      return;
    }
    try {
      const payload: SaveAssignmentPayload = {
        title: assignmentFormData.title,
        description: assignmentFormData.description,
        department: assignmentFormData.department,
        course: assignmentFormData.course,
        subject: assignmentFormData.subject,
        semester: assignmentFormData.semester,
        section: assignmentFormData.section,
        facultyName: user?.name || 'Faculty Professor',
        facultyId: user?._id,
        totalMarks: Number(assignmentFormData.totalMarks),
        dueDate: assignmentFormData.dueDate,
        status: assignmentFormData.status,
        attachment: assignmentFormData.attachmentFile,
      };

      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment._id, payload);
        showSnackbar('Assignment updated successfully!');
      } else {
        await assignmentService.createAssignment(payload);
        showSnackbar('New assignment created and posted to students!');
      }

      setOpenAssignmentDialog(false);
      fetchAssignments();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error saving assignment', 'error');
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    try {
      await assignmentService.deleteAssignment(id);
      showSnackbar('Assignment deleted successfully.');
      fetchAssignments();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error deleting assignment', 'error');
    }
  };

  // STUDENT SUBMISSION HANDLERS
  const handleOpenSubmitModal = (assign: Assignment) => {
    setSelectedAssignmentToSubmit(assign);
    // Find matching student object if present
    const matchedStudent = students.find((s) => s.email === user?.email) || students[0];

    setSubmissionFormData({
      studentId: user?._id || matchedStudent?._id || 'STU-1001',
      studentName: user?.name || matchedStudent?.name || 'Student User',
      studentRollNo: user?.enrollmentNo || matchedStudent?.studentId || matchedStudent?.admissionNumber || 'ROLL-101',
      department: assign.department,
      comments: '',
      submissionFile: null,
    });
    setOpenSubmitDialog(true);
  };

  const handleExecuteSubmission = async () => {
    if (!selectedAssignmentToSubmit) return;
    if (!submissionFormData.submissionFile && !submissionFormData.comments) {
      showSnackbar('Please attach a submission file or enter notes/comments.', 'warning');
      return;
    }

    try {
      const res = await assignmentService.submitAssignment(selectedAssignmentToSubmit._id, {
        studentId: submissionFormData.studentId,
        studentName: submissionFormData.studentName,
        studentRollNo: submissionFormData.studentRollNo,
        department: submissionFormData.department,
        comments: submissionFormData.comments,
        submissionFile: submissionFormData.submissionFile,
      });

      if (res.success) {
        showSnackbar(res.message, 'success');
        setOpenSubmitDialog(false);
        fetchAssignments();
        fetchMySubmissions();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error submitting assignment', 'error');
    }
  };

  // FACULTY GRADING HANDLERS
  const handleOpenGradeModal = (sub: Submission) => {
    setSelectedSubmissionToGrade(sub);
    const assignObj =
      typeof sub.assignmentId === 'object' ? sub.assignmentId : assignments.find((a) => a._id === sub.assignmentId);
    const maxMarks = assignObj ? assignObj.totalMarks : 100;

    setGradeFormData({
      obtainedMarks: sub.obtainedMarks !== undefined ? sub.obtainedMarks : Math.round(maxMarks * 0.85),
      feedback: sub.feedback || 'Good effort. Clear analysis and methodology.',
      status: 'GRADED',
    });
    setOpenGradeDialog(true);
  };

  const handleExecuteGrading = async () => {
    if (!selectedSubmissionToGrade) return;
    try {
      const res = await assignmentService.gradeSubmission(selectedSubmissionToGrade._id, {
        obtainedMarks: Number(gradeFormData.obtainedMarks),
        feedback: gradeFormData.feedback,
        status: gradeFormData.status,
        gradedBy: user?.name || 'Faculty Examiner',
      });

      if (res.success) {
        showSnackbar('Submission graded & feedback sent to student!', 'success');
        setOpenGradeDialog(false);
        fetchSubmissionsForGrading();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error grading submission', 'error');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* HEADER BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 46, height: 46 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Assignments & Work Submissions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Faculty Uploads, Student Solution Attachments, Due Dates, Marks & Feedback Desk
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchStats();
                fetchAssignments();
                fetchSubmissionsForGrading();
                fetchMySubmissions();
              }}
            >
              Refresh
            </Button>
            {user?.role !== 'STUDENT' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateAssignment}
              >
                Create Assignment
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* KPI METRICS DASHBOARD */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Total Assignments
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
                  <AssignmentIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.totalAssignments || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active & Due Soon
                </Typography>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 36, height: 36 }}>
                  <EventIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.activeAssignments || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Open for submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Submissions to Grade
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 36, height: 36 }}>
                  <PendingActionsIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.pendingGrading || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                Awaiting faculty review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Graded & Finalized
                </Typography>
                <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 36, height: 36 }}>
                  <GradeIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.totalGraded || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                With feedback & marks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABS NAVIGATION */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AssignmentIcon />} iconPosition="start" label="Assignments Catalog" />
          <Tab icon={<UploadFileIcon />} iconPosition="start" label="Submit Assignment" />
          {user?.role !== 'STUDENT' && (
            <Tab
              icon={
                <Badge badgeContent={stats?.pendingGrading || 0} color="warning">
                  <RateReviewIcon />
                </Badge>
              }
              iconPosition="start"
              label="Grading & Feedback Desk"
            />
          )}
          <Tab icon={<GradeIcon />} iconPosition="start" label="My Submissions & Marks" />
        </Tabs>

        {/* TAB 0: FACULTY UPLOADS & ASSIGNMENTS CATALOG */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search title, subject, faculty..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Departments</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectFilter}
                    label="Subject"
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Subjects</MenuItem>
                    {subjects.map((s) => (
                      <MenuItem key={s._id} value={s.name}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateAssignment}>
                  New Upload
                </Button>
              </Grid>
            </Grid>

            {loadingAssignments ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading Assignments Catalog...
                </Typography>
              </Box>
            ) : assignments.length === 0 ? (
              <Alert severity="info">
                No assignments found. Click "Create Assignment" to upload a new assignment.
              </Alert>
            ) : (
              <Grid container spacing={2.5}>
                {assignments.map((assign) => {
                  const dueDateObj = new Date(assign.dueDate);
                  const isPastDue = dueDateObj < new Date();

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={assign._id}>
                      <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
                        <CardContent>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Chip label={assign.subject} size="small" color="primary" sx={{ fontWeight: 700, mb: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                                {assign.title}
                              </Typography>
                            </Box>
                            <Chip
                              label={assign.status}
                              size="small"
                              color={assign.status === 'PUBLISHED' ? 'success' : 'default'}
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                            {assign.description || 'Complete the assignment solution and submit before the deadline.'}
                          </Typography>

                          <Divider sx={{ my: 1.5 }} />

                          <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Faculty / Professor
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {assign.facultyName}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Department & Sem
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {assign.department} • Sem {assign.semester || 1}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Total Marks
                              </Typography>
                              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                                {assign.totalMarks} Marks
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Due Date
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: isPastDue ? 'error.main' : 'success.main',
                                }}
                              >
                                {dueDateObj.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                {isPastDue ? ' (Closed)' : ''}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Attachment Link */}
                          {assign.attachmentUrl ? (
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <AttachmentIcon color="action" fontSize="small" />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {assign.attachmentName || 'Faculty_Attachment.pdf'}
                                </Typography>
                              </Stack>
                              <Button
                                size="small"
                                component="a"
                                href={assign.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DownloadIcon fontSize="small" />}
                              >
                                Download
                              </Button>
                            </Paper>
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 2 }}>
                              No question attachment uploaded.
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              icon={<PersonIcon fontSize="small" />}
                              label={`${assign.totalSubmissions || 0} Submissions (${assign.gradedSubmissions || 0} Graded)`}
                              size="small"
                              variant="outlined"
                            />

                            <Stack direction="row" spacing={1}>
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditAssignment(assign)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteAssignment(assign._id, assign.title)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* TAB 1: STUDENT SUBMISSION DESK */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Student Submission Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select an active assignment below to upload your solution file and submit comments.
            </Typography>

            {loadingAssignments ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Assignment Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject & Dept</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Marks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Faculty File</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assign) => {
                      const dueDateObj = new Date(assign.dueDate);
                      const isPastDue = dueDateObj < new Date();

                      return (
                        <TableRow key={assign._id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {assign.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              By {assign.facultyName}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {assign.subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {assign.department}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {assign.totalMarks} Marks
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={dueDateObj.toLocaleDateString()}
                              size="small"
                              color={isPastDue ? 'error' : 'success'}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            {assign.attachmentUrl ? (
                              <Button
                                size="small"
                                component="a"
                                href={assign.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DownloadIcon fontSize="small" />}
                              >
                                Download
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<UploadFileIcon />}
                              onClick={() => handleOpenSubmitModal(assign)}
                            >
                              Submit Solution
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 2: FACULTY GRADING & FEEDBACK DESK */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Assignment</InputLabel>
                  <Select
                    value={gradingAssignmentFilter}
                    label="Select Assignment"
                    onChange={(e) => setGradingAssignmentFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Assignments</MenuItem>
                    {assignments.map((a) => (
                      <MenuItem key={a._id} value={a._id}>
                        {a.title} ({a.subject})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={gradingStatusFilter}
                    label="Status Filter"
                    onChange={(e) => setGradingStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="SUBMITTED">Submitted (Pending Review)</MenuItem>
                    <MenuItem value="LATE">Submitted Late</MenuItem>
                    <MenuItem value="GRADED">Graded</MenuItem>
                    <MenuItem value="RESUBMISSION_REQUESTED">Resubmission Requested</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {loadingSubmissions ? (
              <CircularProgress />
            ) : submissions.length === 0 ? (
              <Alert severity="info">No student submissions found for grading.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Student Name & Roll</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Submission Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Attached File</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Student Comments</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Marks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Faculty Feedback</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Grade Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {sub.studentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sub.studentRollNo} • {sub.department || 'CS'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {new Date(sub.submissionDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(sub.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {sub.fileUrl ? (
                            <Button
                              size="small"
                              component="a"
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<DownloadIcon fontSize="small" />}
                            >
                              {sub.fileName || 'View Solution'}
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No File
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block' }}>
                            {sub.comments || 'No submission note.'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {sub.obtainedMarks !== undefined ? (
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                              {sub.obtainedMarks} Marks
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not Graded
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="caption" color="text.secondary">
                            {sub.feedback || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={sub.status}
                            size="small"
                            color={
                              sub.status === 'GRADED'
                                ? 'success'
                                : sub.status === 'LATE'
                                ? 'error'
                                : sub.status === 'RESUBMISSION_REQUESTED'
                                ? 'warning'
                                : 'primary'
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<RateReviewIcon />}
                            onClick={() => handleOpenGradeModal(sub)}
                          >
                            Grade & Feedback
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 3: MY SUBMISSIONS & GRADEBOOK */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              My Submissions & Gradebook History
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track past submissions, obtain scores, view teacher feedback comments, and verify compliance.
            </Typography>

            {loadingStudentSubmissions ? (
              <CircularProgress />
            ) : studentSubmissions.length === 0 ? (
              <Alert severity="info">No submission records found for your account.</Alert>
            ) : (
              <Grid container spacing={2.5}>
                {studentSubmissions.map((sub) => {
                  const assignObj =
                    typeof sub.assignmentId === 'object'
                      ? sub.assignmentId
                      : assignments.find((a) => a._id === sub.assignmentId);

                  const maxMarks = assignObj ? assignObj.totalMarks : 100;
                  const percentage = sub.obtainedMarks !== undefined ? Math.round((sub.obtainedMarks / maxMarks) * 100) : 0;

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={sub._id}>
                      <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                        <CardContent>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {assignObj?.title || 'Assignment Solution'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {assignObj?.subject} • {sub.studentName} ({sub.studentRollNo})
                              </Typography>
                            </Box>

                            <Chip
                              label={sub.status}
                              size="small"
                              color={
                                sub.status === 'GRADED'
                                  ? 'success'
                                  : sub.status === 'LATE'
                                  ? 'error'
                                  : 'primary'
                              }
                            />
                          </Stack>

                          <Divider sx={{ my: 1.5 }} />

                          <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Submission Date
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {new Date(sub.submissionDate).toLocaleDateString()}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Score Obtained
                              </Typography>
                              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                                {sub.obtainedMarks !== undefined ? `${sub.obtainedMarks} / ${maxMarks} (${percentage}%)` : 'Pending Grade'}
                              </Typography>
                            </Grid>
                          </Grid>

                          {sub.obtainedMarks !== undefined && (
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                color={percentage >= 80 ? 'success' : percentage >= 50 ? 'primary' : 'warning'}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          )}

                          {sub.feedback && (
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'success.50', borderRadius: 2, mb: 1.5 }}>
                              <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                                Faculty Feedback:
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                "{sub.feedback}"
                              </Typography>
                            </Paper>
                          )}

                          {sub.fileUrl && (
                            <Button
                              size="small"
                              variant="outlined"
                              component="a"
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<DownloadIcon fontSize="small" />}
                            >
                              Download Submitted File ({sub.fileName || 'Solution.pdf'})
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* DIALOG 1: FACULTY CREATE/EDIT ASSIGNMENT DIALOG */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingAssignment ? 'Edit Assignment Details' : 'Faculty Upload — Create New Assignment'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Assignment Title"
                value={assignmentFormData.title}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={assignmentFormData.department}
                  label="Department"
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, department: e.target.value })}
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
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={assignmentFormData.subject}
                  label="Subject"
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, subject: e.target.value })}
                >
                  {subjects.map((s) => (
                    <MenuItem key={s._id} value={s.name}>
                      {s.name} ({s.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Semester"
                type="number"
                value={assignmentFormData.semester}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, semester: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Total Marks"
                type="number"
                value={assignmentFormData.totalMarks}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, totalMarks: Number(e.target.value) })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={assignmentFormData.dueDate}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Assignment Description & Problem Statement"
                multiline
                rows={3}
                value={assignmentFormData.description}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Attach Question File / Reference Document
              </Typography>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                {assignmentFormData.attachmentFile ? assignmentFormData.attachmentFile.name : 'Select File (PDF, DOCX, PNG)'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAssignmentFormData({ ...assignmentFormData, attachmentFile: e.target.files[0] });
                    }
                  }}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAssignment}>
            {editingAssignment ? 'Update Assignment' : 'Publish Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: STUDENT SUBMISSION DIALOG */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Submit Solution for: {selectedAssignmentToSubmit?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Subject: <strong>{selectedAssignmentToSubmit?.subject}</strong> | Total Marks: <strong>{selectedAssignmentToSubmit?.totalMarks}</strong>
            </Typography>
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
              Due Date: {selectedAssignmentToSubmit?.dueDate ? new Date(selectedAssignmentToSubmit.dueDate).toLocaleDateString() : ''}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Student Name"
                value={submissionFormData.studentName}
                onChange={(e) => setSubmissionFormData({ ...submissionFormData, studentName: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Roll / Student ID"
                value={submissionFormData.studentRollNo}
                onChange={(e) => setSubmissionFormData({ ...submissionFormData, studentRollNo: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Upload Solution File Attachment
              </Typography>
              <Button variant="outlined" component="label" fullWidth startIcon={<UploadFileIcon />}>
                {submissionFormData.submissionFile ? submissionFormData.submissionFile.name : 'Choose File (PDF, DOCX, ZIP)'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSubmissionFormData({ ...submissionFormData, submissionFile: e.target.files[0] });
                    }
                  }}
                />
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Student Submission Notes / Comments"
                multiline
                rows={3}
                value={submissionFormData.comments}
                onChange={(e) => setSubmissionFormData({ ...submissionFormData, comments: e.target.value })}
                placeholder="Enter any additional notes or answers here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" startIcon={<SendIcon />} onClick={handleExecuteSubmission}>
            Submit Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 3: FACULTY GRADING & FEEDBACK DIALOG */}
      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Grade Submission: {selectedSubmissionToGrade?.studentName}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Student Roll: <strong>{selectedSubmissionToGrade?.studentRollNo}</strong>
            </Typography>
            {selectedSubmissionToGrade?.fileUrl && (
              <Button
                size="small"
                component="a"
                href={selectedSubmissionToGrade.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<DownloadIcon fontSize="small" />}
                sx={{ mt: 1 }}
              >
                Download Submitted Solution File
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Obtained Marks"
                type="number"
                value={gradeFormData.obtainedMarks}
                onChange={(e) => setGradeFormData({ ...gradeFormData, obtainedMarks: Number(e.target.value) })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={gradeFormData.status}
                  label="Status"
                  onChange={(e) =>
                    setGradeFormData({
                      ...gradeFormData,
                      status: e.target.value as 'GRADED' | 'RESUBMISSION_REQUESTED',
                    })
                  }
                >
                  <MenuItem value="GRADED">Graded & Completed</MenuItem>
                  <MenuItem value="RESUBMISSION_REQUESTED">Request Resubmission</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Faculty Feedback & Review Comments"
                multiline
                rows={3}
                value={gradeFormData.feedback}
                onChange={(e) => setGradeFormData({ ...gradeFormData, feedback: e.target.value })}
                placeholder="Write constructive evaluation notes, areas for improvement..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" startIcon={<GradeIcon />} onClick={handleExecuteGrading}>
            Save Grade & Send Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
