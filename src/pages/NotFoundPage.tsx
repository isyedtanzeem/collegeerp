import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 480, borderRadius: 3 }}>
        <FindInPageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The ERP route or module you requested could not be located.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ fontWeight: 700 }}>
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};
