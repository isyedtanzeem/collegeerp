import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { statsService } from '../../services/statsService.js';
import { noticeService } from '../../services/noticeService.js';
import { DashboardData, Notice } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { RoleMetricCards } from '../../components/dashboard/RoleMetricCards.js';
import { RoleAnalyticsCharts } from '../../components/dashboard/RoleAnalyticsCharts.js';
import { RoleStatisticsPanel } from '../../components/dashboard/RoleStatisticsPanel.js';
import { RoleQuickActions } from '../../components/dashboard/RoleQuickActions.js';
import { RecentActivityStream } from '../../components/dashboard/RecentActivityStream.js';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [statsRes, noticeRes] = await Promise.all([
          statsService.getDashboardStats(),
          noticeService.getNotices(),
        ]);
        setData(statsRes);
        setNotices(noticeRes.notices ? noticeRes.notices.slice(0, 5) : []);
      } catch (err) {
        console.error('[Dashboard] Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role, token]);

  if (isLoading || !user) {
    return <LoadingSpinner message="Fetching live ERP dashboard metrics..." />;
  }

  const roleTitle = user.role.replace('_', ' ');

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justify: 'space-between',
              alignItems: { sm: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Chip
                label={`${roleTitle} Workspace`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, mb: 1 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, {user.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 650 }}>
                {user.department ? `Department of ${user.department}` : 'Astra College Institutional Management System'}
                {user.designation ? ` • ${user.designation}` : ''}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/notices')}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Notice Board
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 1. Key Operational Metric Cards */}
      <RoleMetricCards cards={data?.stats?.cards} />

      {/* 2. Interactive Charts Section (Bar, Line, Pie) */}
      <RoleAnalyticsCharts role={user.role} charts={data?.stats?.charts} />

      {/* 3. KPI Statistics Breakdown */}
      <RoleStatisticsPanel statistics={data?.stats?.statistics} />

      {/* 4. Grid Section: Quick Actions, Recent Activities & Campus Notices */}
      <Grid container spacing={3}>
        {/* Quick Actions Shortcuts */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RoleQuickActions actions={data?.stats?.quickActions} />
        </Grid>

        {/* Recent System Activity Stream */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RecentActivityStream activities={data?.stats?.recentActivities} />
        </Grid>

        {/* Campus Notice Board Feed */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon color="primary" /> Official Campus Circulars
              </Typography>
              <Chip label="Live Feed" size="small" color="primary" variant="outlined" />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {notices.map((notice, index) => (
                <React.Fragment key={notice._id}>
                  {index > 0 && <Divider component="li" sx={{ my: 1 }} />}
                  <ListItem alignItems="flex-start" disableGutters>
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      {notice.isImportant ? (
                        <PriorityHighIcon color="error" fontSize="small" />
                      ) : (
                        <CheckCircleIcon color="action" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {notice.title}
                        </Typography>
                      }
                      secondary={
                        <Box component="div" sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notice.content}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                            Posted by {notice.postedBy}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
