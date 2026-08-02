import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UserRole } from '../../types/index.js';

interface RoleAnalyticsChartsProps {
  role: UserRole;
  charts?: {
    departmentEnrollment?: any[];
    userGrowthTrend?: any[];
    roleDistribution?: any[];
  };
}

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export const RoleAnalyticsCharts: React.FC<RoleAnalyticsChartsProps> = ({ role, charts }) => {
  if (!charts) return null;

  const barData = charts.departmentEnrollment || [];
  const trendData = charts.userGrowthTrend || [];
  const pieData = charts.roleDistribution || [];

  return (
    <Grid container spacing={3} sx={{ mb: 3.5 }}>
      {/* Primary Bar/Area Chart */}
      {barData.length > 0 && (
        <Grid size={{ xs: 12, lg: pieData.length > 0 ? 8 : 7 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 380, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {role === 'SUPER_ADMIN' && 'Department Enrollment & Faculty Strength'}
                {role === 'PRINCIPAL' && 'Academic Pass Rate & Attendance by Stream'}
                {role === 'HOD' && 'Course Performance & Pass Percentage'}
                {role === 'FACULTY' && 'Grade Distribution Breakdown'}
                {role === 'STUDENT' && 'Subject Attendance & Internal Marks'}
                {role === 'ACCOUNTANT' && 'Fee Revenue Categories ($)'}
                {role === 'LIBRARIAN' && 'Book Titles & Currently Issued'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interactive real-time visualization
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

                  {/* Dynamic Bars depending on role data keys */}
                  {barData[0]?.students !== undefined && <Bar dataKey="students" name="Students" fill="#0284c7" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.faculty !== undefined && <Bar dataKey="faculty" name="Faculty" fill="#10b981" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.passRate !== undefined && <Bar dataKey="passRate" name="Pass Rate %" fill="#0284c7" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.attendance !== undefined && <Bar dataKey="attendance" name="Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.marks !== undefined && <Bar dataKey="marks" name="Marks %" fill="#f59e0b" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.amount !== undefined && <Bar dataKey="amount" name="Amount ($)" fill="#10b981" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.titles !== undefined && <Bar dataKey="titles" name="Book Titles" fill="#0284c7" radius={[4, 4, 0, 0]} />}
                  {barData[0]?.issued !== undefined && <Bar dataKey="issued" name="Issued Copies" fill="#f59e0b" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Secondary Trend Line / Pie Chart */}
      {trendData.length > 0 && (
        <Grid size={{ xs: 12, lg: pieData.length > 0 ? 4 : 5 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 380, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {role === 'STUDENT' ? 'Semester CGPA Progress' : 'Monthly Performance Trend'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Historical comparison
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

                  {trendData[0]?.students !== undefined && (
                    <Line type="monotone" dataKey="students" name="Students" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                  {trendData[0]?.passRate !== undefined && (
                    <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                  {trendData[0]?.attendance !== undefined && (
                    <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                  {trendData[0]?.cgpa !== undefined && (
                    <Line type="monotone" dataKey="cgpa" name="CGPA" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                  {trendData[0]?.collected !== undefined && (
                    <Line type="monotone" dataKey="collected" name="Fee Collected ($)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                  {trendData[0]?.issued !== undefined && (
                    <Line type="monotone" dataKey="issued" name="Books Issued" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Pie Chart Distribution (if provided) */}
      {pieData.length > 0 && (
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 380, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Role Composition
              </Typography>
              <Typography variant="caption" color="text.secondary">
                User distribution across system
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};
