import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Tooltip,
  Stack,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventIcon from '@mui/icons-material/Event';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../context/AuthContext.js';

interface NotificationItem {
  id: string;
  category: 'ASSIGNMENT' | 'FEE' | 'ATTENDANCE' | 'EXAM' | 'LIBRARY';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'ASSIGNMENT',
    title: 'Assignment Deadline Reminder',
    message: 'Web Development Assignment #3 "React Hooks & Express Server" is due tomorrow at 11:59 PM.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'notif-2',
    category: 'ATTENDANCE',
    title: 'Attendance Alert (<75%)',
    message: 'Your overall attendance in Discrete Mathematics (MA301) has dropped to 72.5%. Please contact your course instructor.',
    timestamp: '5 hours ago',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'notif-3',
    category: 'EXAM',
    title: 'Mid-Semester Exam Schedule Published',
    message: 'Spring 2026 Mid-Semester Examination timetable is live. Exams begin on April 12, 2026.',
    timestamp: '1 day ago',
    isRead: true,
    priority: 'MEDIUM',
  },
  {
    id: 'notif-4',
    category: 'LIBRARY',
    title: 'Library Book Due Date Notice',
    message: 'The issued book "Clean Code by Robert C. Martin" is due for return in 2 days (April 2, 2026).',
    timestamp: '2 days ago',
    isRead: true,
    priority: 'NORMAL',
  },
  {
    id: 'notif-5',
    category: 'FEE',
    title: 'Tuition Fee Receipt Generated',
    message: 'Payment of ₹45,000 for Spring Semester 2026 tuition fee confirmed. Payment Receipt #REC-8921 available.',
    timestamp: '3 days ago',
    isRead: true,
    priority: 'NORMAL',
  },
];

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Preferences toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [feeAlerts, setFeeAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ASSIGNMENT':
        return <AssignmentTurnedInIcon color="primary" />;
      case 'FEE':
        return <AccountBalanceWalletIcon color="success" />;
      case 'ATTENDANCE':
        return <HowToRegIcon color="error" />;
      case 'EXAM':
        return <EventIcon color="warning" />;
      case 'LIBRARY':
      default:
        return <LocalLibraryIcon color="info" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === 'UNREAD') return !n.isRead;
    if (selectedFilter !== 'ALL') return n.category === selectedFilter;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
            Notifications & Alerts Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated with assignment due dates, attendance thresholds, fee reminders, exam schedules, and library notices.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllRead}
              sx={{ borderRadius: 2 }}
            >
              Mark All as Read
            </Button>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Notifications List */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label={`All (${notifications.length})`}
                onClick={() => setSelectedFilter('ALL')}
                color={selectedFilter === 'ALL' ? 'primary' : 'default'}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Unread (${unreadCount})`}
                onClick={() => setSelectedFilter('UNREAD')}
                color={selectedFilter === 'UNREAD' ? 'error' : 'default'}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Assignments"
                onClick={() => setSelectedFilter('ASSIGNMENT')}
                color={selectedFilter === 'ASSIGNMENT' ? 'primary' : 'default'}
                variant="outlined"
              />
              <Chip
                label="Attendance"
                onClick={() => setSelectedFilter('ATTENDANCE')}
                color={selectedFilter === 'ATTENDANCE' ? 'error' : 'default'}
                variant="outlined"
              />
              <Chip
                label="Fee Dues"
                onClick={() => setSelectedFilter('FEE')}
                color={selectedFilter === 'FEE' ? 'success' : 'default'}
                variant="outlined"
              />
              <Chip
                label="Exams"
                onClick={() => setSelectedFilter('EXAM')}
                color={selectedFilter === 'EXAM' ? 'warning' : 'default'}
                variant="outlined"
              />
              <Chip
                label="Library"
                onClick={() => setSelectedFilter('LIBRARY')}
                color={selectedFilter === 'LIBRARY' ? 'info' : 'default'}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {filteredNotifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  No notifications in this category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You are all caught up with your academic alerts!
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredNotifications.map((notif, index) => (
                  <React.Fragment key={notif.id}>
                    {index > 0 && <Divider component="li" sx={{ my: 1.5 }} />}
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                        borderLeft: notif.isRead ? 'none' : '4px solid #0284c7',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 44, mt: 0.5 }}>
                        {getCategoryIcon(notif.category)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: notif.isRead ? 600 : 800 }}>
                              {notif.title}
                            </Typography>
                            {notif.priority === 'HIGH' && (
                              <Chip label="High Priority" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                            )}
                            <Chip label={notif.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                          </Box>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {notif.timestamp}
                            </Typography>
                          </Box>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={0.5}>
                          {!notif.isRead && (
                            <Tooltip title="Mark as Read">
                              <IconButton size="small" color="primary" onClick={() => handleMarkAsRead(notif.id)}>
                                <CheckCircleOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Alert">
                            <IconButton size="small" color="error" onClick={() => handleDelete(notif.id)}>
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Notification Preferences */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon color="primary" /> Notification Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control which system alerts and real-time reminders you receive on your student dashboard.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch checked={assignmentAlerts} onChange={(e) => setAssignmentAlerts(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Assignment Reminders</Typography>
                    <Typography variant="caption" color="text.secondary">Alerts 24 hours before submission deadline</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={attendanceAlerts} onChange={(e) => setAttendanceAlerts(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Low Attendance Warnings</Typography>
                    <Typography variant="caption" color="text.secondary">Notify if attendance falls below 75%</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={feeAlerts} onChange={(e) => setFeeAlerts(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Fee & Account Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">Receipts and overdue pending balance notices</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Email Broadcast Sync</Typography>
                    <Typography variant="caption" color="text.secondary">Forward urgent notices to institutional email</Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
