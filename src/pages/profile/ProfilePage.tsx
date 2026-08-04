import React, { useState } from 'react';
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
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../context/AuthContext.js';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const isStudent = user?.role === 'STUDENT';

  // Editable Student Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || '124 College Avenue, Campus Quarter, City');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '+91 98123 45678 (Father)');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // Non-editable Student / Academic Metadata
  const rollNo = user?.rollNo || user?.enrollmentNo || 'CS2024089';
  const studentId = user?._id || 'STD-892024';
  const department = user?.department || 'Computer Science & Engineering';
  const course = user?.course || 'B.Tech Computer Science';
  const semester = user?.semester || 4;
  const admissionNumber = 'ADM-2024-8841';
  const academicRecord = 'CGPA: 3.82 / 4.0 (Class Rank #4)';

  // Guardian Information
  const guardianName = 'Rajesh Kumar';
  const guardianRelation = 'Father';
  const guardianPhone = '+91 98123 45678';

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name,
        phone,
        address,
        emergencyContact,
        avatar: avatarUrl,
      });
      setProfileMsg({ type: 'success', text: 'Personal contact profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%', pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        {isStudent ? 'My Student Profile' : 'User Account & Profile'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {isStudent
          ? 'Manage your personal contact details, emergency phone number, residential address, profile picture, and security credentials.'
          : 'View and manage institutional account parameters and credentials.'}
      </Typography>

      {/* Profile Header Banner */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarUrl || user.avatar || ''}
              sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 800, border: '3px solid #0284c7' }}
            >
              {user.name.charAt(0)}
            </Avatar>
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {user.name}
              </Typography>
              <Chip label={user.role.replace('_', ' ')} color="primary" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Institutional Email: <strong>{user.email}</strong>
            </Typography>

            {isStudent && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Chip label={`Roll No: ${rollNo}`} size="small" variant="outlined" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                <Chip label={`Sem ${semester}`} size="small" color="info" sx={{ fontWeight: 700 }} />
                <Chip label={department} size="small" variant="outlined" />
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Non-Editable Academic Metadata (Restricted View) */}
      {isStudent && (
        <Paper sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0', bgcolor: 'grey.50' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" /> Official Academic Credentials (Read Only)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Official student records locked by Institutional Administration. Contact Academic Cell for corrections.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Roll Number" fullWidth value={rollNo} disabled slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Student System ID" fullWidth value={studentId} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Admission Number" fullWidth value={admissionNumber} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Department" fullWidth value={department} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Enrolled Course" fullWidth value={course} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField label="Current Semester" fullWidth value={`Semester ${semester}`} disabled />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Academic Standing & CGPA" fullWidth value={academicRecord} disabled helperText="Verified by University Examination Board" />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Guardian Details Card */}
      {isStudent && (
        <Paper sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FamilyRestroomIcon color="primary" /> Guardian & Parent Information
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Registered parent or official legal guardian information.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Guardian Name" fullWidth value={guardianName} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Relationship" fullWidth value={guardianRelation} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Guardian Phone" fullWidth value={guardianPhone} disabled />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Editable Contact Profile Form */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContactPhoneIcon color="primary" /> Editable Personal Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Students are permitted to update their primary phone contact, residential address, emergency phone, and profile picture.
        </Typography>

        {profileMsg && (
          <Alert severity={profileMsg.type} sx={{ mb: 3, borderRadius: 2 }}>
            {profileMsg.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSaveProfile}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone Contact Number *" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Emergency Contact Details *" fullWidth value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required helperText="e.g. +91 98123 45678 (Father)" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Profile Picture Avatar URL" fullWidth value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." helperText="Enter direct image URL for avatar picture" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Residential Address *" fullWidth multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" size="large" startIcon={<SaveIcon />} disabled={isSavingProfile} sx={{ fontWeight: 800, px: 4, borderRadius: 2 }}>
              {isSavingProfile ? 'Saving...' : 'Save Personal Details'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Security & Password Change */}
      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="primary" /> Security & Password Update
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verify current password to update account login password.
        </Typography>

        {passwordMsg && (
          <Alert severity={passwordMsg.type} sx={{ mb: 3, borderRadius: 2 }}>
            {passwordMsg.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleChangePassword}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Current Password" type="password" fullWidth required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="New Password" type="password" fullWidth required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} helperText="Minimum 6 characters" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Confirm New Password" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="warning" size="medium" startIcon={<LockIcon />} disabled={isChangingPassword} sx={{ fontWeight: 800, borderRadius: 2 }}>
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
