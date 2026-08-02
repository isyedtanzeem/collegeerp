import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ScoreIcon from '@mui/icons-material/Score';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import { Subject, User, Department as DeptType } from '../../types/index.js';
import { subjectService } from '../../services/subjectService.js';
import { userService } from '../../services/userService.js';
import { departmentService } from '../../services/departmentService.js';
import { useAuth } from '../../context/AuthContext.js';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECT_TYPES = ['THEORY', 'PRACTICAL', 'ELECTIVE'];

export const SubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = ['SUPER_ADMIN', 'PRINCIPAL', 'HOD'].includes(user?.role || '');

  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalSubjects, setTotalSubjects] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Lists for dropdowns
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [departmentList, setDepartmentList] = useState<DeptType[]>([]);

  // Dialogs
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const [subjectForAssign, setSubjectForAssign] = useState<Subject | null>(null);
  const [assignedFacultyName, setAssignedFacultyName] = useState<string>('');
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>('');

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 4,
    semester: 1,
    department: '',
    facultyName: 'Unassigned',
    type: 'THEORY' as 'THEORY' | 'PRACTICAL' | 'ELECTIVE',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);

  // Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch Dropdown data (Faculties & Departments)
  const fetchDropdownData = useCallback(async () => {
    try {
      const [facRes, deptRes] = await Promise.all([
        userService.getUsers({ role: 'FACULTY' }),
        departmentService.getDepartments(),
      ]);
      if (facRes.success && facRes.users) {
        setFacultyList(facRes.users);
      }
      if (deptRes.success && deptRes.departments) {
        setDepartmentList(deptRes.departments);
      }
    } catch (err) {
      console.error('Error fetching dropdown references:', err);
    }
  }, []);

  // Fetch Subjects
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await subjectService.getSubjects({
        search,
        department: selectedDept,
        semester: selectedSemester,
        type: selectedType,
        status: selectedStatus,
        page: page + 1,
        limit: rowsPerPage,
      });

      if (response.success) {
        setSubjects(response.subjects || []);
        setTotalSubjects(response.total || 0);
        if (response.activeCount !== undefined) {
          setActiveCount(response.activeCount);
        }
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to load subjects',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, selectedSemester, selectedType, selectedStatus, page, rowsPerPage]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle Form Open (Create/Edit)
  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      credits: 4,
      semester: 1,
      department: departmentList.length > 0 ? departmentList[0].name : 'Computer Science & Engineering',
      facultyName: 'Unassigned',
      type: 'THEORY',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setOpenModal(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits || 4,
      semester: subject.semester || 1,
      department: subject.department,
      facultyName: subject.facultyName || 'Unassigned',
      type: subject.type || 'THEORY',
      status: subject.status || 'ACTIVE',
    });
    setFormErrors({});
    setOpenModal(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = 'Subject code is required (e.g. CS201)';
    if (!formData.name.trim()) errors.name = 'Subject name is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (formData.credits < 1 || formData.credits > 12) errors.credits = 'Credits must be between 1 and 12';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Subject
  const handleSaveSubject = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, formData);
        setSnackbar({ open: true, message: 'Subject updated successfully', severity: 'success' });
      } else {
        await subjectService.createSubject(formData);
        setSnackbar({ open: true, message: 'New subject created successfully', severity: 'success' });
      }
      setOpenModal(false);
      fetchSubjects();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error saving subject',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Open Assign Faculty Modal
  const handleOpenAssignModal = (subject: Subject) => {
    setSubjectForAssign(subject);
    setAssignedFacultyName(subject.facultyName && subject.facultyName !== 'Unassigned' ? subject.facultyName : '');
    setAssignedFacultyId(subject.facultyId || '');
    setOpenAssignModal(true);
  };

  // Save Assigned Faculty
  const handleSaveAssignFaculty = async () => {
    if (!subjectForAssign) return;
    setSaving(true);
    try {
      let finalName = assignedFacultyName.trim();
      if (!finalName && assignedFacultyId) {
        const found = facultyList.find((f) => f._id === assignedFacultyId);
        if (found) finalName = found.name;
      }
      if (!finalName) finalName = 'Unassigned';

      await subjectService.assignFaculty(subjectForAssign._id, {
        facultyName: finalName,
        facultyId: assignedFacultyId || undefined,
      });

      setSnackbar({
        open: true,
        message: `Faculty '${finalName}' assigned to ${subjectForAssign.code}`,
        severity: 'success',
      });
      setOpenAssignModal(false);
      fetchSubjects();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to assign faculty',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Subject
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await subjectService.deleteSubject(deletingId);
      setSnackbar({ open: true, message: 'Subject deleted successfully', severity: 'success' });
      setOpenDeleteModal(false);
      setDeletingId(null);
      fetchSubjects();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Error deleting subject',
        severity: 'error',
      });
    }
  };

  // Total credits calculation across fetched
  const totalCreditsCount = subjects.reduce((acc, curr) => acc + (curr.credits || 0), 0);
  const assignedFacultyCount = subjects.filter((s) => s.facultyName && s.facultyName !== 'Unassigned').length;

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
            Subject Module
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage academic curriculum subjects, credit allocation, semester syllabus, and faculty assignments.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchSubjects()}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>

          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
            >
              Add Subject
            </Button>
          )}
        </Stack>
      </Box>

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
                <MenuBookIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL SUBJECTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalSubjects}
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
                  ACTIVE SUBJECTS
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
              <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', width: 48, height: 48 }}>
                <ScoreIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PAGE CREDITS SUM
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {totalCreditsCount} pts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 48, height: 48 }}>
                <AssignmentIndIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  FACULTY ASSIGNED
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {assignedFacultyCount} / {subjects.length}
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
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search code, subject name, department, faculty..."
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
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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

          {/* Semester Filter */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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
                <MenuItem value="ALL">All Semesters</MenuItem>
                {SEMESTERS.map((s) => (
                  <MenuItem key={s} value={String(s)}>
                    Semester {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type Filter */}
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                {SUBJECT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
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
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* View Mode Toggle */}
          <Grid size={{ xs: 12, sm: 12, md: 0.5 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

      {/* Main Content Area */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : subjects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <MenuBookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No subjects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or create a new subject to populate the curriculum catalog.
          </Typography>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal} sx={{ borderRadius: 2 }}>
              Add First Subject
            </Button>
          )}
        </Paper>
      ) : viewMode === 'table' ? (
        /* Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Subject Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Faculty Assigned</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((s) => {
                const isAssigned = s.facultyName && s.facultyName !== 'Unassigned';

                return (
                  <TableRow key={s._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Chip
                        label={s.code}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 800, borderRadius: 1.5, fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {s.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${s.credits} Credits`}
                        size="small"
                        sx={{ bgcolor: 'primary.50', color: 'primary.800', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        Sem {s.semester}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                        {s.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            bgcolor: isAssigned ? 'info.main' : 'grey.400',
                          }}
                        >
                          {isAssigned ? s.facultyName?.charAt(0) : '?'}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isAssigned ? 600 : 400,
                            color: isAssigned ? 'text.primary' : 'text.disabled',
                            fontStyle: isAssigned ? 'normal' : 'italic',
                          }}
                        >
                          {s.facultyName || 'Unassigned'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.type || 'THEORY'}
                        size="small"
                        variant="outlined"
                        color={s.type === 'PRACTICAL' ? 'warning' : s.type === 'ELECTIVE' ? 'secondary' : 'default'}
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.status || 'ACTIVE'}
                        size="small"
                        color={s.status === 'INACTIVE' ? 'default' : 'success'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        {canManage && (
                          <Tooltip title="Assign Faculty">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenAssignModal(s)}
                            >
                              <PersonAddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canManage && (
                          <Tooltip title="Edit Subject">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(s)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canManage && (
                          <Tooltip title="Delete Subject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDeletingId(s._id);
                                setOpenDeleteModal(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalSubjects}
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
        /* Grid View */
        <Box>
          <Grid container spacing={2.5}>
            {subjects.map((s) => {
              const isAssigned = s.facultyName && s.facultyName !== 'Unassigned';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s._id}>
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Chip
                          label={s.code}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 800, fontFamily: 'monospace', borderRadius: 1.5 }}
                        />
                        <Chip
                          label={s.status || 'ACTIVE'}
                          size="small"
                          color={s.status === 'INACTIVE' ? 'default' : 'success'}
                          sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, minHeight: 48, lineHeight: 1.3 }}>
                        {s.name}
                      </Typography>

                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {s.department}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip
                            label={`${s.credits} Credits`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={`Semester ${s.semester}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={s.type || 'THEORY'}
                            size="small"
                            color={s.type === 'PRACTICAL' ? 'warning' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>
                      </Stack>

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.85rem',
                              bgcolor: isAssigned ? 'info.main' : 'grey.400',
                            }}
                          >
                            {isAssigned ? s.facultyName?.charAt(0) : '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Faculty Instructor
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: isAssigned ? 'text.primary' : 'text.disabled',
                              }}
                            >
                              {s.facultyName || 'Unassigned'}
                            </Typography>
                          </Box>
                        </Stack>

                        {canManage && (
                          <IconButton size="small" color="info" onClick={() => handleOpenAssignModal(s)}>
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>

                    {canManage && (
                      <Box
                        sx={{
                          p: 1.5,
                          pt: 0,
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                          borderTop: '1px solid #f1f5f9',
                          bgcolor: '#fafafa',
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditModal(s)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setDeletingId(s._id);
                            setOpenDeleteModal(true);
                          }}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Grid View Pagination */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={totalSubjects}
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

      {/* Create / Edit Subject Modal */}
      <Dialog
        open={openModal}
        onClose={() => !saving && setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editingSubject ? 'Edit Subject Details' : 'Create New Subject'}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Subject Code *"
                  placeholder="e.g. CS201"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={Boolean(formErrors.code)}
                  helperText={formErrors.code}
                  slotProps={{
                    htmlInput: {
                      style: { textTransform: 'uppercase', fontFamily: 'monospace' },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Subject Name *"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Credits *"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 1 })}
                  slotProps={{ htmlInput: { min: 1, max: 12 } }}
                  error={Boolean(formErrors.credits)}
                  helperText={formErrors.credits || 'Range: 1 to 12'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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
            </Grid>

            <FormControl fullWidth error={Boolean(formErrors.department)}>
              <InputLabel>Department *</InputLabel>
              <Select
                value={formData.department}
                label="Department *"
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departmentList.map((d) => (
                  <MenuItem key={d._id} value={d.name}>
                    {d.name} ({d.code})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.department && <FormHelperText>{formErrors.department}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assign Faculty</InputLabel>
              <Select
                value={formData.facultyName}
                label="Assign Faculty"
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
              >
                <MenuItem value="Unassigned">
                  <em>Unassigned</em>
                </MenuItem>
                {facultyList.map((f) => (
                  <MenuItem key={f._id} value={f.name}>
                    {f.name} ({f.department || 'Faculty'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Subject Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Subject Type"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'THEORY' | 'PRACTICAL' | 'ELECTIVE',
                      })
                    }
                  >
                    <MenuItem value="THEORY">Theory</MenuItem>
                    <MenuItem value="PRACTICAL">Practical / Lab</MenuItem>
                    <MenuItem value="ELECTIVE">Elective</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ACTIVE' | 'INACTIVE',
                      })
                    }
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveSubject} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
            {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Faculty Dedicated Dialog */}
      <Dialog
        open={openAssignModal}
        onClose={() => !saving && setOpenAssignModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Faculty</DialogTitle>
        <DialogContent dividers>
          {subjectForAssign && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Subject Details
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {subjectForAssign.code} - {subjectForAssign.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department: {subjectForAssign.department}
                </Typography>
              </Paper>

              <FormControl fullWidth>
                <InputLabel>Select Faculty</InputLabel>
                <Select
                  value={assignedFacultyId || ''}
                  label="Select Faculty"
                  onChange={(e) => {
                    const id = e.target.value;
                    setAssignedFacultyId(id);
                    const selectedFac = facultyList.find((f) => f._id === id);
                    if (selectedFac) setAssignedFacultyName(selectedFac.name);
                  }}
                >
                  <MenuItem value="">
                    <em>Clear / Unassigned</em>
                  </MenuItem>
                  {facultyList.map((f) => (
                    <MenuItem key={f._id} value={f._id}>
                      {f.name} — {f.designation || 'Faculty'} ({f.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary" align="center">
                Or enter custom faculty name below if not in list:
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Custom Faculty Name"
                value={assignedFacultyName}
                onChange={(e) => setAssignedFacultyName(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAssignModal(false)} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveAssignFaculty} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Subject?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this subject? This action will remove it from the curriculum catalog and
            cannot be undone.
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
