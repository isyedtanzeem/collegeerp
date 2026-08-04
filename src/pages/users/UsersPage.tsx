import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext.js';
import { userService } from '../../services/userService.js';
import { departmentService } from '../../services/departmentService.js';
import { User, UserRole, Department } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  SUPER_ADMIN: 'error',
  PRINCIPAL: 'primary',
  HOD: 'info',
  FACULTY: 'success',
  STUDENT: 'warning',
  ACCOUNTANT: 'secondary',
  LIBRARIAN: 'default',
};

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  designation?: string;
  employeeId?: string;
  enrollmentNo?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const initialFormData: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'STUDENT',
  department: 'Computer Science',
  designation: '',
  employeeId: '',
  enrollmentNo: '',
  phone: '',
  status: 'ACTIVE',
};

export const UsersPage: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await userService.getUsers({
        role: roleFilter !== 'ALL' ? (roleFilter as UserRole) : undefined,
        search: searchQuery || undefined,
      });
      setUsers(res.users || []);
    } catch (err: any) {
      console.error('[UsersPage] Error loading users:', err);
      showToast(err.response?.data?.message || 'Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments();
      if (res.success && res.departments) {
        setDepartments(res.departments);
      }
    } catch (err) {
      console.error('[UsersPage] Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, token]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFormData({
      ...initialFormData,
      department: departments[0]?.name || 'Computer Science',
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || 'Computer Science',
      designation: user.designation || '',
      employeeId: user.employeeId || '',
      enrollmentNo: user.enrollmentNo || '',
      phone: user.phone || '',
      status: user.status || 'ACTIVE',
    });
    setOpenModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and Email are required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUserId) {
        // Update user
        const payload: Partial<User> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          designation: formData.designation,
          employeeId: formData.employeeId,
          enrollmentNo: formData.enrollmentNo,
          phone: formData.phone,
          status: formData.status,
        };
        const res = await userService.updateUser(editingUserId, payload);
        showToast(res.message || 'User updated successfully!', 'success');
      } else {
        // Create user
        const res = await userService.createUser({
          ...formData,
          password: formData.password || 'DefaultPass123!',
        });
        showToast(res.message || 'User created successfully!', 'success');
      }
      setOpenModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error('[UsersPage] Save user error:', err);
      showToast(err.response?.data?.message || 'Failed to save user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      const res = await userService.deleteUser(user._id);
      showToast(res.message || 'User deleted successfully', 'success');
      fetchUsers();
    } catch (err: any) {
      console.error('[UsersPage] Delete error:', err);
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title & Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            User Management Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Students, Faculty, HODs, Accountants, and Librarians across departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          sx={{ fontWeight: 700 }}
          onClick={handleOpenCreateModal}
        >
          Add New Member
        </Button>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', flexGrow: 1, gap: 1, width: '100%' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name, email, ID or enrollment no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                },
              }}
            />
            <Button type="submit" variant="outlined">
              Search
            </Button>
          </Box>

          <TextField
            select
            size="small"
            label="Role Filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            <MenuItem value="PRINCIPAL">Principal</MenuItem>
            <MenuItem value="HOD">HOD</MenuItem>
            <MenuItem value="FACULTY">Faculty</MenuItem>
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
            <MenuItem value="LIBRARIAN">Librarian</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Fetching user records..." />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User Profile</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ID / Enrollment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No user records found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                          {row.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.role.replace('_', ' ')} color={ROLE_COLORS[row.role] || 'default'} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.department || 'General'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {row.enrollmentNo || row.employeeId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'ACTIVE' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Member">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Member">
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit User Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingUserId ? 'Edit Institutional Member' : 'Add New Member'}
          </Typography>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveUser}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dr. Sophia Vance"
              />
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., sophia@communitycollege.edu"
              />
              {!editingUserId && (
                <TextField
                  label="Initial Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Leave blank for auto-assigned password (DefaultPass123!)"
                />
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Member Role"
                  fullWidth
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="FACULTY">Faculty</MenuItem>
                  <MenuItem value="HOD">HOD</MenuItem>
                  <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                  <MenuItem value="LIBRARIAN">Librarian</MenuItem>
                  <MenuItem value="PRINCIPAL">Principal</MenuItem>
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Department"
                  fullWidth
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))
                  ) : (
                    <>
                      <MenuItem value="Computer Science">Computer Science</MenuItem>
                      <MenuItem value="Information Technology">Information Technology</MenuItem>
                      <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                      <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                      <MenuItem value="Administration">Administration</MenuItem>
                    </>
                  )}
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {formData.role === 'STUDENT' ? (
                  <TextField
                    label="Enrollment / Adm No"
                    fullWidth
                    value={formData.enrollmentNo}
                    onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                    placeholder="e.g., STU2026108"
                  />
                ) : (
                  <TextField
                    label="Employee ID"
                    fullWidth
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., EMP9042"
                  />
                )}
                <TextField
                  label="Designation / Title"
                  fullWidth
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Professor"
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Phone Contact"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 555-0192"
                />
                <TextField
                  select
                  label="Account Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' })}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ fontWeight: 700 }}>
              {submitting ? 'Saving...' : editingUserId ? 'Save Changes' : 'Create Member'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
