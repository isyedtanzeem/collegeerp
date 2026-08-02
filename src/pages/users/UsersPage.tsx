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
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext.js';
import { userService } from '../../services/userService.js';
import { User, UserRole } from '../../types/index.js';
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

export const UsersPage: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await userService.getUsers({
        role: roleFilter !== 'ALL' ? (roleFilter as UserRole) : undefined,
        search: searchQuery || undefined,
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('[UsersPage] Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
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
        <Button variant="contained" color="primary" startIcon={<PersonAddIcon />} sx={{ fontWeight: 700 }}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
