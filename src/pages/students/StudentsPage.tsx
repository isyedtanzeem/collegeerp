import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
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
  TablePagination,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Badge,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CakeIcon from '@mui/icons-material/Cake';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { Student, Department, Course } from '../../types/index.js';
import { studentService } from '../../services/studentService.js';
import { departmentService } from '../../services/departmentService.js';
import { courseService } from '../../services/courseService.js';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED'];

export const StudentsPage: React.FC = () => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Reference Lists
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);

  // Dialogs & View State
  const [openRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    admissionNumber: '',
    studentId: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: 'O+' as 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-',
    department: '',
    course: '',
    semester: 1,
    section: 'A',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Father',
    address: '',
    photo: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch Dropdowns (Departments & Courses)
  const fetchDropdownData = useCallback(async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        departmentService.getDepartments(),
        courseService.getCourses(),
      ]);
      if (deptRes.success && deptRes.departments) {
        setDepartmentList(deptRes.departments);
      }
      if (courseRes.success && courseRes.courses) {
        setCourseList(courseRes.courses);
      }
    } catch (err) {
      console.error('Error fetching department/course options:', err);
    }
  }, []);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentService.getStudents({
        search,
        department: selectedDept,
        course: selectedCourse,
        semester: selectedSemester,
        section: selectedSection,
        gender: selectedGender,
        status: selectedStatus,
        page: page + 1,
        limit: rowsPerPage,
      });

      if (response.success) {
        setStudents(response.students || []);
        setTotalStudents(response.total || 0);
        setActiveCount(response.activeCount || 0);
        setMaleCount(response.maleCount || 0);
        setFemaleCount(response.femaleCount || 0);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to fetch students',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedDept,
    selectedCourse,
    selectedSemester,
    selectedSection,
    selectedGender,
    selectedStatus,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Auto Generate Identifiers
  const handleAutoGenerateIDs = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      admissionNumber: `ADM2026${randomNum}`,
      studentId: `STU2026${randomNum}`,
    }));
  };

  // Handle Register Open
  const handleOpenRegisterModal = () => {
    setEditingStudent(null);
    const defaultDept = departmentList.length > 0 ? departmentList[0].name : 'Computer Science & Engineering';
    const defaultCourse = courseList.length > 0 ? courseList[0].title : 'B.Tech Computer Science & Engineering';
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    setFormData({
      admissionNumber: `ADM2026${randomNum}`,
      studentId: `STU2026${randomNum}`,
      name: '',
      email: '',
      phone: '',
      dob: '2004-01-01',
      gender: 'MALE',
      bloodGroup: 'O+',
      department: defaultDept,
      course: defaultCourse,
      semester: 1,
      section: 'A',
      guardianName: '',
      guardianPhone: '',
      guardianRelation: 'Father',
      address: '',
      photo: '',
      status: 'ACTIVE',
    });
    setSelectedFile(null);
    setPhotoPreview('');
    setFormErrors({});
    setOpenRegisterModal(true);
  };

  // Handle Edit Open
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admissionNumber: student.admissionNumber,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob || '',
      gender: student.gender || 'MALE',
      bloodGroup: student.bloodGroup || 'O+',
      department: student.department,
      course: student.course,
      semester: student.semester || 1,
      section: student.section || 'A',
      guardianName: student.guardian?.name || '',
      guardianPhone: student.guardian?.phone || '',
      guardianRelation: student.guardian?.relation || 'Father',
      address: student.address || '',
      photo: student.photo || '',
      status: student.status || 'ACTIVE',
    });
    setSelectedFile(null);
    setPhotoPreview(student.photo || '');
    setFormErrors({});
    setOpenRegisterModal(true);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.admissionNumber.trim()) errors.admissionNumber = 'Admission Number is required';
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Valid email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.course.trim()) errors.course = 'Course is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Student (Create/Update with Multer)
  const handleSaveStudent = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('admissionNumber', formData.admissionNumber);
      fd.append('studentId', formData.studentId);
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('dob', formData.dob);
      fd.append('gender', formData.gender);
      fd.append('bloodGroup', formData.bloodGroup);
      fd.append('department', formData.department);
      fd.append('course', formData.course);
      fd.append('semester', String(formData.semester));
      fd.append('section', formData.section);
      fd.append(
        'guardian',
        JSON.stringify({
          name: formData.guardianName,
          phone: formData.guardianPhone,
          relation: formData.guardianRelation,
        })
      );
      fd.append('address', formData.address);
      fd.append('status', formData.status);

      if (selectedFile) {
        fd.append('photo', selectedFile);
      } else if (formData.photo) {
        fd.append('photo', formData.photo);
      }

      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, fd);
        setSnackbar({ open: true, message: 'Student profile updated successfully', severity: 'success' });
      } else {
        await studentService.createStudent(fd);
        setSnackbar({ open: true, message: 'New student registered successfully', severity: 'success' });
      }

      setOpenRegisterModal(false);
      fetchStudents();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error saving student record',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Student
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await studentService.deleteStudent(deletingId);
      setSnackbar({ open: true, message: 'Student deleted successfully', severity: 'success' });
      setOpenDeleteModal(false);
      setDeletingId(null);
      fetchStudents();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error deleting student',
        severity: 'error',
      });
    }
  };

  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      case 'GRADUATED':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Student Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register students, manage academic enrollments, view detailed student profiles, and update photos.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchStudents()}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenRegisterModal}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            Register Student
          </Button>
        </Stack>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
                <SchoolIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL STUDENTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalStudents}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 48, height: 48 }}>
                <CheckCircleOutlinedIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ACTIVE ENROLLED
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {activeCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
                <MaleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  MALE STUDENTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {maleCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 48, height: 48 }}>
                <FemaleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  FEMALE STUDENTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {femaleCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar & Filters Card */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Search Input */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Name, Student ID, Admission No, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* Department Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDept}
                label="Department"
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departmentList.map((d) => (
                  <MenuItem key={d._id} value={d.name}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Course Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Course"
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Courses</MenuItem>
                {courseList.map((c) => (
                  <MenuItem key={c._id} value={c.title}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Semester Filter */}
          <Grid size={{ xs: 6, sm: 2, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Sem</MenuItem>
                {SEMESTERS.map((s) => (
                  <MenuItem key={s} value={String(s)}>
                    Sem {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Section Filter */}
          <Grid size={{ xs: 6, sm: 2, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select
                value={selectedSection}
                label="Section"
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Sec</MenuItem>
                {SECTIONS.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    Sec {sec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                {STATUSES.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* View Toggle */}
          <Grid size={{ xs: 6, sm: 1, md: 0.5 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_e, val) => val && setViewMode(val)}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Table View">
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Grid View">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Main List Area */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : students.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No student records found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try clearing filters or register a new student to populate the database.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenRegisterModal}
            sx={{ borderRadius: 2 }}
          >
            Register Student
          </Button>
        </Paper>
      ) : viewMode === 'table' ? (
        /* Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student ID / Adm No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department & Course</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sem / Sec</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((st) => (
                <TableRow key={st._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        src={st.photo}
                        alt={st.name}
                        sx={{ width: 42, height: 42, border: '1px solid #e2e8f0' }}
                      >
                        {st.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {st.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {st.gender} • Blood: {st.bloodGroup || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Chip
                        label={st.studentId}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 800, fontFamily: 'monospace', mb: 0.5, display: 'inline-flex' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Adm: {st.admissionNumber}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {st.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                      {st.course}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={`Sem ${st.semester} - Sec ${st.section}`}
                      size="small"
                      sx={{ bgcolor: 'primary.50', color: 'primary.800', fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.primary" sx={{ display: 'block', fontSize: '0.82rem' }}>
                      {st.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {st.phone}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={st.status}
                      size="small"
                      color={getStatusColor(st.status) as any}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="View Profile Card">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setViewingStudent(st);
                            setOpenProfileModal(true);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Student">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(st)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Student">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeletingId(st._id);
                            setOpenDeleteModal(true);
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

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalStudents}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      ) : (
        /* Grid View Cards */
        <Box>
          <Grid container spacing={2.5}>
            {students.map((st) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={st._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                          src={st.photo}
                          alt={st.name}
                          sx={{ width: 52, height: 52, border: '2px solid #e2e8f0' }}
                        >
                          {st.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {st.name}
                          </Typography>
                          <Chip
                            label={st.studentId}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              fontSize: '0.68rem',
                              height: 20,
                              mt: 0.5,
                            }}
                          />
                        </Box>
                      </Stack>

                      <Chip
                        label={st.status}
                        size="small"
                        color={getStatusColor(st.status) as any}
                        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={1} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {st.department}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BadgeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {st.course}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={`Sem ${st.semester}`}
                          size="small"
                          sx={{ bgcolor: 'grey.100', fontWeight: 700 }}
                        />
                        <Chip
                          label={`Sec ${st.section}`}
                          size="small"
                          sx={{ bgcolor: 'grey.100', fontWeight: 700 }}
                        />
                        <Chip
                          label={`Adm: ${st.admissionNumber}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Stack>

                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        📧 {st.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        📞 {st.phone}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f1f5f9',
                      bgcolor: '#fafafa',
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        setViewingStudent(st);
                        setOpenProfileModal(true);
                      }}
                      sx={{ borderRadius: 1.5 }}
                    >
                      Profile
                    </Button>

                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(st)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeletingId(st._id);
                          setOpenDeleteModal(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Grid View Pagination */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={totalStudents}
              page={page}
              onPageChange={(_e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24, 48]}
            />
          </Box>
        </Box>
      )}

      {/* Student Registration / Edit Modal */}
      <Dialog
        open={openRegisterModal}
        onClose={() => !saving && setOpenRegisterModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingStudent ? 'Update Student Record' : 'Student Registration'}
          </Typography>
          {!editingStudent && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleAutoGenerateIDs}
              sx={{ borderRadius: 2 }}
            >
              Auto IDs
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Section 1: Photo Upload */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Student Photo Upload (Multer)
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={photoPreview}
                    alt="Student Preview"
                    sx={{ width: 80, height: 80, border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    {formData.name?.charAt(0) || 'S'}
                  </Avatar>
                </Badge>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload a high-resolution student passport photo (JPG, PNG, WEBP max 5MB).
                  </Typography>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ borderRadius: 1.5 }}
                    >
                      Choose Image
                    </Button>
                    {photoPreview && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedFile(null);
                          setPhotoPreview('');
                          setFormData({ ...formData, photo: '' });
                        }}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Section 2: Identification & Academic */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                1. Academic & Identifier Info
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Admission Number *"
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
                    error={Boolean(formErrors.admissionNumber)}
                    helperText={formErrors.admissionNumber}
                    slotProps={{ htmlInput: { style: { textTransform: 'uppercase', fontFamily: 'monospace' } } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Student ID *"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    error={Boolean(formErrors.studentId)}
                    helperText={formErrors.studentId}
                    slotProps={{ htmlInput: { style: { textTransform: 'uppercase', fontFamily: 'monospace' } } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={Boolean(formErrors.department)}>
                    <InputLabel>Department *</InputLabel>
                    <Select
                      value={formData.department}
                      label="Department *"
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      {departmentList.map((d) => (
                        <MenuItem key={d._id} value={d.name}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.department && <FormHelperText>{formErrors.department}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={Boolean(formErrors.course)}>
                    <InputLabel>Course *</InputLabel>
                    <Select
                      value={formData.course}
                      label="Course *"
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    >
                      {courseList.map((c) => (
                        <MenuItem key={c._id} value={c.title}>
                          {c.title}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.course && <FormHelperText>{formErrors.course}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Semester *</InputLabel>
                    <Select
                      value={formData.semester}
                      label="Semester *"
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    >
                      {SEMESTERS.map((s) => (
                        <MenuItem key={s} value={s}>
                          Semester {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Section *</InputLabel>
                    <Select
                      value={formData.section}
                      label="Section *"
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    >
                      {SECTIONS.map((sec) => (
                        <MenuItem key={sec} value={sec}>
                          Section {sec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      {STATUSES.map((st) => (
                        <MenuItem key={st} value={st}>
                          {st}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 3: Personal Information */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                2. Personal Details & Contact
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={Boolean(formErrors.name)}
                    helperText={formErrors.name}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={Boolean(formErrors.phone)}
                    helperText={formErrors.phone}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                      {GENDERS.map((g) => (
                        <MenuItem key={g} value={g}>
                          {g}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup}
                      label="Blood Group"
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <MenuItem key={bg} value={bg}>
                          {bg}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Residential Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 4: Guardian Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                3. Guardian Information
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    label="Guardian Name"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Guardian Phone"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Relation"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenRegisterModal(false)} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveStudent} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
            {saving ? 'Saving...' : editingStudent ? 'Update Record' : 'Register Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Profile Card Dialog */}
      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Digital Student Profile</span>
          {viewingStudent && (
            <Chip
              label={viewingStudent.status}
              color={getStatusColor(viewingStudent.status) as any}
              size="small"
              sx={{ fontWeight: 800 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {viewingStudent && (
            <Box sx={{ pt: 1 }}>
              {/* ID Header Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Avatar
                    src={viewingStudent.photo}
                    alt={viewingStudent.name}
                    sx={{ width: 80, height: 80, border: '3px solid #38bdf8', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                  >
                    {viewingStudent.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                      {viewingStudent.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>
                      {viewingStudent.course}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={viewingStudent.studentId}
                        size="small"
                        sx={{ bgcolor: '#0284c7', color: 'white', fontWeight: 800, fontFamily: 'monospace' }}
                      />
                      <Chip
                        label={`Adm: ${viewingStudent.admissionNumber}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Grid Details */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      ACADEMIC ENROLLMENT
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          <strong>Dept:</strong> {viewingStudent.department}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BadgeIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          <strong>Sem / Sec:</strong> Sem {viewingStudent.semester} (Sec {viewingStudent.section})
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      PERSONAL ATTRIBUTES
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CakeIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          <strong>DOB:</strong> {viewingStudent.dob || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BloodtypeIcon fontSize="small" color="error" />
                        <Typography variant="body2">
                          <strong>Gender / Blood:</strong> {viewingStudent.gender} ({viewingStudent.bloodGroup || 'N/A'})
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                      CONTACT & GUARDIAN DETAILS
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{viewingStudent.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{viewingStudent.phone}</Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ContactPhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Guardian:</strong> {viewingStudent.guardian?.name || 'N/A'} (
                            {viewingStudent.guardian?.relation || 'Parent'})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HomeIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>
                            {viewingStudent.address || 'No address logged'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenProfileModal(false)} variant="contained" sx={{ borderRadius: 2 }}>
            Close Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Student Record?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete this student record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDeleteModal(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ borderRadius: 2 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Snackbar */}
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
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
