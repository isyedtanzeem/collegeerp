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

import { useAuth } from '../../context/AuthContext.js';
import { settingService, SystemSettingData, RolePermissionData, PermissionModule } from '../../services/settingService.js';
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

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
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

  // Role Permissions Matrix State
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);

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

      if (permRes?.permissions) {
        setRolePermissions(permRes.permissions);
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
  }, []);

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

  // Toggle Module Permission
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

  // Save Permissions Matrix
  const handleSavePermissions = async () => {
    if (rolePermissions.length === 0) return;

    setIsSavingPermissions(true);
    try {
      const currentRole = rolePermissions[selectedRoleIndex];
      await settingService.updateRolePermission(currentRole.role, {
        permissions: currentRole.permissions,
        description: currentRole.description,
      });
      showToast(`Permissions for ${currentRole.role} updated successfully!`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save role permissions.', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading System Settings & Role Configurations..." />;
  }

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
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: primaryColor, width: 52, height: 52 }}>
            <SettingsIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              ERP Settings & Institutional Governance
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Manage Account Profile, Security, Appearance Themes, Campus Configurations & Role Access Control
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Settings Navigation Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3, px: 2, pt: 1, bgcolor: '#ffffff' }} elevation={1}>
        <Tabs
          value={activeTab}
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
          <Tab icon={<SecurityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Role Permissions" sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
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

              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
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
              </Stack>
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
                  <TextField label="Institutional Email" fullWidth value={user.email} disabled helperText="Contact Admin to update institutional email" />
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
                  <TextField label="Designation / Designation Title" fullWidth value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Associate Professor" />
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
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
                helperText="Password must be at least 6 characters long"
              />

              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword !== '' && confirmPassword !== newPassword}
                helperText={confirmPassword !== '' && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<LockIcon />}
                  disabled={isChangingPassword}
                  sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* TAB 2: THEME & APPEARANCE */}
      {activeTab === 2 && (
        <Stack spacing={3}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
              ERP UI Visual Theme & Accent Colors
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Customize visual color schemes and canvas presentation mode across your session
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#334155' }}>
                  Primary Brand Accent Color
                </Typography>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
                  {COLOR_PRESETS.map((p) => (
                    <Box
                      key={p.value}
                      onClick={() => setPrimaryColor(p.value)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: p.value,
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        boxShadow: primaryColor === p.value ? '0 0 0 3px #0f172a' : 'none',
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      {primaryColor === p.value && <CheckCircleIcon sx={{ fontSize: 18 }} />}
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {p.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#334155' }}>
                  Canvas Display Mode
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Card
                    onClick={() => setThemeMode('light')}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      border: themeMode === 'light' ? `3px solid ${primaryColor}` : '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Light Clean
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        High Contrast White Canvas
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setThemeMode('dark')}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      border: themeMode === 'dark' ? `3px solid ${primaryColor}` : '1px solid #334155',
                      bgcolor: '#0f172a',
                      color: '#fff',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                        Dark Mode
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Eye-safe Slate Layout
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSystemSettings}
                sx={{ bgcolor: primaryColor, fontWeight: 700, px: 3, py: 1 }}
              >
                Save Theme Preferences
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 3 && (
        <Paper component="form" onSubmit={handleSaveSystemSettings} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
            Institutional System Configuration & Parameters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure college contact information, current academic period, and system automated toggles
          </Typography>

          <Grid container spacing={2.5}>
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
                label="Official Admin Email"
                fullWidth
                value={systemSetting.email}
                onChange={(e) => setSystemSetting({ ...systemSetting, email: e.target.value })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Phone"
                fullWidth
                value={systemSetting.phone}
                onChange={(e) => setSystemSetting({ ...systemSetting, phone: e.target.value })}
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current Academic Year"
                fullWidth
                value={systemSetting.currentAcademicYear}
                onChange={(e) => setSystemSetting({ ...systemSetting, currentAcademicYear: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current Semester / Term"
                fullWidth
                value={systemSetting.currentSemester}
                onChange={(e) => setSystemSetting({ ...systemSetting, currentSemester: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                Automation & System Controls
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSetting.emailNotifications}
                    onChange={(e) => setSystemSetting({ ...systemSetting, emailNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enable Automated Email Notifications"
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
                label="Enable SMS Defaulter & Fee Alerts"
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
                label="Faculty Daily Attendance Reminders"
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
                label="System Maintenance Mode (Restrict Student Login)"
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

      {/* TAB 4: ROLE PERMISSIONS MATRIX */}
      {activeTab === 4 && rolePermissions.length > 0 && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Role Access Control & Permission Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grant or revoke granular CRUD and export operations per module for each role
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                sx={{ bgcolor: primaryColor, fontWeight: 700, px: 3, py: 1 }}
              >
                {isSavingPermissions ? 'Saving Role Matrix...' : 'Save Role Matrix'}
              </Button>
            </Stack>

            {/* Role Select Pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
              {rolePermissions.map((rp, idx) => (
                <Chip
                  key={rp.role}
                  label={rp.role.replace('_', ' ')}
                  color={selectedRoleIndex === idx ? 'primary' : 'default'}
                  onClick={() => setSelectedRoleIndex(idx)}
                  sx={{ fontWeight: 800, py: 2, px: 1, cursor: 'pointer' }}
                />
              ))}
            </Stack>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Managing permissions for <strong>{rolePermissions[selectedRoleIndex].role}</strong>: {rolePermissions[selectedRoleIndex].description}
            </Alert>

            {/* Permissions Matrix Table */}
            <TableContainer>
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
