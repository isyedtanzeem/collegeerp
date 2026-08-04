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
  Autocomplete,
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
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

import { Faculty, Department, Subject } from '../../types/index.js';
import { facultyService } from '../../services/facultyService.js';
import { departmentService } from '../../services/departmentService.js';
import { subjectService } from '../../services/subjectService.js';

const DESIGNATIONS = [
  'Professor & HOD',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Adjunct Professor',
  'Guest Lecturer',
];

const STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RETIRED'];

export const FacultyPage: React.FC = () => {
  // State
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalFaculty, setTotalFaculty] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Reference Lists
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);

  // Dialogs & View State
  const [openRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);
  const [viewingFaculty, setViewingFaculty] = useState<Faculty | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    designation: 'Assistant Professor',
    qualification: '',
    experienceYears: 0,
    department: '',
    subjects: [] as string[],
    salary: 60000,
    joiningDate: new Date().toISOString().split('T')[0],
    photo: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RETIRED',
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

  // Fetch Dropdown reference data
  const fetchDropdownData = useCallback(async () => {
    try {
      const [deptRes, subjRes] = await Promise.all([
        departmentService.getDepartments(),
        subjectService.getSubjects({ limit: 100 }),
      ]);
      if (deptRes.success && deptRes.departments) {
        setDepartmentList(deptRes.departments);
      }
      if (subjRes.success && subjRes.subjects) {
        setSubjectList(subjRes.subjects);
      }
    } catch (err) {
      console.error('Error fetching department/subject options:', err);
    }
  }, []);

  // Fetch Faculty Members
  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const response = await facultyService.getFaculty({
        search,
        department: selectedDept,
        designation: selectedDesignation,
        status: selectedStatus,
        page: page + 1,
        limit: rowsPerPage,
      });

      if (response.success) {
        setFacultyList(response.faculty || []);
        setTotalFaculty(response.total || 0);
        setActiveCount(response.activeCount || 0);
        setTotalSalary(response.totalSalary || 0);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to fetch faculty list',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, selectedDesignation, selectedStatus, page, rowsPerPage]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Auto Generate Employee ID
  const handleAutoGenerateID = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      employeeId: `FAC2026${randomNum}`,
    }));
  };

  // Open Register Modal
  const handleOpenRegisterModal = () => {
    setEditingFaculty(null);
    const defaultDept = departmentList.length > 0 ? departmentList[0].name : 'Computer Science & Engineering';
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    setFormData({
      employeeId: `FAC2026${randomNum}`,
      name: '',
      email: '',
      phone: '',
      designation: 'Assistant Professor',
      qualification: 'M.Tech / Ph.D.',
      experienceYears: 3,
      department: defaultDept,
      subjects: [],
      salary: 65000,
      joiningDate: new Date().toISOString().split('T')[0],
      photo: '',
      status: 'ACTIVE',
    });
    setSelectedFile(null);
    setPhotoPreview('');
    setFormErrors({});
    setOpenRegisterModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      employeeId: faculty.employeeId,
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone,
      designation: faculty.designation || 'Assistant Professor',
      qualification: faculty.qualification,
      experienceYears: faculty.experienceYears || 0,
      department: faculty.department,
      subjects: faculty.subjects || [],
      salary: faculty.salary || 60000,
      joiningDate: faculty.joiningDate || new Date().toISOString().split('T')[0],
      photo: faculty.photo || '',
      status: faculty.status || 'ACTIVE',
    });
    setSelectedFile(null);
    setPhotoPreview(faculty.photo || '');
    setFormErrors({});
    setOpenRegisterModal(true);
  };

  // File Change
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
    if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Valid email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.qualification.trim()) errors.qualification = 'Qualification is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (formData.salary < 0) errors.salary = 'Salary cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Faculty Member
  const handleSaveFaculty = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('employeeId', formData.employeeId);
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('designation', formData.designation);
      fd.append('qualification', formData.qualification);
      fd.append('experienceYears', String(formData.experienceYears));
      fd.append('department', formData.department);
      fd.append('subjects', JSON.stringify(formData.subjects));
      fd.append('salary', String(formData.salary));
      fd.append('joiningDate', formData.joiningDate);
      fd.append('status', formData.status);

      if (selectedFile) {
        fd.append('photo', selectedFile);
      } else if (formData.photo) {
        fd.append('photo', formData.photo);
      }

      if (editingFaculty) {
        await facultyService.updateFaculty(editingFaculty._id, fd);
        setSnackbar({ open: true, message: 'Faculty details updated successfully', severity: 'success' });
      } else {
        await facultyService.createFaculty(fd);
        setSnackbar({ open: true, message: 'Faculty registered successfully', severity: 'success' });
      }

      setOpenRegisterModal(false);
      fetchFaculty();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error saving faculty record',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Faculty
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await facultyService.deleteFaculty(deletingId);
      setSnackbar({ open: true, message: 'Faculty record deleted successfully', severity: 'success' });
      setOpenDeleteModal(false);
      setDeletingId(null);
      fetchFaculty();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error deleting faculty',
        severity: 'error',
      });
    }
  };

  // Status Chip Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'ON_LEAVE':
        return 'warning';
      case 'RETIRED':
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
            Faculty & Staff Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage academic professors, experience profiles, assigned teaching subjects, salaries, and photo uploads.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchFaculty()}
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
            Register Faculty
          </Button>
        </Stack>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL FACULTY
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalFaculty}
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
                  ACTIVE STAFF
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
              <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 48, height: 48 }}>
                <LocalAtmIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL MONTHLY PAYROLL
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  ₹{totalSalary.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
                <WorkIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  AVG EXPERIENCE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {facultyList.length > 0
                    ? (
                        facultyList.reduce((acc, f) => acc + (f.experienceYears || 0), 0) / facultyList.length
                      ).toFixed(1) + ' Yrs'
                    : '0 Yrs'}
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
          <Grid size={{ xs: 12, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Employee ID, Name, Qualification, Subject..."
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
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
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

          {/* Designation Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Designation</InputLabel>
              <Select
                value={selectedDesignation}
                label="Designation"
                onChange={(e) => {
                  setSelectedDesignation(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Designations</MenuItem>
                {DESIGNATIONS.map((desig) => (
                  <MenuItem key={desig} value={desig}>
                    {desig}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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
          <Grid size={{ xs: 6, sm: 1, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

      {/* Main Faculty Directory */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : facultyList.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No faculty records found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try clearing search filters or add a new faculty member.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenRegisterModal}
            sx={{ borderRadius: 2 }}
          >
            Register Faculty
          </Button>
        </Paper>
      ) : viewMode === 'table' ? (
        /* Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Faculty Member</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department & Designation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Qualification & Exp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Subjects</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Salary</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facultyList.map((f) => (
                <TableRow key={f._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        src={f.photo}
                        alt={f.name}
                        sx={{ width: 44, height: 44, border: '1px solid #e2e8f0' }}
                      >
                        {f.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {f.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {f.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={f.employeeId}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 800, fontFamily: 'monospace' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {f.department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {f.designation}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {f.qualification}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {f.experienceYears} Years Exp.
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 220 }}>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {f.subjects && f.subjects.length > 0 ? (
                        f.subjects.slice(0, 2).map((sub, idx) => (
                          <Chip
                            key={idx}
                            label={sub}
                            size="small"
                            sx={{ fontSize: '0.68rem', bgcolor: 'primary.50', color: 'primary.800', fontWeight: 600 }}
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No subjects assigned
                        </Typography>
                      )}
                      {f.subjects && f.subjects.length > 2 && (
                        <Chip
                          label={`+${f.subjects.length - 2} more`}
                          size="small"
                          sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      ₹{f.salary?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={f.status}
                      size="small"
                      color={getStatusColor(f.status) as any}
                      sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="View Detailed Profile">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setViewingFaculty(f);
                            setOpenProfileModal(true);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Faculty">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(f)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Faculty">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeletingId(f._id);
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
            count={totalFaculty}
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
            {facultyList.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f._id}>
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
                          src={f.photo}
                          alt={f.name}
                          sx={{ width: 54, height: 54, border: '2px solid #e2e8f0' }}
                        >
                          {f.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {f.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {f.designation}
                          </Typography>
                          <Chip
                            label={f.employeeId}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              fontSize: '0.68rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      </Stack>

                      <Chip
                        label={f.status}
                        size="small"
                        color={getStatusColor(f.status) as any}
                        sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={1} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {f.department}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {f.qualification} ({f.experienceYears} Yrs)
                        </Typography>
                      </Box>

                      {/* Subjects */}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Assigned Subjects:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {f.subjects && f.subjects.length > 0 ? (
                            f.subjects.map((sub, idx) => (
                              <Chip
                                key={idx}
                                label={sub}
                                size="small"
                                sx={{ fontSize: '0.65rem', bgcolor: 'primary.50', color: 'primary.800' }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              None
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        📧 {f.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        📞 {f.phone}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', display: 'block', mt: 0.5 }}>
                        Salary: ₹{f.salary?.toLocaleString()} / mo
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
                        setViewingFaculty(f);
                        setOpenProfileModal(true);
                      }}
                      sx={{ borderRadius: 1.5 }}
                    >
                      Profile
                    </Button>

                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(f)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeletingId(f._id);
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
              count={totalFaculty}
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

      {/* Faculty Registration / Edit Dialog */}
      <Dialog
        open={openRegisterModal}
        onClose={() => !saving && setOpenRegisterModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingFaculty ? 'Update Faculty Details' : 'Register Faculty Member'}
          </Typography>
          {!editingFaculty && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleAutoGenerateID}
              sx={{ borderRadius: 2 }}
            >
              Auto Employee ID
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Section 1: Photo Upload */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Faculty Photograph Upload (Multer)
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
                    alt="Faculty Preview"
                    sx={{ width: 80, height: 80, border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    {formData.name?.charAt(0) || 'F'}
                  </Avatar>
                </Badge>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload professional faculty headshot (JPG, PNG, WEBP max 5MB).
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
                      Choose Photo
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

            {/* Section 2: Employee Credentials & Department */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                1. Institutional & Administrative
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Employee ID *"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    error={Boolean(formErrors.employeeId)}
                    helperText={formErrors.employeeId}
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
                  <FormControl fullWidth>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={formData.designation}
                      label="Designation"
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    >
                      {DESIGNATIONS.map((desig) => (
                        <MenuItem key={desig} value={desig}>
                          {desig}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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

            {/* Section 3: Personal & Contact Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                2. Personal & Contact Details
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={Boolean(formErrors.phone)}
                    helperText={formErrors.phone}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Joining Date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 4: Academic Qualifications & Subjects */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                3. Qualifications, Experience & Subjects
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Qualification *"
                    placeholder="e.g. Ph.D. in Computer Science (MIT)"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    error={Boolean(formErrors.qualification)}
                    helperText={formErrors.qualification}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Experience (Years)"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monthly Salary (₹)"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    error={Boolean(formErrors.salary)}
                    helperText={formErrors.salary}
                  />
                </Grid>

                {/* Assigned Subjects Selector */}
                <Grid size={{ xs: 12 }}>
                  <Autocomplete<string, true, false, true>
                    multiple
                    options={subjectList.map((s) => s.name)}
                    value={formData.subjects}
                    freeSolo
                    onChange={(_e, newValue) => setFormData({ ...formData, subjects: newValue as string[] })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Assigned Teaching Subjects"
                        placeholder="Select or type subject names..."
                        helperText="Press enter to add custom subject names if not in dropdown list."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenRegisterModal(false)} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveFaculty}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {saving ? 'Saving...' : editingFaculty ? 'Update Record' : 'Register Faculty'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detailed Faculty Profile Modal */}
      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        {viewingFaculty && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Faculty Profile Card
              </Typography>
              <Chip
                label={viewingFaculty.employeeId}
                color="primary"
                sx={{ fontWeight: 800, fontFamily: 'monospace' }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ textCenter: 'center', py: 1 }}>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={viewingFaculty.photo}
                    alt={viewingFaculty.name}
                    sx={{ width: 84, height: 84, border: '3px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  >
                    {viewingFaculty.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {viewingFaculty.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                      {viewingFaculty.designation}
                    </Typography>
                    <Chip
                      label={viewingFaculty.status}
                      size="small"
                      color={getStatusColor(viewingFaculty.status) as any}
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    />
                  </Box>
                </Stack>

                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5 }}>
                    INSTITUTIONAL INFORMATION
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.department}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Joining Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.joiningDate}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Qualification
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.qualification}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Experience
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.experienceYears} Years
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5 }}>
                    CONTACT & PAYROLL
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.email}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {viewingFaculty.phone}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Monthly Salary
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        ₹{viewingFaculty.salary?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>
                    ASSIGNED SUBJECTS
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {viewingFaculty.subjects && viewingFaculty.subjects.length > 0 ? (
                      viewingFaculty.subjects.map((sub, idx) => (
                        <Chip
                          key={idx}
                          label={sub}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No subjects currently assigned.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenProfileModal(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this faculty member? This operation cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
