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
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext.js';
import { departmentService } from '../../services/departmentService.js';
import { Department } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

interface DepartmentFormData {
  name: string;
  code: string;
  hodName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalFaculties: number;
  totalStudents: number;
}

const initialFormState: DepartmentFormData = {
  name: '',
  code: '',
  hodName: '',
  description: '',
  status: 'ACTIVE',
  totalFaculties: 0,
  totalStudents: 0,
};

export const DepartmentsPage: React.FC = () => {
  const { user, token } = useAuth();
  const isManagement = ['SUPER_ADMIN', 'PRINCIPAL', 'HOD'].includes(user?.role || '');

  // Data & Pagination State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [inactiveCount, setInactiveCount] = useState<number>(0);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination Controls
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Dialog States
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<{ name?: string; code?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Snackbar Alert State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch Departments
  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await departmentService.getDepartments({
        search: search.trim() || undefined,
        status: statusFilter,
        page: page + 1,
        limit: rowsPerPage,
      });

      setDepartments(res.departments || []);
      setTotalCount(res.total || 0);
      setActiveCount(res.activeCount || 0);
      setInactiveCount(res.inactiveCount || 0);
    } catch (err: any) {
      console.error('[DepartmentsPage] Error fetching departments:', err);
      showSnackbar(err.response?.data?.message || 'Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
  };

  const handleStatusFilterChange = (e: any) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setSelectedDept(null);
    setFormData(initialFormState);
    setFormErrors({});
    setOpenFormDialog(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      hodName: dept.hodName || '',
      description: dept.description || '',
      status: dept.status || 'ACTIVE',
      totalFaculties: dept.totalFaculties || 0,
      totalStudents: dept.totalStudents || 0,
    });
    setFormErrors({});
    setOpenFormDialog(true);
  };

  // Form Field Validation
  const validateForm = (): boolean => {
    const errors: { name?: string; code?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Department Name is required';
    }
    if (!formData.code.trim()) {
      errors.code = 'Department Code is required';
    } else if (formData.code.trim().length < 2) {
      errors.code = 'Code should be at least 2 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Department (Create or Update)
  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (selectedDept) {
        // Edit Mode
        await departmentService.updateDepartment(selectedDept._id, formData);
        showSnackbar('Department updated successfully!', 'success');
      } else {
        // Create Mode
        await departmentService.createDepartment(formData);
        showSnackbar('Department created successfully!', 'success');
      }
      setOpenFormDialog(false);
      fetchDepartments();
    } catch (err: any) {
      console.error('[DepartmentsPage] Submit Error:', err);
      showSnackbar(err.response?.data?.message || 'Failed to save department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Prompt
  const handleOpenDelete = (dept: Department) => {
    setDeptToDelete(dept);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    setIsDeleting(true);
    try {
      await departmentService.deleteDepartment(deptToDelete._id);
      showSnackbar(`Department '${deptToDelete.name}' deleted successfully!`, 'success');
      setOpenDeleteDialog(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err: any) {
      console.error('[DepartmentsPage] Delete Error:', err);
      showSnackbar(err.response?.data?.message || 'Failed to delete department', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate totals across all departments
  const totalFacultiesCount = departments.reduce((acc, d) => acc + (d.totalFaculties || 0), 0);
  const totalStudentsCount = departments.reduce((acc, d) => acc + (d.totalStudents || 0), 0);

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Academic Departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage institutional faculties, department codes, heads of departments (HOD), and program capacities
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDepartments} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
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
              Add Department
            </Button>
          )}
        </Stack>
      </Box>

      {/* Overview Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 48, height: 48 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Total Departments
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
                Active Status
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
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Faculty Members
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {totalFacultiesCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 48, height: 48 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Enrolled Students
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {totalStudentsCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Toolbar Controls: Search, Filter, View Mode */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by department name, code, HOD name..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
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
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status Filter</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status Filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active Only</MenuItem>
                <MenuItem value="INACTIVE">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              View:
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <Tooltip title="Grid Card View">
                  <GridViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <Tooltip title="Data Table View">
                  <TableRowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner message="Fetching academic departments..." />
      ) : departments.length === 0 ? (
        /* Empty State */
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Departments Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search || statusFilter !== 'ALL'
              ? 'Try resetting search query or status filter.'
              : 'Click "Add Department" to register the first department.'}
          </Typography>
          {(search || statusFilter !== 'ALL') && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Paper>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={dept._id}>
              <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {/* Card Header */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontWeight: 700 }}>
                      {dept.code.slice(0, 3)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {dept.name}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                        <Chip label={dept.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                        <Chip
                          label={dept.status || 'ACTIVE'}
                          color={dept.status === 'INACTIVE' ? 'default' : 'success'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dept.description || 'Dedicated to excellence in academic curriculum and research advancement.'}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  {/* HOD Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Head of Dept (HOD): <strong style={{ color: '#1E293B' }}>{dept.hodName || 'Unassigned'}</strong>
                    </Typography>
                  </Box>

                  {/* Metrics Badge */}
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              Faculties
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {dept.totalFaculties || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <SchoolIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              Students
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {dept.totalStudents || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </CardContent>

                {/* Card Actions */}
                {isManagement && (
                  <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(dept)}
                      sx={{ fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDelete(dept)}
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Head of Dept (HOD)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Faculties</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Students</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                {isManagement && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept._id} hover>
                  <TableCell>
                    <Chip label={dept.code} color="primary" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {dept.description ? dept.description.slice(0, 60) + '...' : 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>{dept.hodName || 'Unassigned'}</TableCell>
                  <TableCell>{dept.totalFaculties || 0}</TableCell>
                  <TableCell>{dept.totalStudents || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={dept.status || 'ACTIVE'}
                      color={dept.status === 'INACTIVE' ? 'default' : 'success'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  {isManagement && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(dept)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(dept)}>
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

      {/* Add/Edit Modal Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={() => !isSubmitting && setOpenFormDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedDept ? 'Edit Department' : 'Create New Department'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Department Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name || 'e.g. Computer Science & Engineering'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Department Code"
                  required
                  placeholder="CSE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  error={!!formErrors.code}
                  helperText={formErrors.code || 'Uppercase short code'}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Head of Department (HOD)"
                  placeholder="Prof. Robert Langdon"
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="dept-status-label">Status</InputLabel>
                  <Select
                    labelId="dept-status-label"
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Faculties"
                  value={formData.totalFaculties}
                  onChange={(e) => setFormData({ ...formData, totalFaculties: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Students"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: Math.max(0, parseInt(e.target.value) || 0) })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              placeholder="Enter brief summary of academic goals, programs, or specializations..."
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
            {isSubmitting ? 'Saving...' : selectedDept ? 'Update Department' : 'Create Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !isDeleting && setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Delete Department
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete department <strong>{deptToDelete?.name}</strong> ({deptToDelete?.code})?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={isDeleting} sx={{ fontWeight: 700 }}>
            {isDeleting ? 'Deleting...' : 'Delete Department'}
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
