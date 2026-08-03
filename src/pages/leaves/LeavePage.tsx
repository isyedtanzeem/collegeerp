import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Tab,
  Tabs,
  Avatar,
  InputAdornment,
  Tooltip,
  Badge,
} from '@mui/material';

import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SendIcon from '@mui/icons-material/Send';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { useAuth } from '../../context/AuthContext.js';
import { LeaveRequest, LeaveStats, Department, Student, Faculty } from '../../types/index.js';
import { leaveService, ApplyLeavePayload } from '../../services/leaveService.js';
import { departmentService } from '../../services/departmentService.js';
import { studentService } from '../../services/studentService.js';
import { facultyService } from '../../services/facultyService.js';

export const LeavePage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab Index
  const [activeTab, setActiveTab] = useState<number>(0);

  // Stats & Master Data
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState<boolean>(false);

  // Filters
  const [applicantTypeFilter, setApplicantTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  // Personal History
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [loadingMyLeaves, setLoadingMyLeaves] = useState<boolean>(false);

  // Dialog States
  // 1. Apply Leave Modal
  const [openApplyDialog, setOpenApplyDialog] = useState<boolean>(false);
  const [applyType, setApplyType] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [applyFormData, setApplyFormData] = useState<{
    selectedUserId: string;
    applicantName: string;
    applicantRollNoOrCode: string;
    department: string;
    leaveType: 'CASUAL' | 'MEDICAL' | 'DUTY_LEAVE' | 'MATERNITY_PATERNITY' | 'EARNED' | 'OTHER';
    reason: string;
    startDate: string;
    endDate: string;
    attachmentFile: File | null;
  }>({
    selectedUserId: '',
    applicantName: '',
    applicantRollNoOrCode: '',
    department: 'Computer Science & Engineering',
    leaveType: 'CASUAL',
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    attachmentFile: null,
  });

  // 2. Approval Workflow Modal
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState<boolean>(false);
  const [selectedLeaveToApprove, setSelectedLeaveToApprove] = useState<LeaveRequest | null>(null);
  const [workflowComments, setWorkflowComments] = useState<string>('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // FETCH DATA
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await leaveService.getStats();
      if (res.success) setStats(res.stats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    try {
      const res = await leaveService.getLeaves({
        applicantType: applicantTypeFilter,
        department: departmentFilter,
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success) setLeaves(res.leaves);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingLeaves(false);
    }
  }, [applicantTypeFilter, departmentFilter, statusFilter, searchQuery]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [deptRes, studRes, facRes] = await Promise.all([
        departmentService.getDepartments(),
        studentService.getStudents(),
        facultyService.getFaculty(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (studRes.success) setStudents(studRes.students);
      if (facRes.success) setFaculties(facRes.faculty);
    } catch (err: any) {
      console.error('Error fetching master data:', err);
    }
  }, []);

  const fetchMyLeaves = useCallback(async () => {
    setLoadingMyLeaves(true);
    try {
      const res = await leaveService.getLeaves({ applicantId: user?._id });
      if (res.success) setMyLeaves(res.leaves);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMyLeaves(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchStats();
    fetchMasterData();
  }, [fetchStats, fetchMasterData]);

  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) fetchLeaves();
    if (activeTab === 2) fetchMyLeaves();
  }, [activeTab, fetchLeaves, fetchMyLeaves]);

  // APPLY LEAVE DIALOG HANDLERS
  const handleOpenApplyModal = (type: 'STUDENT' | 'FACULTY') => {
    setApplyType(type);

    let defaultName = user?.name || '';
    let defaultCode = user?.enrollmentNo || user?.email || '';
    let defaultDept = user?.department || (departments[0]?.name || 'Computer Science & Engineering');

    if (type === 'STUDENT' && students.length > 0) {
      const matched = students.find((s) => s.email === user?.email) || students[0];
      defaultName = matched.name;
      defaultCode = matched.studentId || matched.admissionNumber || 'STU-1001';
      defaultDept = matched.department || defaultDept;
    } else if (type === 'FACULTY' && faculties.length > 0) {
      const matched = faculties.find((f) => f.email === user?.email) || faculties[0];
      defaultName = matched.name;
      defaultCode = matched.employeeId || 'FAC-1001';
      defaultDept = matched.department || defaultDept;
    }

    setApplyFormData({
      selectedUserId: user?._id || 'USER-101',
      applicantName: defaultName,
      applicantRollNoOrCode: defaultCode,
      department: defaultDept,
      leaveType: 'CASUAL',
      reason: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attachmentFile: null,
    });

    setOpenApplyDialog(true);
  };

  const handleSelectUserChange = (userId: string) => {
    if (applyType === 'STUDENT') {
      const st = students.find((s) => s._id === userId);
      if (st) {
        setApplyFormData((prev) => ({
          ...prev,
          selectedUserId: st._id,
          applicantName: st.name,
          applicantRollNoOrCode: st.studentId || st.admissionNumber || 'STU-1001',
          department: st.department || prev.department,
        }));
      }
    } else {
      const fc = faculties.find((f) => f._id === userId);
      if (fc) {
        setApplyFormData((prev) => ({
          ...prev,
          selectedUserId: fc._id,
          applicantName: fc.name,
          applicantRollNoOrCode: fc.employeeId || 'FAC-1001',
          department: fc.department || prev.department,
        }));
      }
    }
  };

  const handleExecuteApplyLeave = async () => {
    if (!applyFormData.applicantName || !applyFormData.reason) {
      showSnackbar('Applicant name and reason for leave are required.', 'warning');
      return;
    }

    try {
      const payload: ApplyLeavePayload = {
        applicantType: applyType,
        applicantId: applyFormData.selectedUserId || user?._id || 'USER-101',
        applicantName: applyFormData.applicantName,
        applicantRollNoOrCode: applyFormData.applicantRollNoOrCode,
        department: applyFormData.department,
        leaveType: applyFormData.leaveType,
        reason: applyFormData.reason,
        startDate: applyFormData.startDate,
        endDate: applyFormData.endDate,
        attachment: applyFormData.attachmentFile,
      };

      const res = await leaveService.applyLeave(payload);
      if (res.success) {
        showSnackbar(res.message, 'success');
        setOpenApplyDialog(false);
        fetchLeaves();
        fetchStats();
        fetchMyLeaves();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error applying for leave', 'error');
    }
  };

  // APPROVAL WORKFLOW HANDLERS
  const handleOpenWorkflowModal = (leave: LeaveRequest) => {
    setSelectedLeaveToApprove(leave);
    setWorkflowComments(
      leave.approverComments ||
        (leave.leaveType === 'MEDICAL'
          ? 'Medical report verified by medical board.'
          : 'Leave request reviewed and approved.')
    );
    setOpenWorkflowDialog(true);
  };

  const handleExecuteWorkflowAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLeaveToApprove) return;

    try {
      const res = await leaveService.approveOrRejectLeave(selectedLeaveToApprove._id, {
        status,
        approverId: user?._id || 'APP-101',
        approverName: user?.name || 'HOD / Approval Authority',
        approverRole: user?.role || 'HOD',
        approverComments: workflowComments,
      });

      if (res.success) {
        showSnackbar(res.message, status === 'APPROVED' ? 'success' : 'info');
        setOpenWorkflowDialog(false);
        fetchLeaves();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error updating workflow status', 'error');
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave application?')) return;
    try {
      const res = await leaveService.cancelLeave(id);
      if (res.success) {
        showSnackbar('Leave application cancelled.', 'info');
        fetchLeaves();
        fetchMyLeaves();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error cancelling leave', 'error');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!window.confirm('Delete this leave record permanently?')) return;
    try {
      const res = await leaveService.deleteLeave(id);
      if (res.success) {
        showSnackbar('Leave record deleted.', 'info');
        fetchLeaves();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error deleting leave', 'error');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* HEADER BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 46, height: 46 }}>
                <EventBusyIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Leave Management & Approval Desk
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Student & Faculty Leave Applications, Multi-tier Approval Workflows & Document Verifications
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchStats();
                fetchLeaves();
                fetchMyLeaves();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SchoolIcon />}
              onClick={() => handleOpenApplyModal('STUDENT')}
            >
              Apply Student Leave
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonIcon />}
              onClick={() => handleOpenApplyModal('FACULTY')}
            >
              Apply Faculty Leave
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* KPI METRICS DASHBOARD */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Total Applications
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
                  <EventBusyIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.totalLeaves || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Student: {stats?.studentLeaves || 0} | Faculty: {stats?.facultyLeaves || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Pending Approvals
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 36, height: 36 }}>
                  <PendingActionsIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.pendingLeaves || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                Awaiting HOD / Authority action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Approved Leaves
                </Typography>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 36, height: 36 }}>
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.approvedLeaves || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                Granted & Sanctioned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Rejected / Cancelled
                </Typography>
                <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', width: 36, height: 36 }}>
                  <CancelIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.rejectedLeaves || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                With decision comments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABS NAVIGATION */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={
              <Badge badgeContent={stats?.pendingLeaves || 0} color="warning">
                <RateReviewIcon />
              </Badge>
            }
            iconPosition="start"
            label="Approval Queue & All Leaves"
          />
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Student Leave Desk" />
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="My Leave History" />
        </Tabs>

        {/* TAB 0: APPROVAL QUEUE & ALL LEAVES */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search name, code, reason, leave type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Applicant Type</InputLabel>
                  <Select
                    value={applicantTypeFilter}
                    label="Applicant Type"
                    onChange={(e) => setApplicantTypeFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Applicants</MenuItem>
                    <MenuItem value="STUDENT">Student Only</MenuItem>
                    <MenuItem value="FACULTY">Faculty Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending Approval</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Departments</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {loadingLeaves ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading Leave Records...
                </Typography>
              </Box>
            ) : leaves.length === 0 ? (
              <Alert severity="info">No leave applications match the selected criteria.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Applicant Info</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Leave Category & Dept</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dates & Duration</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason / Purpose</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Attachment</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Workflow Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.map((leave) => {
                      const startDateStr = new Date(leave.startDate).toLocaleDateString();
                      const endDateStr = new Date(leave.endDate).toLocaleDateString();

                      return (
                        <TableRow key={leave._id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  bgcolor: leave.applicantType === 'STUDENT' ? 'primary.main' : 'secondary.main',
                                  width: 32,
                                  height: 32,
                                  fontSize: 14,
                                }}
                              >
                                {leave.applicantType === 'STUDENT' ? 'S' : 'F'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {leave.applicantName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {leave.applicantRollNoOrCode} ({leave.applicantType})
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={leave.leaveType.replace('_', ' ')}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {leave.department}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {startDateStr} - {endDateStr}
                            </Typography>
                            <Chip
                              label={`${leave.totalDays} Day${leave.totalDays > 1 ? 's' : ''}`}
                              size="small"
                              color="info"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </TableCell>

                          <TableCell sx={{ maxWidth: 220 }}>
                            <Tooltip title={leave.reason}>
                              <Typography
                                variant="caption"
                                color="text.primary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {leave.reason}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          <TableCell>
                            {leave.attachmentUrl ? (
                              <Button
                                size="small"
                                component="a"
                                href={leave.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DownloadIcon fontSize="small" />}
                              >
                                {leave.attachmentName || 'Document.pdf'}
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={leave.status}
                              size="small"
                              color={
                                leave.status === 'APPROVED'
                                  ? 'success'
                                  : leave.status === 'REJECTED'
                                  ? 'error'
                                  : leave.status === 'PENDING'
                                  ? 'warning'
                                  : 'default'
                              }
                              sx={{ fontWeight: 700 }}
                            />
                            {leave.approverComments && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                "{leave.approverComments}"
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="secondary"
                                startIcon={<RateReviewIcon />}
                                onClick={() => handleOpenWorkflowModal(leave)}
                              >
                                Review & Decide
                              </Button>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteLeave(leave._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 1: STUDENT LEAVE DESK */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Student Leave Applications Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Filter and sanction student leave requests with attached doctor certificates or official event duty notes.
            </Typography>

            <Grid container spacing={2.5}>
              {leaves
                .filter((l) => l.applicantType === 'STUDENT')
                .map((leave) => (
                  <Grid size={{ xs: 12, md: 6 }} key={leave._id}>
                    <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box>
                            <Chip label={leave.leaveType} size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {leave.applicantName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Roll No: {leave.applicantRollNoOrCode} • {leave.department}
                            </Typography>
                          </Box>

                          <Chip
                            label={leave.status}
                            size="small"
                            color={
                              leave.status === 'APPROVED'
                                ? 'success'
                                : leave.status === 'REJECTED'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {leave.reason}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Duration
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} Days)
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Attachment Document
                            </Typography>
                            {leave.attachmentUrl ? (
                              <Button
                                size="small"
                                component="a"
                                href={leave.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DownloadIcon fontSize="small" />}
                              >
                                {leave.attachmentName || 'View Attachment'}
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                None
                              </Typography>
                            )}
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<RateReviewIcon />}
                            onClick={() => handleOpenWorkflowModal(leave)}
                          >
                            Approval Action
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* TAB 2: MY LEAVE HISTORY & TRACKING */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              My Submitted Leave Applications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track approval status, download sanctioned documents, and check decision feedback from department HOD / Principal.
            </Typography>

            {loadingMyLeaves ? (
              <CircularProgress />
            ) : myLeaves.length === 0 ? (
              <Alert severity="info">You have not submitted any leave applications yet.</Alert>
            ) : (
              <Grid container spacing={2.5}>
                {myLeaves.map((leave) => (
                  <Grid size={{ xs: 12, md: 6 }} key={leave._id}>
                    <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box>
                            <Chip label={leave.leaveType} size="small" color="primary" sx={{ mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {leave.leaveType.replace('_', ' ')} Leave Request
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Submitted on {new Date(leave.createdAt || Date.now()).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Chip
                            label={leave.status}
                            size="small"
                            color={
                              leave.status === 'APPROVED'
                                ? 'success'
                                : leave.status === 'REJECTED'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </Stack>

                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {leave.reason}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              From Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(leave.startDate).toLocaleDateString()}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              To Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} Days)
                            </Typography>
                          </Grid>
                        </Grid>

                        {leave.approverComments && (
                          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                              Authority Remarks ({leave.approverName || 'HOD'}):
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{leave.approverComments}"
                            </Typography>
                          </Paper>
                        )}

                        {leave.status === 'PENDING' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelLeave(leave._id)}
                          >
                            Cancel Application
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* DIALOG 1: APPLY LEAVE MODAL */}
      <Dialog
        open={openApplyDialog}
        onClose={() => setOpenApplyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Apply for {applyType === 'STUDENT' ? 'Student' : 'Faculty'} Leave
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Applicant Selector */}
            <Grid size={{ xs: 12, md: 6 }}>
              {applyType === 'STUDENT' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={applyFormData.selectedUserId}
                    label="Select Student"
                    onChange={(e) => handleSelectUserChange(e.target.value)}
                  >
                    {students.map((st) => (
                      <MenuItem key={st._id} value={st._id}>
                        {st.name} ({st.studentId || st.admissionNumber || 'STU'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Faculty</InputLabel>
                  <Select
                    value={applyFormData.selectedUserId}
                    label="Select Faculty"
                    onChange={(e) => handleSelectUserChange(e.target.value)}
                  >
                    {faculties.map((fc) => (
                      <MenuItem key={fc._id} value={fc._id}>
                        {fc.name} ({fc.employeeId || 'FAC'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Applicant Name"
                value={applyFormData.applicantName}
                onChange={(e) => setApplyFormData((p) => ({ ...p, applicantName: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label={applyType === 'STUDENT' ? 'Roll / Enrollment No' : 'Employee ID'}
                value={applyFormData.applicantRollNoOrCode}
                onChange={(e) => setApplyFormData((p) => ({ ...p, applicantRollNoOrCode: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={applyFormData.department}
                  label="Department"
                  onChange={(e) => setApplyFormData((p) => ({ ...p, department: e.target.value }))}
                >
                  {departments.map((d) => (
                    <MenuItem key={d._id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Leave Category</InputLabel>
                <Select
                  value={applyFormData.leaveType}
                  label="Leave Category"
                  onChange={(e) => setApplyFormData((p) => ({ ...p, leaveType: e.target.value as any }))}
                >
                  <MenuItem value="CASUAL">Casual Leave (CL)</MenuItem>
                  <MenuItem value="MEDICAL">Medical Leave (ML)</MenuItem>
                  <MenuItem value="DUTY_LEAVE">Duty Leave (DL)</MenuItem>
                  <MenuItem value="MATERNITY_PATERNITY">Maternity / Paternity Leave</MenuItem>
                  <MenuItem value="EARNED">Earned Leave (EL)</MenuItem>
                  <MenuItem value="OTHER">Other Reason</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={applyFormData.startDate}
                onChange={(e) => setApplyFormData((p) => ({ ...p, startDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={applyFormData.endDate}
                onChange={(e) => setApplyFormData((p) => ({ ...p, endDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Detailed Reason for Leave"
                placeholder="Specify emergency reason, illness symptoms, or event details..."
                value={applyFormData.reason}
                onChange={(e) => setApplyFormData((p) => ({ ...p, reason: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Upload Supporting Document (Medical Certificate / Invitation Letter)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachmentIcon />}
              >
                {applyFormData.attachmentFile ? applyFormData.attachmentFile.name : 'Choose Document File'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setApplyFormData((p) => ({ ...p, attachmentFile: e.target.files![0] }));
                    }
                  }}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenApplyDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleExecuteApplyLeave}>
            Submit Leave Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: APPROVAL WORKFLOW DECISION MODAL */}
      <Dialog
        open={openWorkflowDialog}
        onClose={() => setOpenWorkflowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Leave Approval Decision Workflow
        </DialogTitle>
        <DialogContent dividers>
          {selectedLeaveToApprove && (
            <Box>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedLeaveToApprove.applicantName} ({selectedLeaveToApprove.applicantType})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLeaveToApprove.applicantRollNoOrCode} • {selectedLeaveToApprove.department}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Leave Type: {selectedLeaveToApprove.leaveType} ({selectedLeaveToApprove.totalDays} Days)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {new Date(selectedLeaveToApprove.startDate).toLocaleDateString()} to {new Date(selectedLeaveToApprove.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  "{selectedLeaveToApprove.reason}"
                </Typography>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Approver Decision Comments / Feedback"
                placeholder="E.g., Medical certificate verified. Sanctioned with substitute arrangement."
                value={workflowComments}
                onChange={(e) => setWorkflowComments(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenWorkflowDialog(false)}>Close</Button>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleExecuteWorkflowAction('REJECTED')}
            >
              Reject Leave
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleExecuteWorkflowAction('APPROVED')}
            >
              Approve Leave
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
