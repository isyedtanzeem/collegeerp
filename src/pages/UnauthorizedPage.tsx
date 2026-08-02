import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 480, borderRadius: 3 }}>
        <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          403 - Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your active role does not have administrative permission to access this module. Please contact the Super Admin if you believe this is an error.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ fontWeight: 700 }}>
          Back to My Dashboard
        </Button>
      </Paper>
    </Box>
  );
};
