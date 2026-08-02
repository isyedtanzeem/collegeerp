import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Button,
  Chip,
  Avatar,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext.js';
import { courseService } from '../../services/courseService.js';
import { departmentService } from '../../services/departmentService.js';
import { Course, Department } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

interface CourseFormData {
  title: string;
  code: string;
  duration: string;
  credits: number;
  department: string;
  semester: number;
  eligibility: string;
  description: string;
  facultyName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const initialFormState: CourseFormData = {
  title: '',
  code: '',
  duration: '4 Years',
  credits: 4,
  department: 'Computer Science',
  semester: 1,
  eligibility: '10+2 with Physics, Chemistry, Math minimum 50% aggregate',
  description: '',
  facultyName: 'TBD',
  status: 'ACTIVE',
};

const defaultDepartments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

export const CoursesPage: React.FC = () => {
  const { user, token } = useAuth();
  const isManagement = ['SUPER_ADMIN', 'PRINCIPAL', 'HOD'].includes(user?.role || '');

  // Data & Pagination State
  const [courses, setCourses] = useState<Course[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>(defaultDepartments);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);

  // Search & Filters
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination Controls
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal Dialog States
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ title?: string; code?: string; department?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Prompt State
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Snackbar Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch Department options for dropdown
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await departmentService.getDepartments();
        if (res.departments && res.departments.length > 0) {
          const names = Array.from(new Set(res.departments.map((d: Department) => d.name)));
          setDepartmentsList(names);
        }
      } catch (err) {
        console.error('[CoursesPage] Failed to fetch departments list:', err);
      }
    };
    if (token) loadDepartments();
  }, [token]);

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await courseService.getCourses({
        search: search.trim() || undefined,
        department: deptFilter !== 'ALL' ? deptFilter : undefined,
        semester: semesterFilter !== 'ALL' ? Number(semesterFilter) : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page: page + 1,
        limit: rowsPerPage,
      });

      setCourses(res.courses || []);
      setTotalCount(res.total || 0);
      setActiveCount(res.activeCount || 0);
    } catch (err: any) {
      console.error('[CoursesPage] Error fetching courses:', err);
      showSnackbar(err.response?.data?.message || 'Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, search, deptFilter, semesterFilter, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open Dialog for Create
  const handleOpenCreate = () => {
    setSelectedCourse(null);
    setFormData({
      ...initialFormState,
      department: departmentsList[0] || 'Computer Science',
    });
    setFormErrors({});
    setOpenFormDialog(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      code: course.code,
      duration: course.duration || '4 Years',
      credits: course.credits || 4,
      department: course.department || departmentsList[0] || 'Computer Science',
      semester: course.semester || 1,
      eligibility: course.eligibility || '10+2 with 50% minimum aggregate',
      description: course.description || '',
      facultyName: course.facultyName || 'TBD',
      status: course.status || 'ACTIVE',
    });
    setFormErrors({});
    setOpenFormDialog(true);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: { title?: string; code?: string; department?: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Course Name is required';
    }
    if (!formData.code.trim()) {
      errors.code = 'Course Code is required';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department selection is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Create / Edit)
  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse._id, formData);
        showSnackbar('Course updated successfully!', 'success');
      } else {
        await courseService.createCourse(formData);
        showSnackbar('Course created successfully!', 'success');
      }
      setOpenFormDialog(false);
      fetchCourses();
    } catch (err: any) {
      console.error('[CoursesPage] Submit Error:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (course: Course) => {
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(courseToDelete._id);
      showSnackbar(`Course '${courseToDelete.title}' deleted successfully!`, 'success');
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err: any) {
      console.error('[CoursesPage] Delete Error:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete course', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalCreditsOffered = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const uniqueDepartmentsCount = Array.from(new Set(courses.map((c) => c.department))).length;

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Academic Course Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage course curriculum, degree duration, credit structures, eligibility criteria, and department mapping
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh Catalog">
            <IconButton onClick={fetchCourses} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {isManagement && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}
            >
              Add Course
            </Button>
          )}
        </Stack>
      </Box>

      {/* Top Overview Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
              <BookIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Total Courses
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {totalCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 48, height: 48 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Active Courses
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                {activeCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Departments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {uniqueDepartmentsCount || departmentsList.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Page Credits Sum
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {totalCreditsOffered}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar Controls: Search & Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search course name, code, faculty, eligibility..."
              value={search}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="dept-filter-label">Department</InputLabel>
              <Select
                labelId="dept-filter-label"
                label="Department"
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departmentsList.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sem-filter-label">Semester</InputLabel>
              <Select
                labelId="sem-filter-label"
                label="Semester"
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Semesters</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <MenuItem key={s} value={s.toString()}>
                    Semester {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="course-status-filter-label">Status</InputLabel>
              <Select
                labelId="course-status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Grid View">
                  <GridViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Table View">
                  <TableRowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading course catalog..." />
      ) : courses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <BookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Courses Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search || deptFilter !== 'ALL' || semesterFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try resetting your search or filter parameters.'
              : 'Click "Add Course" to register the first course.'}
          </Typography>
          {(search || deptFilter !== 'ALL' || semesterFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setDeptFilter('ALL');
                setSemesterFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Paper>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={course._id}>
              <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {/* Top Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Chip label={course.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                      <Chip
                        label={course.status || 'ACTIVE'}
                        color={course.status === 'INACTIVE' ? 'default' : 'success'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                    <Chip label={`Sem ${course.semester}`} size="small" variant="filled" color="secondary" sx={{ fontWeight: 700 }} />
                  </Box>

                  {/* Course Title */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, minHeight: 56, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'Comprehensive curriculum covering key theoretical and practical modules.'}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Key Fields Grid */}
                  <Stack spacing={1.2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Department: <strong style={{ color: '#1E293B' }}>{course.department}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Duration: <strong style={{ color: '#1E293B' }}>{course.duration || '4 Years'}</strong> ({course.credits} Credits)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUserIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Eligibility: <strong style={{ color: '#1E293B' }}>{course.eligibility || '10+2 with 50%'}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Faculty: <strong style={{ color: '#1E293B' }}>{course.facultyName || 'TBD'}</strong>
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                {/* Actions */}
                {isManagement && (
                  <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(course)}
                      sx={{ fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDelete(course)}
                      sx={{ fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* TABLE VIEW */
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Course Name & Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Eligibility</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                {isManagement && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id} hover>
                  <TableCell>
                    <Chip label={course.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Duration: {course.duration || '4 Years'} | Faculty: {course.facultyName || 'TBD'}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Sem {course.semester}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${course.credits} Credits`} size="small" color="info" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 180 }}>
                      {course.eligibility || '10+2 with 50%'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.status || 'ACTIVE'}
                      color={course.status === 'INACTIVE' ? 'default' : 'success'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  {isManagement && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(course)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(course)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      {/* Add / Edit Course Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => !isSubmitting && setOpenFormDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedCourse ? 'Edit Course' : 'Add New Academic Course'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Course Name"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={!!formErrors.title}
                  helperText={formErrors.title || 'e.g. Bachelor of Technology in Computer Science'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Course Code"
                  required
                  placeholder="CS101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={!!formErrors.code}
                  helperText={formErrors.code || 'Unique code (e.g. CS101, MBA202)'}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.department}>
                  <InputLabel id="course-dept-label">Department</InputLabel>
                  <Select
                    labelId="course-dept-label"
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {departmentsList.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Duration"
                  placeholder="4 Years / 8 Semesters"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Credits"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="course-sem-label">Semester</InputLabel>
                  <Select
                    labelId="course-sem-label"
                    label="Semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <MenuItem key={s} value={s}>
                        Semester {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Teaching Faculty"
                  placeholder="Prof. Alan Turing"
                  value={formData.facultyName}
                  onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="course-status-dialog-label">Status</InputLabel>
                  <Select
                    labelId="course-status-dialog-label"
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Eligibility Criteria"
              placeholder="e.g. 10+2 with Physics, Chemistry, Math minimum 50% aggregate"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description & Syllabus Summary"
              placeholder="Enter details on key subject topics, lab requirements, and academic goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenFormDialog(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitForm} disabled={isSubmitting} sx={{ fontWeight: 700 }}>
            {isSubmitting ? 'Saving...' : selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !isDeleting && setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Delete Course
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete course <strong>{courseToDelete?.title}</strong> ({courseToDelete?.code})?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This action will remove the course curriculum record permanently.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} sx={{ fontWeight: 700 }}>
            {isDeleting ? 'Deleting...' : 'Delete Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
