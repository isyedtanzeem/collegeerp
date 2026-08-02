import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemIcon, Chip, Divider } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ActivityItem } from '../../types/index.js';

interface RecentActivityStreamProps {
  activities?: ActivityItem[];
}

const getActivityIcon = (category: string) => {
  switch (category) {
    case 'SECURITY':
    case 'PERMISSIONS':
      return <SecurityIcon color="warning" fontSize="small" />;
    case 'SUBMISSION':
    case 'GRADING':
    case 'EXAMS':
      return <AssignmentIcon color="primary" fontSize="small" />;
    case 'FINANCE':
    case 'RECEIPT':
    case 'INVOICE':
      return <ReceiptIcon color="success" fontSize="small" />;
    case 'LIBRARY':
    case 'CATALOG':
    case 'ISSUE':
      return <MenuBookIcon color="info" fontSize="small" />;
    default:
      return <CheckCircleOutlinedIcon color="action" fontSize="small" />;
  }
};

export const RecentActivityStream: React.FC<RecentActivityStreamProps> = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" /> Recent System Activities
        </Typography>
        <Chip label="Realtime Logs" size="small" variant="outlined" color="primary" />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List disablePadding>
        {activities.map((act, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
            <ListItem disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>{getActivityIcon(act.category)}</ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {act.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      By <strong>{act.user}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {act.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};
