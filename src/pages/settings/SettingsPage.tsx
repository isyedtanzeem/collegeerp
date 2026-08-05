import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Snackbar,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from '../../context/AuthContext.js';
import { settingService, SystemSettingData, RolePermissionData, PermissionModule } from '../../services/settingService.js';
import { userService } from '../../services/userService.js';
import { User, UserRole } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

// Preset Avatars for Profile Picture selection
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
];

// Primary Accent Color Presets
const COLOR_PRESETS = [
  { name: 'Sky Blue', value: '#0284c7' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Royal Purple', value: '#8b5cf6' },
  { name: 'Amber Sunset', value: '#f59e0b' },
  { name: 'Crimson Red', value: '#ef4444' },
  { name: 'Indigo Night', value: '#6366f1' },
];

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full Unrestricted System Access & Governance' },
  { role: 'PRINCIPAL', label: 'Principal / Executive', desc: 'Executive Institutional Oversight & Policy Control' },
  { role: 'HOD', label: 'HOD (Department Head)', desc: 'Departmental Faculty, Student & Course Management' },
  { role: 'FACULTY', label: 'Faculty / Educator', desc: 'Academic Educator - Class Marks, Attendance & Course Materials' },
  { role: 'ACCOUNTANT', label: 'Accountant', desc: 'Financial Desk & Tuition Fee Collection' },
  { role: 'LIBRARIAN', label: 'Librarian', desc: 'Library Books Catalog & Circulation Desk' },
  { role: 'STUDENT', label: 'Student', desc: 'Enrolled Scholar - View Results, Attendance & Fee Invoices' },
];

const ERP_MODULES = [
  { id: 'students', label: 'Students Directory & Admissions' },
  { id: 'faculty', label: 'Faculty & Staff Directory' },
  { id: 'academics', label: 'Courses, Subjects & Syllabus' },
  { id: 'attendance', label: 'Student & Faculty Attendance' },
  { id: 'fees', label: 'Tuition Fees, Ledger & Payments' },
  { id: 'library', label: 'Library Catalog & Book Circulation' },
  { id: 'reports', label: 'Institutional Analytics & Grade Reports' },
  { id: 'settings', label: 'System Settings & Governance' },
];

const BEHAVIOR_OPTIONS = [
  { id: 'attendance_marker', label: 'Faculty Attendance Marker Desk', desc: 'Allows marking daily or lecture attendance for assigned classes' },
  { id: 'marks_entry', label: 'Marks & Gradebook Entry Desk', desc: 'Allows entering test marks, internal assessments, and semester grades' },
  { id: 'fee_collector', label: 'Fee Collector & Billing Desk', desc: 'Allows collecting tuition fees, logging transactions, and printing receipts' },
  { id: 'library_desk', label: 'Library Circulation Desk', desc: 'Allows issuing, renewing, and logging returns for institutional books' },
  { id: 'notice_broadcaster', label: 'Notice & Announcement Broadcaster', desc: 'Allows drafting and publishing campus-wide official notices' },
  { id: 'leave_approver', label: 'Leave Request Approver Desk', desc: 'Allows reviewing and approving faculty/student leave applications' },
  { id: 'report_exporter', label: 'Data & Analytics Exporter', desc: 'Allows exporting CSV/PDF spreadsheets and audit summaries' },
];

