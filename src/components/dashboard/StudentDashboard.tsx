import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CampaignIcon from '@mui/icons-material/Campaign';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ClassIcon from '@mui/icons-material/Class';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Notice } from '../../types/index.js';

interface StudentDashboardProps {
  notices: Notice[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ notices }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mocked/Default Student Stats
  const attendancePct = 88.5;
  const currentSemester = user?.semester || 4;
  const currentCGPA = '3.82 / 4.0';
  const pendingFee = '₹0.00 (All Dues Clear)';

  const todayClasses = [
    { code: 'CS301', title: 'Data Structures & Algorithms', time: '09:00 AM - 10:30 AM', room: 'Lab 204', faculty: 'Dr. Robert Vance' },
    { code: 'CS302', title: 'Database Management Systems', time: '11:00 AM - 12:30 PM', room: 'LH 102', faculty: 'Prof. Anita Sharma' },
    { code: 'CS304', title: 'Full Stack Web Development', time: '02:00 PM - 03:30 PM', room: 'Lab 108', faculty: 'Er. David Miller' },
  ];

  const pendingAssignments = [
    { id: 'asgn-1', title: 'Express & MongoDB REST API', subject: 'CS304', dueDate: 'Tomorrow, 11:59 PM', priority: 'HIGH' },
    { id: 'asgn-2', title: 'B-Tree & Red-Black Tree Implementation', subject: 'CS301', dueDate: 'April 5, 2026', priority: 'MEDIUM' },
  ];

  const upcomingExams = [
    { id: 'exam-1', subject: 'CS301 - Data Structures', date: 'April 12, 2026', time: '10:00 AM', room: 'Exam Hall A' },
    { id: 'exam-2', subject: 'CS302 - DBMS', date: 'April 14, 2026', time: '10:00 AM', room: 'Exam Hall B' },
  ];

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* 1. Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
          <Avatar
            src={user?.avatar || ''}
            alt={user?.name || 'Student'}
            sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 800, border: '3px solid #38bdf8' }}
          >
            {user?.name ? user.name.charAt(0) : 'S'}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label="Student Portal"
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.4)' }}
              />
              <Chip
                label={`Roll No: ${user?.rollNo || user?.enrollmentNo || 'CS2024089'}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 600, fontFamily: 'monospace' }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Welcome back, {user?.name || 'Student'}!
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Department of {user?.department || 'Computer Science & Engineering'} • Semester {currentSemester}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/profile')}
              startIcon={<PersonIcon />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              My Profile
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 2. Quick Statistics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Attendance Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Overall Attendance
                </Typography>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 36, height: 36 }}>
                  <HowToRegIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                {attendancePct}%
              </Typography>
              <LinearProgress variant="determinate" value={attendancePct} color="success" sx={{ height: 6, borderRadius: 3, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Target: &gt;75% • All subjects eligible
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Semester Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Academic Term
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
                  <SchoolIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Sem {currentSemester}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Spring 2026 • 5 Enrolled Subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CGPA Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Current CGPA / Grade
                </Typography>
                <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 36, height: 36 }}>
                  <GradeIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                3.82
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Top 5% in class • 68 Earned Credits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Fee Summary Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Pending Fee Dues
                </Typography>
                <Avatar sx={{ bgcolor: 'secondary.50', color: 'secondary.main', width: 36, height: 36 }}>
                  <AccountBalanceWalletIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
                ₹0.00
              </Typography>
              <Chip label="All Fee Dues Cleared" size="small" color="success" sx={{ fontWeight: 700, mt: 0.5 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Main Grid: Timetable, Assignments, Exams & Circulars */}
      <Grid container spacing={3}>
        {/* Today's Class Schedule */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" /> Today's Lecture Schedule
              </Typography>
              <Button size="small" onClick={() => navigate('/timetable')} endIcon={<ArrowForwardIcon />}>
                Full Timetable
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {todayClasses.map((cls, idx) => (
                <React.Fragment key={cls.code}>
                  {idx > 0 && <Divider component="li" sx={{ my: 1.5 }} />}
                  <ListItem disableGutters alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 44, mt: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 800, fontSize: '0.8rem' }}>
                        {cls.code.substring(0, 2)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {cls.code}: {cls.title}
                          </Typography>
                          <Chip label={cls.time} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Instructor: <strong>{cls.faculty}</strong> • Location: <strong>{cls.room}</strong>
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Assignments & Upcoming Exams */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {/* Pending Assignments Card */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="warning" /> Pending Assignments (2)
                </Typography>
                <Button size="small" onClick={() => navigate('/assignments')} endIcon={<ArrowForwardIcon />}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {pendingAssignments.map((asgn, idx) => (
                  <React.Fragment key={asgn.id}>
                    {idx > 0 && <Divider component="li" sx={{ my: 1 }} />}
                    <ListItem disableGutters>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {asgn.title} ({asgn.subject})
                            </Typography>
                            <Chip label={asgn.dueDate} size="small" color={asgn.priority === 'HIGH' ? 'error' : 'warning'} sx={{ fontWeight: 700 }} />
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Upcoming Examinations Card */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon color="info" /> Upcoming Examinations
                </Typography>
                <Button size="small" onClick={() => navigate('/marks')} endIcon={<ArrowForwardIcon />}>
                  Results & Exams
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {upcomingExams.map((ex, idx) => (
                  <React.Fragment key={ex.id}>
                    {idx > 0 && <Divider component="li" sx={{ my: 1 }} />}
                    <ListItem disableGutters>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {ex.subject}
                          </Typography>
                        }
                        secondary={`Date: ${ex.date} at ${ex.time} • Room: ${ex.room}`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>

        {/* Quick Shortcuts Bar */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Student Quick Navigation Shortcuts
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<ClassIcon />} onClick={() => navigate('/subjects')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  My Subjects
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<HowToRegIcon />} onClick={() => navigate('/attendance')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  Attendance
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<GradeIcon />} onClick={() => navigate('/marks')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  Results
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<MenuBookIcon />} onClick={() => navigate('/materials')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  Study Materials
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<AccountBalanceWalletIcon />} onClick={() => navigate('/fees')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  Fees & Dues
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<EventBusyIcon />} onClick={() => navigate('/leaves')} sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
                  Leave Requests
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
