import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { Logo } from '../../components/common/Logo';

interface LoginFormInputs {
  email: string;
  password: string;
}

const DEMO_ROLES: { role: UserRole; title: string; email: string; desc: string; color: string }[] = [
  { role: 'SUPER_ADMIN', title: 'Super Admin', email: 'superadmin@college.edu', desc: 'Full System Access', color: '#ef4444' },
  { role: 'PRINCIPAL', title: 'Principal', email: 'principal@college.edu', desc: 'Academic Head', color: '#1e293b' },
  { role: 'HOD', title: 'HOD', email: 'hod.cs@college.edu', desc: 'Department Head', color: '#0284c7' },
  { role: 'FACULTY', title: 'Faculty', email: 'faculty@college.edu', desc: 'Teacher / Instructor', color: '#10b981' },
  { role: 'STUDENT', title: 'Student', email: 'student@college.edu', desc: 'Enrolled Student', color: '#f59e0b' },
  { role: 'ACCOUNTANT', title: 'Accountant', email: 'accountant@college.edu', desc: 'Financial Desk', color: '#8b5cf6' },
  { role: 'LIBRARIAN', title: 'Librarian', email: 'librarian@college.edu', desc: 'Library Catalog', color: '#64748b' },
];

export const LoginPage: React.FC = () => {
  const { login, quickLoginRole } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'superadmin@college.edu',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = (email: string, role: UserRole) => {
    setValue('email', email);
    setValue('password', 'password123');
    quickLoginRole(role).then(() => navigate('/dashboard'));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Brand Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Box sx={{ mb: 1.5 }}>
          <Logo size="large" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Sign in to access your institutional portal
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Login Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          autoFocus
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <MuiLink
            component={Link}
            to="/forgot-password"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            Forgot Password?
          </MuiLink>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 2.5, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </Button>
      </Box>

      {/* Quick Role Tester Bar */}
      <Divider sx={{ my: 3 }}>
        <Chip icon={<TouchAppIcon />} label="1-Click Quick Demo Login (Select Role)" size="small" />
      </Divider>

      <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mb: 2 }}>
        Click any role below to automatically log in as that user:
      </Typography>

      <Grid container spacing={1}>
        {DEMO_ROLES.map((item) => (
          <Grid size={{ xs: 6, sm: 4 }} key={item.role}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => handleDemoSelect(item.email, item.role)}
              sx={{
                py: 0.8,
                px: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderColor: '#e2e8f0',
                color: 'text.primary',
                '&:hover': {
                  borderColor: item.color,
                  bgcolor: `${item.color}10`,
                },
              }}
            >
              <Typography variant="caption" sx={{ color: item.color, lineHeight: 1, fontWeight: 700 }}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }} noWrap>
                {item.desc}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
