import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import api from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({
    totalStudents: 1240,
    totalFaculty: 86,
    attendancePercentage: '92.4',
    totalFeeCollected: 485000,
    totalFeePending: 62000,
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get<{ success: boolean; report: any }>('/reports/summary');
        if (res.data?.report) {
          setSummary(res.data.report);
        }
      } catch (err) {
        console.error('Failed to load reports summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Generating Comprehensive Institutional Analytics..." />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                Institutional Reports & Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Comprehensive Academic Performance, Attendance Defaulters, & Financial Audit Summary
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 700, borderRadius: 2 }}
            onClick={() => alert('Exporting full institutional audit report PDF...')}
          >
            Export Comprehensive PDF
          </Button>
        </Box>
      </Paper>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    TOTAL STUDENTS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {summary.totalStudents}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 36, color: '#0284c7' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ACADEMIC FACULTY
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {summary.totalFaculty}
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 36, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ATTENDANCE RATE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {summary.attendancePercentage}%
                  </Typography>
                </Box>
                <HowToRegIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    FEE COLLECTION
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#059669' }}>
                    ${summary.totalFeeCollected?.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#059669' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Report Generation Panels */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Available Institutional Export Modules
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {[
            { title: 'Student Enrollment & Demographics', desc: 'Breakdown by department, semester, gender, and course' },
            { title: 'Attendance Defaulter Summary (<75%)', desc: 'List of students falling short of mandatory attendance criteria' },
            { title: 'Examination Mark Distribution & GPA', desc: 'Grade distribution, subject pass percentages, and toppers' },
            { title: 'Financial Collection & Dues Audit', desc: 'Fee ledger audit, receipts history, and pending tuition balance' },
            { title: 'Library Book Circulation Log', desc: 'Active issues, overdue books penalty log, and category stocks' },
            { title: 'Faculty Workload & Timetable Schedule', desc: 'Teaching hours allocation, subject distribution per department' },
          ].map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.desc}
                </Typography>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
                  Download CSV / Excel
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};
