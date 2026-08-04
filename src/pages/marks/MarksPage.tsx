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

import GradeIcon from '@mui/icons-material/Grade';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import PrintIcon from '@mui/icons-material/Print';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedIcon from '@mui/icons-material/Verified';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import { useAuth } from '../../context/AuthContext.js';
import { ExamMark, Student, Exam } from '../../types/index.js';
import { marksService, SaveMarkPayload } from '../../services/marksService.js';
import { studentService } from '../../services/studentService.js';
import { examService } from '../../services/examService.js';
import { subjectService } from '../../services/subjectService.js';
import { departmentService } from '../../services/departmentService.js';

export const MarksPage: React.FC = () => {
  const { user } = useAuth();

  // Navigation Tabs: 0 -> Gradebook CRUD, 1 -> Grade Calculator, 2 -> Result Generator, 3 -> Student Result Page, 4 -> Academic Transcript
  const [activeTab, setActiveTab] = useState<number>(user?.role === 'STUDENT' ? 3 : 0);

  // Metadata dropdown lists
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // TAB 0: MARKS & GRADEBOOK CRUD STATE
  // ---------------------------------------------------------------------------
  const [marksList, setMarksList] = useState<ExamMark[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);

  // Filters
  const [filterStudent, setFilterStudent] = useState<string>('ALL');
  const [filterExam, setFilterExam] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mark Create / Edit Dialog
  const [openMarkModal, setOpenMarkModal] = useState<boolean>(false);
  const [selectedMark, setSelectedMark] = useState<ExamMark | null>(null);
  const [markForm, setMarkForm] = useState<SaveMarkPayload>({
    studentId: '',
    examId: '',
    subject: '',
    marksObtained: 75,
    totalMarks: 100,
    remarks: 'Good performance',
    evaluatedBy: user?.name || 'Faculty Evaluator',
  });
  const [savingMark, setSavingMark] = useState<boolean>(false);

  // Delete Mark Dialog
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [markToDelete, setMarkToDelete] = useState<ExamMark | null>(null);
  const [deletingMark, setDeletingMark] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 1: GRADE CALCULATION TOOL STATE
  // ---------------------------------------------------------------------------
  const [calcInputMarks, setCalcInputMarks] = useState<number>(85);
  const [calcTotalMarks, setCalcTotalMarks] = useState<number>(100);

  // ---------------------------------------------------------------------------
  // TAB 2: BATCH RESULT GENERATION STATE
  // ---------------------------------------------------------------------------
  const [genDept, setGenDept] = useState<string>('ALL');
  const [genExamId, setGenExamId] = useState<string>('ALL');
  const [generatingResults, setGeneratingResults] = useState<boolean>(false);
  const [generationSummary, setGenerationSummary] = useState<any[] | null>(null);

  // ---------------------------------------------------------------------------
  // TAB 3: STUDENT RESULT PAGE LOOKUP STATE
  // ---------------------------------------------------------------------------
  const [lookupStudentId, setLookupStudentId] = useState<string>('');
  const [studentResultData, setStudentResultData] = useState<any>(null);
  const [loadingStudentResult, setLoadingStudentResult] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 4: OFFICIAL ACADEMIC TRANSCRIPT STATE
  // ---------------------------------------------------------------------------
  const [transcriptStudentId, setTranscriptStudentId] = useState<string>('');
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);

  // Toast Notification
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load Metadata
  const fetchMetadata = useCallback(async () => {
    try {
      const [stdRes, examRes, subjRes, deptRes] = await Promise.all([
        studentService.getStudents({ limit: 200 }),
        examService.getExams(),
        subjectService.getSubjects({ limit: 100 }),
        departmentService.getDepartments(),
      ]);

      if (stdRes.success && stdRes.students.length > 0) {
        setStudents(stdRes.students);
        const defaultId = (user?.role === 'STUDENT' && user?._id) ? user._id : stdRes.students[0]._id;
        setLookupStudentId(defaultId);
        setTranscriptStudentId(defaultId);
      }
      if (examRes.success && examRes.exams.length > 0) setExams(examRes.exams);
      if (subjRes.success) setSubjects(subjRes.subjects || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error('Error loading metadata for Marks module:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Fetch Marks list (Tab 0)
  const fetchMarksList = useCallback(async () => {
    setLoadingMarks(true);
    try {
      const res = await marksService.getMarks({
        studentId: filterStudent,
        examId: filterExam,
        subject: filterSubject,
        grade: filterGrade,
        search: searchQuery,
      });

      if (res.success) {
        setMarksList(res.marks || []);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching marks', severity: 'error' });
    } finally {
      setLoadingMarks(false);
    }
  }, [filterStudent, filterExam, filterSubject, filterGrade, searchQuery]);

  useEffect(() => {
    if (activeTab === 0) {
      fetchMarksList();
    }
  }, [activeTab, fetchMarksList]);

  // Save / Update Mark Record
  const handleSaveMark = async () => {
    if (!markForm.studentId || !markForm.examId || !markForm.subject) {
      setSnackbar({ open: true, message: 'Student, Exam, and Subject are required.', severity: 'error' });
      return;
    }
    setSavingMark(true);
    try {
      if (selectedMark && selectedMark._id) {
        await marksService.updateMark(selectedMark._id, markForm);
        setSnackbar({ open: true, message: 'Mark record updated successfully!', severity: 'success' });
      } else {
        await marksService.createMark(markForm);
        setSnackbar({ open: true, message: 'Mark record created successfully!', severity: 'success' });
      }
      setOpenMarkModal(false);
      fetchMarksList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save mark record', severity: 'error' });
    } finally {
      setSavingMark(false);
    }
  };

  // Open Create Dialog
  const handleOpenCreateMark = () => {
    setSelectedMark(null);
    const defaultStudent = students[0]?._id || '';
    const defaultExam = exams[0]?._id || '';
    const defaultSubject = subjects[0]?.name || 'Data Structures & Algorithms';

    setMarkForm({
      studentId: defaultStudent,
      examId: defaultExam,
      subject: defaultSubject,
      marksObtained: 75,
      totalMarks: 100,
      remarks: 'Satisfactory performance',
      evaluatedBy: user?.name || 'Faculty Evaluator',
    });
    setOpenMarkModal(true);
  };

  // Open Edit Dialog
  const handleOpenEditMark = (mark: ExamMark) => {
    setSelectedMark(mark);
    setMarkForm({
      studentId: mark.studentId,
      examId: mark.examId,
      subject: mark.subject,
      marksObtained: mark.marksObtained,
      totalMarks: mark.totalMarks,
      remarks: mark.remarks || '',
      evaluatedBy: mark.evaluatedBy || 'Faculty Evaluator',
    });
    setOpenMarkModal(true);
  };

  // Confirm Delete Mark
  const handleDeleteMark = async () => {
    if (!markToDelete || !markToDelete._id) return;
    setDeletingMark(true);
    try {
      await marksService.deleteMark(markToDelete._id);
      setSnackbar({ open: true, message: 'Mark record deleted successfully!', severity: 'success' });
      setOpenDeleteModal(false);
      fetchMarksList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error deleting mark record', severity: 'error' });
    } finally {
      setDeletingMark(false);
    }
  };

  // Run Batch Result Generation (Tab 2)
  const handleGenerateBatchResults = async () => {
    setGeneratingResults(true);
    try {
      const payload: any = {};
      if (genDept !== 'ALL') payload.department = genDept;
      if (genExamId !== 'ALL') payload.examId = genExamId;

      const res = await marksService.generateResults(payload);
      if (res.success) {
        setGenerationSummary(res.resultsSummary || []);
        setSnackbar({ open: true, message: res.message || 'Results published successfully!', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error generating batch results', severity: 'error' });
    } finally {
      setGeneratingResults(false);
    }
  };

  // Fetch Student Result View (Tab 3)
  const fetchStudentResultLookup = useCallback(async (stdId: string) => {
    if (!stdId) return;
    setLoadingStudentResult(true);
    try {
      const res = await marksService.getStudentResult(stdId);
      if (res.success) {
        setStudentResultData(res);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error loading student result', severity: 'error' });
    } finally {
      setLoadingStudentResult(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3 && lookupStudentId) {
      fetchStudentResultLookup(lookupStudentId);
    }
  }, [activeTab, lookupStudentId, fetchStudentResultLookup]);

  // Fetch Academic Transcript (Tab 4)
  const fetchAcademicTranscript = useCallback(async (stdId: string) => {
    if (!stdId) return;
    setLoadingTranscript(true);
    try {
      const res = await marksService.getAcademicTranscript(stdId);
      if (res.success) {
        setTranscriptData(res);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error generating academic transcript', severity: 'error' });
    } finally {
      setLoadingTranscript(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 4 && transcriptStudentId) {
      fetchAcademicTranscript(transcriptStudentId);
    }
  }, [activeTab, transcriptStudentId, fetchAcademicTranscript]);

  // Grade Chip Badge
  const getGradeChip = (grade: string) => {
    switch (grade) {
      case 'A+':
        return <Chip label="A+ (10.0)" size="small" color="success" sx={{ fontWeight: 800 }} />;
      case 'A':
        return <Chip label="A (9.0)" size="small" color="primary" sx={{ fontWeight: 800 }} />;
      case 'B+':
        return <Chip label="B+ (8.0)" size="small" color="info" sx={{ fontWeight: 800 }} />;
      case 'B':
        return <Chip label="B (7.0)" size="small" color="secondary" sx={{ fontWeight: 800 }} />;
      case 'C':
        return <Chip label="C (6.0)" size="small" color="warning" sx={{ fontWeight: 800 }} />;
      case 'D':
        return <Chip label="D (5.0)" size="small" color="warning" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label="F (0.0)" size="small" color="error" sx={{ fontWeight: 800 }} />;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Student Marks & Gradebook Module
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage subject marks, automatic grade calculation (CGPA/SGPA), batch result publication, student gradebooks, and official transcripts.
        </Typography>
      </Box>

      {/* Tabs Bar */}
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
          {user?.role !== 'STUDENT' && (
            <Tab icon={<GradeIcon />} iconPosition="start" label="Marks Gradebook" sx={{ fontWeight: 700, py: 2 }} />
          )}
          {user?.role !== 'STUDENT' && (
            <Tab icon={<CalculateIcon />} iconPosition="start" label="Grade Calculator" sx={{ fontWeight: 700, py: 2 }} />
          )}
          {user?.role !== 'STUDENT' && (
            <Tab icon={<AutoModeIcon />} iconPosition="start" label="Batch Result Generator" sx={{ fontWeight: 700, py: 2 }} />
          )}
          <Tab icon={<SchoolIcon />} iconPosition="start" label="My Semester Results" sx={{ fontWeight: 700, py: 2 }} />
          <Tab icon={<WorkspacePremiumIcon />} iconPosition="start" label="Official Academic Transcript" sx={{ fontWeight: 700, py: 2 }} />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: MARKS GRADEBOOK & CRUD */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Filters Bar */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search student, roll no, subject..."
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
                  <InputLabel>Filter Student</InputLabel>
                  <Select value={filterStudent} label="Filter Student" onChange={(e) => setFilterStudent(e.target.value)}>
                    <MenuItem value="ALL">All Students</MenuItem>
                    {students.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name} ({s.studentId || s.admissionNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Exam</InputLabel>
                  <Select value={filterExam} label="Filter Exam" onChange={(e) => setFilterExam(e.target.value)}>
                    <MenuItem value="ALL">All Exams</MenuItem>
                    {exams.map((ex) => (
                      <MenuItem key={ex._id} value={ex._id}>
                        {ex.title} ({ex.subject})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Grade</InputLabel>
                  <Select value={filterGrade} label="Grade" onChange={(e) => setFilterGrade(e.target.value)}>
                    <MenuItem value="ALL">All Grades</MenuItem>
                    <MenuItem value="A+">A+ (Outstanding)</MenuItem>
                    <MenuItem value="A">A (Excellent)</MenuItem>
                    <MenuItem value="B+">B+ (Very Good)</MenuItem>
                    <MenuItem value="B">B (Good)</MenuItem>
                    <MenuItem value="C">C (Average)</MenuItem>
                    <MenuItem value="D">D (Pass)</MenuItem>
                    <MenuItem value="F">F (Fail)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMarksList}>
                  Refresh
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateMark} sx={{ fontWeight: 800 }}>
                  Add Mark Record
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Table of Marks */}
          {loadingMarks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : marksList.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <GradeIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No mark records found.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateMark} sx={{ mt: 2 }}>
                Add First Mark Record
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Student Info</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Subject Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Marks Obtained</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Percentage %</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Grade (GPA)</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Evaluated By</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {marksList.map((m) => (
                      <TableRow key={m._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {m.studentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {m.studentRollNo}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {m.subject}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {m.marksObtained} / {m.totalMarks}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {m.percentage}%
                          </Typography>
                        </TableCell>

                        <TableCell>{getGradeChip(m.grade)}</TableCell>

                        <TableCell>
                          {m.isPassed ? (
                            <Chip label="PASSED" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                          ) : (
                            <Chip label="FAILED" size="small" color="error" icon={<CancelIcon fontSize="small" />} sx={{ fontWeight: 800 }} />
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {m.evaluatedBy || 'Faculty'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit Record">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditMark(m)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Record">
                              <IconButton size="small" color="error" onClick={() => { setMarkToDelete(m); setOpenDeleteModal(true); }}>
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
      {/* TAB 1: GRADE CALCULATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            {/* Real-time Interactive Calculator */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalculateIcon color="primary" /> Interactive Grade Calculator
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                    Test marks and observe grade points, performance classifications, and pass/fail thresholds.
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Marks Obtained"
                        type="number"
                        fullWidth
                        value={calcInputMarks}
                        onChange={(e) => setCalcInputMarks(Number(e.target.value))}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Total Max Marks"
                        type="number"
                        fullWidth
                        value={calcTotalMarks}
                        onChange={(e) => setCalcTotalMarks(Number(e.target.value))}
                      />
                    </Grid>
                  </Grid>

                  {/* Results Box */}
                  {(() => {
                    const pct = calcTotalMarks > 0 ? Math.round((calcInputMarks / calcTotalMarks) * 100) : 0;
                    let gr = 'F';
                    let gp = 0.0;
                    let statusText = 'Fail';
                    let isP = false;

                    if (pct >= 90) { gr = 'A+'; gp = 10.0; statusText = 'Outstanding'; isP = true; }
                    else if (pct >= 80) { gr = 'A'; gp = 9.0; statusText = 'Excellent'; isP = true; }
                    else if (pct >= 70) { gr = 'B+'; gp = 8.0; statusText = 'Very Good'; isP = true; }
                    else if (pct >= 60) { gr = 'B'; gp = 7.0; statusText = 'Good'; isP = true; }
                    else if (pct >= 50) { gr = 'C'; gp = 6.0; statusText = 'Average'; isP = true; }
                    else if (pct >= 40) { gr = 'D'; gp = 5.0; statusText = 'Satisfactory'; isP = true; }

                    return (
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: isP ? 'success.50' : 'error.50', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">CALCULATED PERCENTAGE</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', my: 0.5 }}>
                          {pct}%
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">GRADE & POINT</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {gr} ({gp.toFixed(1)})
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">PERFORMANCE</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: isP ? 'success.main' : 'error.main' }}>
                              {statusText}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>

            {/* University 10.0 Grade Scale Legend */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Standard University 10.0 Grading Scale Rules
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Official GPA / CGPA grade point conversion matrix according to university guidelines.
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Percentage Range</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Letter Grade</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Grade Point (10.0 Scale)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Performance</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Result Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>90% - 100%</TableCell>
                        <TableCell><Chip label="A+" color="success" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>10.0</TableCell>
                        <TableCell>Outstanding</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>80% - 89%</TableCell>
                        <TableCell><Chip label="A" color="primary" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>9.0</TableCell>
                        <TableCell>Excellent</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>70% - 79%</TableCell>
                        <TableCell><Chip label="B+" color="info" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>8.0</TableCell>
                        <TableCell>Very Good</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>60% - 69%</TableCell>
                        <TableCell><Chip label="B" color="secondary" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>7.0</TableCell>
                        <TableCell>Good</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>50% - 59%</TableCell>
                        <TableCell><Chip label="C" color="warning" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>6.0</TableCell>
                        <TableCell>Average</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>40% - 49%</TableCell>
                        <TableCell><Chip label="D" color="warning" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>5.0</TableCell>
                        <TableCell>Satisfactory</TableCell>
                        <TableCell><Chip label="PASS" color="success" size="small" /></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 700 }}>Below 40%</TableCell>
                        <TableCell><Chip label="F" color="error" size="small" sx={{ fontWeight: 800 }} /></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>0.0</TableCell>
                        <TableCell>Fail</TableCell>
                        <TableCell><Chip label="FAIL / ATKT" color="error" size="small" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BATCH RESULT GENERATION TOOL */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Batch Exam Result Publication & CGPA Processing Engine
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Select an exam or department to trigger automatic CGPA calculation, result generation, and publication.
            </Typography>

            <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Exam to Publish Results</InputLabel>
                  <Select value={genExamId} label="Select Exam to Publish Results" onChange={(e) => setGenExamId(e.target.value)}>
                    <MenuItem value="ALL">All Completed Exams</MenuItem>
                    {exams.map((e) => (
                      <MenuItem key={e._id} value={e._id}>
                        {e.title} — {e.subject} ({e.department})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Department</InputLabel>
                  <Select value={genDept} label="Filter Department" onChange={(e) => setGenDept(e.target.value)}>
                    <MenuItem value="ALL">All Departments</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<AutoModeIcon />}
                  onClick={handleGenerateBatchResults}
                  disabled={generatingResults}
                  sx={{ py: 1.2, fontWeight: 800, borderRadius: 2.5 }}
                >
                  {generatingResults ? 'Processing...' : 'Publish Batch Results'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Generated Results Summary Roster */}
          {generationSummary && (
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" /> Generated Results Batch Roster ({generationSummary.length} Students)
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Roll No</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Passed / Total</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Total Marks</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Percentage %</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Computed CGPA</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generationSummary.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{item.studentRollNo}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{item.studentName}</TableCell>
                        <TableCell>{item.passedSubjects} / {item.totalSubjects} Passed</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{item.totalObtained} / {item.totalMax}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{item.overallPercentage}%</TableCell>
                        <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>{item.cgpa} / 10.0</TableCell>
                        <TableCell>{getGradeChip(item.overallGrade)}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === 'PASSED' ? 'success' : 'error'}
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
      {/* TAB 3: STUDENT RESULT PAGE */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Box>
          {user?.role !== 'STUDENT' && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Student Result Sheet</InputLabel>
                    <Select value={lookupStudentId} label="Select Student Result Sheet" onChange={(e) => setLookupStudentId(e.target.value)}>
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
                    Print Result Card
                  </Button>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchStudentResultLookup(lookupStudentId)}>
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {loadingStudentResult ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !studentResultData ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Select a student to view their result scorecard.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* Student Header Summary Card */}
              <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 2, md: 1 }} sx={{ textAlign: 'center' }}>
                      <Avatar src={studentResultData.student.photo} sx={{ width: 64, height: 64, mx: 'auto' }}>
                        {studentResultData.student.name.charAt(0)}
                      </Avatar>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {studentResultData.student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        Roll No: {studentResultData.student.rollNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {studentResultData.student.department} • {studentResultData.student.course} (Sem {studentResultData.student.semester})
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2, md: 3 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">CUMULATIVE CGPA</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        {studentResultData.resultSummary.cgpa} / 10.0
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2, md: 3 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">OVERALL RESULT</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={studentResultData.resultSummary.resultStatus}
                          color={studentResultData.resultSummary.resultStatus === 'PASSED' ? 'success' : 'error'}
                          sx={{ fontWeight: 900, px: 2, py: 2.5, borderRadius: 2 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Subject Marks Table */}
              <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Subject Name</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Marks Obtained</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Percentage %</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Grade Point</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Performance</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentResultData.marks.map((m: any, idx: number) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{m.subject}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>{m.marksObtained} / {m.totalMarks}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>{m.percentage}%</TableCell>
                          <TableCell>{getGradeChip(m.grade)}</TableCell>
                          <TableCell>{m.performance}</TableCell>
                          <TableCell>
                            {m.isPassed ? (
                              <Chip label="PASS" size="small" color="success" sx={{ fontWeight: 800 }} />
                            ) : (
                              <Chip label="FAIL" size="small" color="error" sx={{ fontWeight: 800 }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {m.remarks || '-'}
                            </Typography>
                          </TableCell>
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
      {/* TAB 4: OFFICIAL ACADEMIC TRANSCRIPT */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <Box>
          {user?.role !== 'STUDENT' && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Student for Official Transcript</InputLabel>
                    <Select value={transcriptStudentId} label="Select Student for Official Transcript" onChange={(e) => setTranscriptStudentId(e.target.value)}>
                      {students.map((std) => (
                        <MenuItem key={std._id} value={std._id}>
                          {std.name} ({std.studentId || std.admissionNumber}) — {std.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ fontWeight: 800 }}>
                    Print Official Transcript
                  </Button>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchAcademicTranscript(transcriptStudentId)}>
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {loadingTranscript ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !transcriptData ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <WorkspacePremiumIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Select a student above to generate official transcript.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 5, borderRadius: 3, border: '2px solid #cbd5e1', bgcolor: '#ffffff', maxWidth: 900, mx: 'auto', position: 'relative' }}>
              {/* Header Letterhead */}
              <Box sx={{ textAlign: 'center', pb: 3, mb: 3, borderBottom: '2px double #94a3b8' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1 }}>
                    {transcriptData.transcriptHeader.institution}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {transcriptData.transcriptHeader.affiliation} • {transcriptData.transcriptHeader.accreditation}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, textDecoration: 'underline' }}>
                  OFFICIAL ACADEMIC TRANSCRIPT & GRADE SHEET
                </Typography>
              </Box>

              {/* Student Details Grid */}
              <Grid container spacing={2} sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">STUDENT NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>{transcriptData.student.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">ROLL / ENROLLMENT NO</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{transcriptData.student.rollNo}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">DEPARTMENT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>{transcriptData.student.department}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">COURSE & SEMESTER</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>{transcriptData.student.course} (Sem {transcriptData.student.semester})</Typography>
                </Grid>
              </Grid>

              {/* Subjects Roster */}
              <TableContainer sx={{ mb: 4 }}>
                <Table size="small" sx={{ border: '1px solid #cbd5e1' }}>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Subject Code & Title</TableCell>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Credits</TableCell>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Marks Obtained</TableCell>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Grade Point</TableCell>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Letter Grade</TableCell>
                      <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #94a3b8' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transcriptData.subjects.map((sub: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 700 }}>{sub.subject}</TableCell>
                        <TableCell>{sub.credits}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{sub.marksObtained} / {sub.totalMarks}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{sub.gradePoint.toFixed(1)}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{sub.grade}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: sub.status === 'PASS' ? 'success.main' : 'error.main' }}>
                          {sub.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Metrics */}
              <Paper sx={{ p: 2.5, mb: 4, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid #93c5fd' }}>
                <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">EARNED CREDITS</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{transcriptData.transcriptSummary.totalEarnedCredits} Credits</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">CUMULATIVE PERCENTAGE</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{transcriptData.transcriptSummary.cumulativePercentage}%</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">CGPA SCORE</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>{transcriptData.transcriptSummary.cgpa} / 10.0</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">DIVISION AWARDED</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>{transcriptData.transcriptSummary.division}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Seal & Verification Footer */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 3, borderTop: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode2Icon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      TRANSCRIPT NO: {transcriptData.transcriptHeader.transcriptNo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                      HASH: {transcriptData.transcriptHeader.verificationHash}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Issued Date: {transcriptData.transcriptHeader.issueDate}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ height: 40, borderBottom: '1px solid #000', mb: 0.5, width: 160 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    CONTROLLER OF EXAMINATIONS
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Mark Create / Edit Dialog */}
      <Dialog open={openMarkModal} onClose={() => !savingMark && setOpenMarkModal(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{selectedMark ? 'Edit Student Mark Record' : 'Add Student Mark Record'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={markForm.studentId}
                  label="Select Student"
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, studentId: e.target.value }))}
                >
                  {students.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name} ({s.studentId || s.admissionNumber}) — {s.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Exam</InputLabel>
                <Select
                  value={markForm.examId}
                  label="Select Exam"
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, examId: e.target.value }))}
                >
                  {exams.map((ex) => (
                    <MenuItem key={ex._id} value={ex._id}>
                      {ex.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject Name</InputLabel>
                <Select
                  value={markForm.subject}
                  label="Subject Name"
                  onChange={(e) => setMarkForm((prev) => ({ ...prev, subject: e.target.value }))}
                >
                  {subjects.map((sub: any) => (
                    <MenuItem key={sub._id || sub.name} value={sub.name}>
                      {sub.name} ({sub.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Marks Obtained"
                type="number"
                size="small"
                fullWidth
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm((prev) => ({ ...prev, marksObtained: Number(e.target.value) }))}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Total Max Marks"
                type="number"
                size="small"
                fullWidth
                value={markForm.totalMarks}
                onChange={(e) => setMarkForm((prev) => ({ ...prev, totalMarks: Number(e.target.value) }))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Remarks"
                size="small"
                fullWidth
                placeholder="e.g. Excellent conceptual clarity"
                value={markForm.remarks}
                onChange={(e) => setMarkForm((prev) => ({ ...prev, remarks: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenMarkModal(false)} disabled={savingMark}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveMark} disabled={savingMark} sx={{ fontWeight: 800 }}>
            {savingMark ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Mark Dialog */}
      <Dialog open={openDeleteModal} onClose={() => !deletingMark && setOpenDeleteModal(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delete Mark Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the mark record for <strong>{markToDelete?.studentName}</strong> ({markToDelete?.subject})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteModal(false)} disabled={deletingMark}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteMark} disabled={deletingMark} sx={{ fontWeight: 800 }}>
            {deletingMark ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
