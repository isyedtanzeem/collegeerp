import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

interface ForgotPasswordInputs {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoResetToken, setDemoResetToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    defaultValues: {
      email: 'student@college.edu',
    },
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoResetToken(null);
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(data.email);
      setSuccessMsg(res.message || 'Password reset link sent to your registered email.');
      if (res.resetToken) {
        setDemoResetToken(res.resetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
          <LockResetIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your institutional email to receive reset instructions
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {demoResetToken && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderColor: 'primary.main', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
            Demo Mode Active: Reset Token Generated
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            In development mode, token email is simulated. Click below to reset your password immediately:
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            fullWidth
            onClick={() => navigate(`/reset-password/${demoResetToken}`)}
            sx={{ fontWeight: 700 }}
          >
            Go To Reset Password Page
          </Button>
        </Paper>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Registered Email Address"
          autoComplete="email"
          autoFocus
          {...register('email', {
            required: 'Email address is required',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
        >
          {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <MuiLink
          component={Link}
          to="/login"
          underline="hover"
          variant="body2"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
        >
          <ArrowBackIcon fontSize="small" /> Back to Sign In
        </MuiLink>
      </Box>
    </Box>
  );
};
