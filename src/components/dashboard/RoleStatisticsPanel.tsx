import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { StatItem } from '../../types/index.js';

interface RoleStatisticsPanelProps {
  statistics?: StatItem[];
}

export const RoleStatisticsPanel: React.FC<RoleStatisticsPanelProps> = ({ statistics }) => {
  if (!statistics || statistics.length === 0) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" /> Operational Statistics & KPI Benchmarks
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Summary targets & live performance indices
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {statistics.map((stat, idx) => (
          <Grid size={{ xs: 6, sm: 3 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