const getDefaultBehaviorsForRole = (role: UserRole): string[] => {
  switch (role) {
    case 'SUPER_ADMIN':
      return BEHAVIOR_OPTIONS.map((b) => b.id);
    case 'PRINCIPAL':
      return ['attendance_marker', 'marks_entry', 'notice_broadcaster', 'leave_approver', 'report_exporter'];
    case 'HOD':
      return ['attendance_marker', 'marks_entry', 'notice_broadcaster', 'leave_approver'];
    case 'FACULTY':
      return ['attendance_marker', 'marks_entry', 'notice_broadcaster'];
    case 'ACCOUNTANT':
      return ['fee_collector', 'report_exporter'];
    case 'LIBRARIAN':
      return ['library_desk'];
    case 'STUDENT':
    default:
      return [];
  }
};

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [designation, setDesignation] = useState(user?.designation || '');

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Theme States
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');

  // System Settings States
  const [systemSetting, setSystemSetting] = useState<SystemSettingData>({
    collegeName: 'Apex Institute of Engineering & Technology',
    collegeCode: 'APEX-EDU-2026',
    email: 'admin@apex.edu',
    phone: '+1 (555) 234-5678',
    address: '100 University Campus Drive, Education Heights, CA 90210',
    logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150',
    currentAcademicYear: '2025-2026',
    currentSemester: 'Spring 2026',
    maintenanceMode: false,
    emailNotifications: true,
    smsAlerts: true,
    autoAttendanceReminder: true,
    themeMode: 'light',
    primaryColor: '#0284c7',
  });

  // Global Role Permissions Matrix State
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);

  // User Role Assignment states (SUPER_ADMIN ONLY)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIdForRole, setSelectedUserIdForRole] = useState<string>('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('STUDENT');
  const [userCustomPermissions, setUserCustomPermissions] = useState<PermissionModule[]>([]);
  const [userAllowedBehaviors, setUserAllowedBehaviors] = useState<string[]>([]);
  const [isSavingUserRole, setIsSavingUserRole] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Loading & Saving States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Toast Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const buildDefaultUserPermissions = (role: UserRole, rolePermList: RolePermissionData[]): PermissionModule[] => {
    const match = rolePermList.find((rp) => rp.role === role);
    if (match && match.permissions) {
      return JSON.parse(JSON.stringify(match.permissions));
    }
    return ERP_MODULES.map((m) => ({
      module: m.id,
      canRead: true,
      canCreate: role === 'SUPER_ADMIN' || role === 'PRINCIPAL' || role === 'HOD',
      canUpdate: role === 'SUPER_ADMIN' || role === 'PRINCIPAL' || role === 'HOD',
      canDelete: role === 'SUPER_ADMIN',
      canExport: role === 'SUPER_ADMIN' || role === 'PRINCIPAL',
    }));
  };

  const handleSelectUserForRole = (u: User, userId: string, rPermissions: RolePermissionData[] = rolePermissions) => {
    setSelectedUserIdForRole(userId);
    setAssignedRole(u.role);

    if (u.customPermissions && u.customPermissions.length > 0) {
      setUserCustomPermissions(JSON.parse(JSON.stringify(u.customPermissions)));
    } else {
      setUserCustomPermissions(buildDefaultUserPermissions(u.role, rPermissions));
    }

    if (u.allowedBehaviors && u.allowedBehaviors.length > 0) {
      setUserAllowedBehaviors([...u.allowedBehaviors]);
    } else {
      setUserAllowedBehaviors(getDefaultBehaviorsForRole(u.role));
    }
  };

  const fetchAllUsers = async (rPermissions: RolePermissionData[] = rolePermissions) => {
    if (!isSuperAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await userService.getUsers();
      if (res.success && res.users) {
        setAllUsers(res.users);
        if (res.users.length > 0 && !selectedUserIdForRole) {
          handleSelectUserForRole(res.users[0], res.users[0]._id, rPermissions);
        }
      }
    } catch (err) {
      console.error('[SettingsPage] Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initial Fetching
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [sysRes, permRes] = await Promise.all([
        settingService.getSystemSettings().catch(() => null),
        settingService.getRolePermissions().catch(() => null),
      ]);

      if (sysRes?.settings) {
        setSystemSetting(sysRes.settings);
        setThemeMode(sysRes.settings.themeMode || 'light');
        setPrimaryColor(sysRes.settings.primaryColor || '#0284c7');
      }

      let fetchedPerms: RolePermissionData[] = [];
      if (permRes?.permissions) {
        setRolePermissions(permRes.permissions);
        fetchedPerms = permRes.permissions;
      }

      if (isSuperAdmin) {
        await fetchAllUsers(fetchedPerms);
      }
    } catch (err) {
      console.error('[SettingsPage] Fetch error:', err);
      showToast('Error loading settings configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isSuperAdmin]);

  // Handle role dropdown change for selected user
  const handleRoleChangeForSelectedUser = (newRole: UserRole) => {
    setAssignedRole(newRole);
    setUserCustomPermissions(buildDefaultUserPermissions(newRole, rolePermissions));
    setUserAllowedBehaviors(getDefaultBehaviorsForRole(newRole));
  };

  // Toggle user module permission field
  const handleUserPermissionToggle = (moduleName: string, field: keyof PermissionModule) => {
    setUserCustomPermissions((prev) =>
      prev.map((p) => (p.module === moduleName ? { ...p, [field]: !p[field] } : p))
    );
  };

  // Toggle user behavior
  const handleUserBehaviorToggle = (behaviorId: string) => {
    setUserAllowedBehaviors((prev) =>
      prev.includes(behaviorId) ? prev.filter((id) => id !== behaviorId) : [...prev, behaviorId]
    );
  };

  // Save User Role & Permissions
  const handleSaveUserRoleAndPermissions = async () => {
    if (!selectedUserIdForRole) {
      showToast('Please select a user to configure', 'error');
      return;
    }
    setIsSavingUserRole(true);
    try {
      const targetUser = allUsers.find((u) => u._id === selectedUserIdForRole);
      const res = await userService.updateUser(selectedUserIdForRole, {
        role: assignedRole,
        customPermissions: userCustomPermissions,
        allowedBehaviors: userAllowedBehaviors,
      });

      showToast(res.message || `Role & permissions for ${targetUser?.name || 'User'} updated successfully!`, 'success');

      // Update local users array
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUserIdForRole
            ? { ...u, role: assignedRole, customPermissions: userCustomPermissions, allowedBehaviors: userAllowedBehaviors }
            : u
        )
      );
    } catch (err: any) {
      console.error('[SettingsPage] Error updating user role:', err);
      showToast(err.response?.data?.message || 'Failed to update user role and permissions.', 'error');
    } finally {
      setIsSavingUserRole(false);
    }
  };

  // Update Profile Submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, phone, avatar, department, designation });
      showToast('User profile updated successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      showToast(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save System Settings
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSystem(true);
    try {
      const res = await settingService.updateSystemSettings({
        ...systemSetting,
        themeMode,
        primaryColor,
      });
      setSystemSetting(res.settings);
      showToast('Institutional system settings updated successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update system settings.', 'error');
    } finally {
      setIsSavingSystem(false);
    }
  };

  // Toggle Module Permission for Global Role Matrix
  const handlePermissionToggle = (moduleName: string, field: keyof PermissionModule) => {
    if (rolePermissions.length === 0) return;

    const updatedRoles = [...rolePermissions];
    const currentRole = updatedRoles[selectedRoleIndex];

    const updatedPermissions = currentRole.permissions.map((perm) => {
      if (perm.module === moduleName) {
        return { ...perm, [field]: !perm[field] };
      }
      return perm;
    });

    currentRole.permissions = updatedPermissions;
    setRolePermissions(updatedRoles);
  };

  // Save Permissions Matrix for Global Roles
  const handleSavePermissions = async () => {
    if (rolePermissions.length === 0) return;

    setIsSavingPermissions(true);
    try {
      const currentRole = rolePermissions[selectedRoleIndex];
      await settingService.updateRolePermission(currentRole.role, {
        permissions: currentRole.permissions,
        description: currentRole.description,
      });
      showToast(`Global matrix for ${currentRole.role} updated successfully!`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save role permissions.', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading System Settings & Role Configurations..." />;
  }

  // Filtered Users list for user selection
  const filteredUsers = allUsers.filter((u) => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.department && u.department.toLowerCase().includes(term))
    );
  });

  const selectedUser = allUsers.find((u) => u._id === selectedUserIdForRole);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: primaryColor, width: 52, height: 52 }}>
            <SettingsIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              ERP Settings & Institutional Governance
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {isSuperAdmin
                ? 'Manage Account Profile, Security, Themes, User Role & Module Permissions Assignment'
                : 'Manage Account Profile, Password Credentials, Appearance Themes & System Preferences'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Settings Navigation Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3, px: 2, pt: 1, bgcolor: '#ffffff' }} elevation={1}>
        <Tabs
          value={activeTab > (isSuperAdmin ? 5 : 3) ? 0 : activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Profile & Picture" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<LockIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Change Password" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<PaletteIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Theme & Appearance" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab icon={<BusinessIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="System Settings" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          
          {/* ONLY SUPER ADMIN CAN ACCESS USER ROLE ASSIGNMENT & ROLE MATRIX */}
          {isSuperAdmin && (
            <Tab
              icon={<AdminPanelSettingsIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="User Role & Module Permissions"
              sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
            />
          )}
          {isSuperAdmin && (
            <Tab
              icon={<SecurityIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Global Role Matrix Control"
              sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* TAB 0: PROFILE & PROFILE PICTURE */}
      {activeTab === 0 && user && (
        <Grid container spacing={3}>
          {/* Avatar Upload / Selection Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#0f172a' }}>
                Profile Picture
              </Typography>

              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={avatar || user.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    bgcolor: primaryColor,
                    fontSize: '3rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    border: `4px solid ${primaryColor}`,
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                {user.name}
              </Typography>
              <Chip label={user.role.replace('_', ' ')} color="primary" size="small" sx={{ fontWeight: 800, mb: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter custom Image URL or select from preset institutional avatars:
              </Typography>

              <TextField
                label="Avatar URL"
                placeholder="https://..."
                fullWidth
                size="small"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                sx={{ mb: 2.5 }}
              />

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                PRESET AVATARS
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((url, idx) => (
                  <Avatar
                    key={idx}
                    src={url}
                    onClick={() => setAvatar(url)}
                    sx={{
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      border: avatar === url ? `3px solid ${primaryColor}` : '2px solid transparent',
                      '&:hover': { transform: 'scale(1.1)', transition: 'all 0.2s' },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Profile Details Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper component="form" onSubmit={handleSaveProfile} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                Personal Profile Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your contact details and academic department specifications
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Institutional Email" fullWidth value={user.email} disabled helperText="Contact Super Admin to update institutional email" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone Number" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Assigned Role" fullWidth value={user.role} disabled />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Department" fullWidth value={department} onChange={(e) => setDepartment(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Designation Title" fullWidth value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Associate Professor" />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSavingProfile}
                  sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: primaryColor }, fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: CHANGE PASSWORD */}
      {activeTab === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 700, mx: 'auto' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <LockIcon sx={{ fontSize: 28, color: primaryColor }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Security & Password Reset
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Re-authenticate your current password to issue a new secure credential
          </Typography>

          <Box component="form" onSubmit={handleChangePassword}>
            <Stack spacing={3}>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Minimum 6 characters with mixed letters and digits"
              />

              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isChangingPassword}
                sx={{ bgcolor: primaryColor, fontWeight: 700, py: 1.2, borderRadius: 2 }}
              >
                {isChangingPassword ? 'Updating Password...' : 'Update Password Credentials'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* TAB 2: THEME & APPEARANCE */}
      {activeTab === 2 && (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: 'auto' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <PaletteIcon sx={{ fontSize: 28, color: primaryColor }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Theme & Interface Personalization
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Customize system workspace appearance mode and primary accent color scheme
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#334155' }}>
                PRIMARY ACCENT COLOR
              </Typography>
              <Grid container spacing={2}>
                {COLOR_PRESETS.map((p) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={p.value}>
                    <Paper
                      onClick={() => setPrimaryColor(p.value)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: primaryColor === p.value ? `2px solid ${p.value}` : '1px solid #e2e8f0',
                        bgcolor: primaryColor === p.value ? `${p.value}0d` : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: p.value },
                      }}
                    >
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: p.value }} />
                      <Typography variant="body2" sx={{ fontWeight: primaryColor === p.value ? 800 : 600 }}>
                        {p.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#334155' }}>
                DISPLAY MODE
              </Typography>
              <Grid container spacing={2}>
                {(['light', 'dark', 'system'] as const).map((m) => (
                  <Grid size={{ xs: 4 }} key={m}>
                    <Paper
                      onClick={() => setThemeMode(m)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: themeMode === m ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                        bgcolor: themeMode === m ? `${primaryColor}0d` : '#fff',
                        textTransform: 'capitalize',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: themeMode === m ? 800 : 600 }}>
                        {m} Mode
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 3 && (
        <Paper component="form" onSubmit={handleSaveSystemSettings} sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <BusinessIcon sx={{ fontSize: 28, color: primaryColor }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Institutional System Configuration
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Campus profile, academic year details, and automated system alerts
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="College / Institution Name"
                fullWidth
                value={systemSetting.collegeName}
                onChange={(e) => setSystemSetting({ ...systemSetting, collegeName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Institution Code"
                fullWidth
                value={systemSetting.collegeCode}
                onChange={(e) => setSystemSetting({ ...systemSetting, collegeCode: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Primary Contact Email"
                fullWidth
                value={systemSetting.email}
                onChange={(e) => setSystemSetting({ ...systemSetting, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Help Desk Phone"
                fullWidth
                value={systemSetting.phone}
                onChange={(e) => setSystemSetting({ ...systemSetting, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Academic Year"
                fullWidth
                value={systemSetting.currentAcademicYear}
                onChange={(e) => setSystemSetting({ ...systemSetting, currentAcademicYear: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current Active Semester"
                fullWidth
                value={systemSetting.currentSemester}
                onChange={(e) => setSystemSetting({ ...systemSetting, currentSemester: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Campus Address"
                fullWidth
                multiline
                rows={2}
                value={systemSetting.address}
                onChange={(e) => setSystemSetting({ ...systemSetting, address: e.target.value })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#334155' }}>
            AUTOMATED SYSTEM TOGGLES
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSetting.emailNotifications}
                    onChange={(e) => setSystemSetting({ ...systemSetting, emailNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="Automated Institutional Email Alerts"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSetting.autoAttendanceReminder}
                    onChange={(e) => setSystemSetting({ ...systemSetting, autoAttendanceReminder: e.target.checked })}
                    color="primary"
                  />
                }
                label="Daily Attendance Reminders to Faculty"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSetting.smsAlerts}
                    onChange={(e) => setSystemSetting({ ...systemSetting, smsAlerts: e.target.checked })}
                    color="primary"
                  />
                }
                label="Emergency SMS Notifications to Students"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSetting.maintenanceMode}
                    onChange={(e) => setSystemSetting({ ...systemSetting, maintenanceMode: e.target.checked })}
                    color="error"
                  />
                }
                label="Maintenance Mode (Restrict Student Access)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isSavingSystem}
              sx={{ bgcolor: primaryColor, fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
            >
              {isSavingSystem ? 'Saving System Config...' : 'Save System Configuration'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 4: USER ROLE & MODULE PERMISSIONS ASSIGNMENT (SUPER_ADMIN ONLY) */}
      {isSuperAdmin && activeTab === 4 && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3.5, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Assign User Role & Module Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Super Admin control to pick any institutional member, update their system role, and configure granular per-module permissions and behaviors.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveUserRoleAndPermissions}
                disabled={isSavingUserRole || !selectedUserIdForRole}
                sx={{ bgcolor: primaryColor, fontWeight: 800, px: 3, py: 1.2, borderRadius: 2 }}
              >
                {isSavingUserRole ? 'Saving User Role...' : 'Save User Role & Permissions'}
              </Button>
            </Box>

            {/* User Search & Selection Dropdown */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="select-user-role-label">Select Institutional Member</InputLabel>
                  <Select
                    labelId="select-user-role-label"
                    value={selectedUserIdForRole}
                    label="Select Institutional Member"
                    onChange={(e) => {
                      const found = allUsers.find((u) => u._id === e.target.value);
                      if (found) handleSelectUserForRole(found, found._id);
                    }}
                  >
                    {filteredUsers.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Avatar src={u.avatar} sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: primaryColor }}>
                            {u.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {u.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            ({u.email}) — [{u.role}]
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter member by name, email, role or department..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {selectedUser ? (
              <Box>
                {/* User Detail & Role Switcher Card */}
                <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={selectedUser.avatar} sx={{ width: 56, height: 56, bgcolor: primaryColor, fontWeight: 800, fontSize: '1.5rem' }}>
                          {selectedUser.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {selectedUser.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedUser.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Department: <strong>{selectedUser.department || 'General'}</strong> | Designation: <strong>{selectedUser.designation || 'Staff'}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="assigned-role-label">Assign System Role</InputLabel>
                        <Select
                          labelId="assigned-role-label"
                          value={assignedRole}
                          label="Assign System Role"
                          onChange={(e) => handleRoleChangeForSelectedUser(e.target.value as UserRole)}
                          sx={{ fontWeight: 800 }}
                        >
                          {ALL_ROLES.map((r) => (
                            <MenuItem key={r.role} value={r.role}>
                              <strong>{r.label}</strong> — {r.desc}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>
                        Current Assigned Role: <Chip label={assignedRole} size="small" color="primary" sx={{ fontWeight: 800, ml: 1 }} />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Per-Module CRUD Permissions Matrix */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                  Custom Module Permissions Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Explicitly grant or revoke Read, Create, Update, Delete, and Export capabilities per module for <strong>{selectedUser.name}</strong>.
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 4 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#0f172a' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 800 }}>ERP Module</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Read</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Create</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Update</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Delete</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Export</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ERP_MODULES.map((mod) => {
                        const perm = userCustomPermissions.find((p) => p.module === mod.id) || {
                          module: mod.id,
                          canRead: true,
                          canCreate: false,
                          canUpdate: false,
                          canDelete: false,
                          canExport: false,
                        };

                        return (
                          <TableRow key={mod.id} hover>
                            <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {mod.label}
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={perm.canRead}
                                onChange={() => handleUserPermissionToggle(mod.id, 'canRead')}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={perm.canCreate}
                                onChange={() => handleUserPermissionToggle(mod.id, 'canCreate')}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={perm.canUpdate}
                                onChange={() => handleUserPermissionToggle(mod.id, 'canUpdate')}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={perm.canDelete}
                                onChange={() => handleUserPermissionToggle(mod.id, 'canDelete')}
                                color="error"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={perm.canExport}
                                onChange={() => handleUserPermissionToggle(mod.id, 'canExport')}
                                color="success"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Behavioral Privileges Checkboxes */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                  User Behavioral Capabilities & Operational Desk Privileges
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Assign or restrict specific functional actions for <strong>{selectedUser.name}</strong> across campus desks.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {BEHAVIOR_OPTIONS.map((beh) => {
                    const isChecked = userAllowedBehaviors.includes(beh.id);
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={beh.id}>
                        <Paper
                          onClick={() => handleUserBehaviorToggle(beh.id)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: isChecked ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                            bgcolor: isChecked ? `${primaryColor}0a` : '#ffffff',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                          }}
                        >
                          <Checkbox checked={isChecked} color="primary" sx={{ p: 0, mt: 0.3 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {beh.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {beh.desc}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveUserRoleAndPermissions}
                    disabled={isSavingUserRole}
                    sx={{ bgcolor: primaryColor, fontWeight: 800, px: 4, py: 1.2, borderRadius: 2 }}
                  >
                    {isSavingUserRole ? 'Saving Role & Permissions...' : 'Save User Role & Permissions'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No user selected. Please pick an institutional member from the dropdown above to assign role and permissions.
              </Alert>
            )}
          </Paper>
        </Stack>
      )}

      {/* TAB 5: GLOBAL ROLE MATRIX CONTROL (SUPER_ADMIN ONLY) */}
      {isSuperAdmin && activeTab === 5 && rolePermissions.length > 0 && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Global Baseline Role Permission Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure default CRUD and export rules assigned to system roles when new users register
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                sx={{ bgcolor: primaryColor, fontWeight: 700, px: 3, py: 1 }}
              >
                {isSavingPermissions ? 'Saving Global Matrix...' : 'Save Global Matrix'}
              </Button>
            </Box>

            {/* Role Select Pills */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {rolePermissions.map((rp, idx) => (
                <Chip
                  key={rp.role}
                  label={rp.role.replace('_', ' ')}
                  color={selectedRoleIndex === idx ? 'primary' : 'default'}
                  onClick={() => setSelectedRoleIndex(idx)}
                  sx={{ fontWeight: 800, py: 2, px: 1, cursor: 'pointer' }}
                />
              ))}
            </Box>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Managing global baseline permissions for <strong>{rolePermissions[selectedRoleIndex].role}</strong>: {rolePermissions[selectedRoleIndex].description}
            </Alert>

            {/* Permissions Matrix Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#0f172a' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 800 }}>ERP Module</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Read Access</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Create Access</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Update Access</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Delete Access</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 800 }}>Export Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rolePermissions[selectedRoleIndex].permissions.map((perm) => (
                    <TableRow key={perm.module} hover>
                      <TableCell sx={{ fontWeight: 800, textTransform: 'capitalize', color: '#0f172a' }}>
                        {perm.module}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={perm.canRead}
                          onChange={() => handlePermissionToggle(perm.module, 'canRead')}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={perm.canCreate}
                          onChange={() => handlePermissionToggle(perm.module, 'canCreate')}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={perm.canUpdate}
                          onChange={() => handlePermissionToggle(perm.module, 'canUpdate')}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={perm.canDelete}
                          onChange={() => handlePermissionToggle(perm.module, 'canDelete')}
                          color="error"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={perm.canExport}
                          onChange={() => handlePermissionToggle(perm.module, 'canExport')}
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontWeight: 700, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
