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
} from '@mui/material';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GavelIcon from '@mui/icons-material/Gavel';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VerifiedIcon from '@mui/icons-material/Verified';

import { useAuth } from '../../context/AuthContext.js';
import { FeeRecord, FeePayment, FeeStats, Student } from '../../types/index.js';
import {
  feesService,
  SaveFeePayload,
  BatchFeePayload,
  ProcessPaymentPayload,
} from '../../services/feesService.js';
import { studentService } from '../../services/studentService.js';
import { departmentService } from '../../services/departmentService.js';

export const FeesPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab Index:
  // 0 -> Fees Dashboard
  // 1 -> Fee Ledger & CRUD
  // 2 -> Pending & Overdue Fees
  // 3 -> Make Payment / Collect
  // 4 -> Payment History & Receipts
  // 5 -> Batch Fee Generator
  const [activeTab, setActiveTab] = useState<number>(0);

  // Metadata dropdowns
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // TAB 0: DASHBOARD STATS
  // ---------------------------------------------------------------------------
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 1: FEE LEDGER & CRUD
  // ---------------------------------------------------------------------------
  const [feesList, setFeesList] = useState<FeeRecord[]>([]);
  const [loadingFees, setLoadingFees] = useState<boolean>(false);

  // Filters
  const [filterStudent, setFilterStudent] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create / Edit Fee Modal
  const [openFeeModal, setOpenFeeModal] = useState<boolean>(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [feeForm, setFeeForm] = useState<SaveFeePayload>({
    studentId: '',
    category: 'Tuition Fee',
    title: 'Semester Tuition Fee',
    dueDate: '2026-08-30',
    baseAmount: 2500,
    fineAmount: 0,
    scholarshipAmount: 0,
    remarks: 'Standard academic fee assignment',
  });
  const [savingFee, setSavingFee] = useState<boolean>(false);

  // Delete Modal
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [feeToDelete, setFeeToDelete] = useState<FeeRecord | null>(null);
  const [deletingFee, setDeletingFee] = useState<boolean>(false);

  // Scholarship Modal
  const [openScholarshipModal, setOpenScholarshipModal] = useState<boolean>(false);
  const [scholarshipFee, setScholarshipFee] = useState<FeeRecord | null>(null);
  const [scholarshipAmt, setScholarshipAmt] = useState<number>(300);
  const [scholarshipRemarks, setScholarshipRemarks] = useState<string>('Merit Scholarship Waiver');
  const [applyingScholarship, setApplyingScholarship] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 2: PENDING & OVERDUE FEES
  // ---------------------------------------------------------------------------
  const [openFineModal, setOpenFineModal] = useState<boolean>(false);
  const [fineAmountInput, setFineAmountInput] = useState<number>(50);
  const [applyingFine, setApplyingFine] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 3: MAKE PAYMENT / COLLECT
  // ---------------------------------------------------------------------------
  const [paymentStudentId, setPaymentStudentId] = useState<string>('');
  const [paymentFeeId, setPaymentFeeId] = useState<string>('');
  const [paymentForm, setPaymentForm] = useState<ProcessPaymentPayload>({
    feeRecordId: '',
    amountPaid: 0,
    paymentMode: 'ONLINE',
    transactionRef: '',
    receivedBy: user?.name || 'Accounts Officer',
    remarks: 'Fee payment transaction',
  });
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 4: PAYMENT HISTORY & PRINTABLE RECEIPT
  // ---------------------------------------------------------------------------
  const [paymentsList, setPaymentsList] = useState<FeePayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [receiptSearch, setReceiptSearch] = useState<string>('');

  // Receipt PDF Dialog View
  const [openReceiptModal, setOpenReceiptModal] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [loadingReceiptDetails, setLoadingReceiptDetails] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 5: BATCH FEE GENERATOR
  // ---------------------------------------------------------------------------
  const [batchForm, setBatchForm] = useState<BatchFeePayload>({
    department: 'ALL',
    category: 'Tuition Fee',
    title: 'Semester 3 Tuition Fee',
    dueDate: '2026-09-01',
    baseAmount: 2500,
    scholarshipPercentage: 10,
  });
  const [generatingBatch, setGeneratingBatch] = useState<boolean>(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load Metadata (Students & Departments)
  const fetchMetadata = useCallback(async () => {
    try {
      const [stdRes, deptRes] = await Promise.all([
        studentService.getStudents({ limit: 200 }),
        departmentService.getDepartments(),
      ]);

      if (stdRes.success && stdRes.students.length > 0) {
        setStudents(stdRes.students);
        setPaymentStudentId(stdRes.students[0]._id);
      }
      if (deptRes.success) setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error('Error fetching fees metadata:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Load Dashboard Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await feesService.getFeeStats();
      if (res.success) setStats(res.stats);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching fee stats', severity: 'error' });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load Fee Ledger
  const fetchFeesList = useCallback(async () => {
    setLoadingFees(true);
    try {
      const res = await feesService.getFees({
        studentId: filterStudent,
        department: filterDepartment,
        category: filterCategory,
        status: filterStatus,
        search: searchQuery,
      });
      if (res.success) setFeesList(res.fees || []);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching fees list', severity: 'error' });
    } finally {
      setLoadingFees(false);
    }
  }, [filterStudent, filterDepartment, filterCategory, filterStatus, searchQuery]);

  // Load Payments
  const fetchPaymentsList = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await feesService.getPaymentHistory({ search: receiptSearch });
      if (res.success) setPaymentsList(res.payments || []);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching payments history', severity: 'error' });
    } finally {
      setLoadingPayments(false);
    }
  }, [receiptSearch]);

  // Tab switch effect
  useEffect(() => {
    if (activeTab === 0) fetchStats();
    if (activeTab === 1 || activeTab === 2) fetchFeesList();
    if (activeTab === 4) fetchPaymentsList();
  }, [activeTab, fetchStats, fetchFeesList, fetchPaymentsList]);

  // Save / Edit Fee Record
  const handleSaveFee = async () => {
    if (!feeForm.studentId || !feeForm.title || !feeForm.dueDate || !feeForm.baseAmount) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    setSavingFee(true);
    try {
      if (selectedFee && selectedFee._id) {
        await feesService.updateFee(selectedFee._id, feeForm);
        setSnackbar({ open: true, message: 'Fee record updated successfully!', severity: 'success' });
      } else {
        await feesService.createFee(feeForm);
        setSnackbar({ open: true, message: 'Fee record created successfully!', severity: 'success' });
      }
      setOpenFeeModal(false);
      fetchFeesList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error saving fee record', severity: 'error' });
    } finally {
      setSavingFee(false);
    }
  };

  // Delete Fee Record
  const handleDeleteFee = async () => {
    if (!feeToDelete || !feeToDelete._id) return;
    setDeletingFee(true);
    try {
      await feesService.deleteFee(feeToDelete._id);
      setSnackbar({ open: true, message: 'Fee record deleted successfully!', severity: 'success' });
      setOpenDeleteModal(false);
      fetchFeesList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error deleting fee record', severity: 'error' });
    } finally {
      setDeletingFee(false);
    }
  };

  // Apply Scholarship
  const handleApplyScholarship = async () => {
    if (!scholarshipFee || scholarshipAmt < 0) return;
    setApplyingScholarship(true);
    try {
      await feesService.applyScholarship({
        feeRecordId: scholarshipFee._id,
        scholarshipAmount: scholarshipAmt,
        remarks: scholarshipRemarks,
      });
      setSnackbar({ open: true, message: 'Scholarship waiver applied successfully!', severity: 'success' });
      setOpenScholarshipModal(false);
      fetchFeesList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error applying scholarship', severity: 'error' });
    } finally {
      setApplyingScholarship(false);
    }
  };

  // Apply Late Fine
  const handleApplyLateFine = async () => {
    setApplyingFine(true);
    try {
      const res = await feesService.applyLateFine({ fineAmount: fineAmountInput });
      setSnackbar({ open: true, message: res.message || 'Late fines applied successfully!', severity: 'success' });
      setOpenFineModal(false);
      fetchFeesList();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error applying late fines', severity: 'error' });
    } finally {
      setApplyingFine(false);
    }
  };

  // Process Fee Payment
  const handleProcessPayment = async () => {
    if (!paymentForm.feeRecordId || paymentForm.amountPaid <= 0) {
      setSnackbar({ open: true, message: 'Please select a fee record and enter a valid payment amount.', severity: 'error' });
      return;
    }
    setProcessingPayment(true);
    try {
      const res = await feesService.processPayment(paymentForm);
      if (res.success) {
        setSnackbar({ open: true, message: res.message || 'Payment processed successfully!', severity: 'success' });
        // View generated receipt
        handleViewReceipt(res.payment._id);
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error processing payment', severity: 'error' });
    } finally {
      setProcessingPayment(false);
    }
  };

  // View Printable Receipt Details
  const handleViewReceipt = async (paymentId: string) => {
    setLoadingReceiptDetails(true);
    setOpenReceiptModal(true);
    try {
      const res = await feesService.getReceiptDetails(paymentId);
      if (res.success) setReceiptData(res);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error fetching receipt details', severity: 'error' });
    } finally {
      setLoadingReceiptDetails(false);
    }
  };

  // Batch Fee Generator
  const handleBatchGenerate = async () => {
    setGeneratingBatch(true);
    try {
      const res = await feesService.batchGenerateFees(batchForm);
      if (res.success) {
        setSnackbar({ open: true, message: res.message || 'Batch fee assigned successfully!', severity: 'success' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Error generating batch fees', severity: 'error' });
    } finally {
      setGeneratingBatch(false);
    }
  };

  // Status Chip Badge
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Chip label="PAID" size="small" color="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      case 'PARTIAL':
        return <Chip label="PARTIAL" size="small" color="info" sx={{ fontWeight: 800 }} />;
      case 'OVERDUE':
        return <Chip label="OVERDUE" size="small" color="error" icon={<WarningAmberIcon fontSize="small" />} sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label="PENDING" size="small" color="warning" sx={{ fontWeight: 800 }} />;
    }
  };

  // Filter student's pending fee records when student changes in payment tab
  const studentFeeOptions = feesList.filter(
    (f) => (f.studentId === paymentStudentId || f.studentRollNo === paymentStudentId) && f.pendingAmount > 0
  );

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Student Fees & Financial Management Module
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fee category configurations, payment collections, scholarship waivers, late fine penalties, receipt generation, and real-time ledger tracking.
        </Typography>
      </Box>

      {/* Tabs Bar */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab icon={<AccountBalanceWalletIcon />} iconPosition="start" label="Fee Summary & Dashboard" sx={{ fontWeight: 700, py: 2 }} />
          {user?.role !== 'STUDENT' && (
            <Tab icon={<ReceiptIcon />} iconPosition="start" label="Fee Roster & Ledger" sx={{ fontWeight: 700, py: 2 }} />
          )}
          <Tab icon={<MoneyOffIcon />} iconPosition="start" label="Pending Fees & Dues" sx={{ fontWeight: 700, py: 2 }} />
          {user?.role !== 'STUDENT' && (
            <Tab icon={<PaymentIcon />} iconPosition="start" label="Collect Payment" sx={{ fontWeight: 700, py: 2 }} />
          )}
          <Tab icon={<PrintIcon />} iconPosition="start" label="Payment Receipts History" sx={{ fontWeight: 700, py: 2 }} />
          {user?.role !== 'STUDENT' && (
            <Tab icon={<AutoModeIcon />} iconPosition="start" label="Batch Fee Assignment" sx={{ fontWeight: 700, py: 2 }} />
          )}
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: FEES DASHBOARD STATS */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {loadingStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !stats ? (
            <Typography>Unable to load fee statistics.</Typography>
          ) : (
            <Grid container spacing={3}>
              {/* Stat Card 1 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        TOTAL COLLECTABLE
                      </Typography>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 40, height: 40 }}>
                        <AccountBalanceWalletIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      ₹{stats.totalCollectable.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across {stats.totalRecords} fee assignments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stat Card 2 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        TOTAL COLLECTED
                      </Typography>
                      <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 40, height: 40 }}>
                        <TrendingUpIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main' }}>
                      ₹{stats.totalCollected.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.statusCounts.PAID} Fully Paid records
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stat Card 3 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        TOTAL PENDING
                      </Typography>
                      <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 40, height: 40 }}>
                        <MoneyOffIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'warning.main' }}>
                      ₹{stats.totalPending.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.statusCounts.PENDING + stats.statusCounts.PARTIAL} Pending / Partial
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stat Card 4 */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        SCHOLARSHIPS GRANTED
                      </Typography>
                      <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 40, height: 40 }}>
                        <CardGiftcardIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'info.main' }}>
                      ₹{stats.totalScholarships.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fines Collected: ₹{stats.totalFines.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Detailed Category Distribution Grid */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Fee Collection Status Distribution
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>
                          {stats.statusCounts.PAID}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Fully Paid</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'info.main' }}>
                          {stats.statusCounts.PARTIAL}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Partial Payment</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'warning.main' }}>
                          {stats.statusCounts.PENDING}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Pending Due</Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'error.main' }}>
                          {stats.statusCounts.OVERDUE}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Overdue Penalized</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, textAlign: 'right' }}>
                    <Button variant="contained" startIcon={<PaymentIcon />} onClick={() => setActiveTab(3)} sx={{ fontWeight: 800 }}>
                      Quick Fee Collection
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Quick Management Actions
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                    Execute financial operations across student ledgers.
                  </Typography>

                  <Stack spacing={2}>
                    <Button variant="outlined" fullWidth startIcon={<AddIcon />} onClick={() => { setSelectedFee(null); setOpenFeeModal(true); }}>
                      Assign Individual Fee
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<AutoModeIcon />} onClick={() => setActiveTab(5)}>
                      Batch Fee Generation
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<GavelIcon />} onClick={() => setOpenFineModal(true)}>
                      Apply Overdue Late Fines
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FEE ROSTER & CRUD */}
      {/* ========================================================================= */}
      {(activeTab === 1 || activeTab === 2) && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search student, roll no, fee title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={filterDepartment} label="Department" onChange={(e) => setFilterDepartment(e.target.value)}>
                    <MenuItem value="ALL">All Departments</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value)}>
                    <MenuItem value="ALL">All Categories</MenuItem>
                    <MenuItem value="Tuition Fee">Tuition Fee</MenuItem>
                    <MenuItem value="Hostel Fee">Hostel Fee</MenuItem>
                    <MenuItem value="Exam Fee">Exam Fee</MenuItem>
                    <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                    <MenuItem value="Library Fee">Library Fee</MenuItem>
                    <MenuItem value="Admission Fee">Admission Fee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={activeTab === 2 ? 'PENDING' : filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PAID">PAID</MenuItem>
                    <MenuItem value="PARTIAL">PARTIAL</MenuItem>
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchFeesList}>
                  Refresh
                </Button>
                {activeTab === 2 ? (
                  <Button variant="contained" color="error" startIcon={<GavelIcon />} onClick={() => setOpenFineModal(true)} sx={{ fontWeight: 800 }}>
                    Apply Fines
                  </Button>
                ) : (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedFee(null); setOpenFeeModal(true); }} sx={{ fontWeight: 800 }}>
                    Assign Fee
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
          {loadingFees ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : feesList.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No fee records found.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Student Info</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Fee Title & Category</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Base / Fine / Schol</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Total Payable</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Paid / Pending</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feesList
                      .filter((f) => (activeTab === 2 ? f.pendingAmount > 0 : true))
                      .map((f) => (
                        <TableRow key={f._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {f.studentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {f.studentRollNo} • {f.department}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {f.title}
                            </Typography>
                            <Chip label={f.category} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: new Date(f.dueDate) < new Date() && f.pendingAmount > 0 ? 'error.main' : 'text.primary' }}>
                              {f.dueDate}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Base: ₹{f.baseAmount}
                            </Typography>
                            {f.fineAmount > 0 && (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 700 }}>
                                + Fine: ₹{f.fineAmount}
                              </Typography>
                            )}
                            {f.scholarshipAmount > 0 && (
                              <Typography variant="caption" color="success.main" sx={{ display: 'block', fontWeight: 700 }}>
                                - Schol: ₹{f.scholarshipAmount}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                              ₹{f.totalPayable}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                              Paid: ₹{f.paidAmount}
                            </Typography>
                            <Typography variant="caption" color={f.pendingAmount > 0 ? 'error.main' : 'text.secondary'} sx={{ fontWeight: 800, display: 'block' }}>
                              Pending: ₹{f.pendingAmount}
                            </Typography>
                          </TableCell>

                          <TableCell>{getStatusChip(f.status)}</TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              {f.pendingAmount > 0 && (
                                <Tooltip title="Collect Payment">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                      setPaymentStudentId(f.studentId);
                                      setPaymentFeeId(f._id);
                                      setPaymentForm({
                                        feeRecordId: f._id,
                                        amountPaid: f.pendingAmount,
                                        paymentMode: 'ONLINE',
                                        transactionRef: '',
                                        receivedBy: user?.name || 'Accounts Officer',
                                        remarks: 'Fee payment transaction',
                                      });
                                      setActiveTab(3);
                                    }}
                                  >
                                    <PaymentIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Apply Scholarship Waiver">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => {
                                    setScholarshipFee(f);
                                    setScholarshipAmt(f.scholarshipAmount || 200);
                                    setOpenScholarshipModal(true);
                                  }}
                                >
                                  <CardGiftcardIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Record">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedFee(f);
                                    setFeeForm({
                                      studentId: f.studentId,
                                      category: f.category,
                                      title: f.title,
                                      dueDate: f.dueDate,
                                      baseAmount: f.baseAmount,
                                      fineAmount: f.fineAmount,
                                      scholarshipAmount: f.scholarshipAmount,
                                      remarks: f.remarks || '',
                                    });
                                    setOpenFeeModal(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Record">
                                <IconButton size="small" color="error" onClick={() => { setFeeToDelete(f); setOpenDeleteModal(true); }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COLLECT PAYMENT */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon color="primary" /> Process Student Fee Payment
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Select student and pending fee record to record payment and issue official receipt.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={paymentStudentId}
                    label="Select Student"
                    onChange={(e) => {
                      setPaymentStudentId(e.target.value);
                      setPaymentFeeId('');
                    }}
                  >
                    {students.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name} ({s.studentId || s.admissionNumber}) — {s.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Pending Fee Assignment</InputLabel>
                  <Select
                    value={paymentForm.feeRecordId}
                    label="Select Pending Fee Assignment"
                    onChange={(e) => {
                      const selId = e.target.value;
                      const selRec = feesList.find((f) => f._id === selId);
                      setPaymentForm({
                        ...paymentForm,
                        feeRecordId: selId,
                        amountPaid: selRec ? selRec.pendingAmount : 0,
                      });
                    }}
                  >
                    {studentFeeOptions.length === 0 ? (
                      <MenuItem value="" disabled>
                        No pending fees for selected student
                      </MenuItem>
                    ) : (
                      studentFeeOptions.map((f) => (
                        <MenuItem key={f._id} value={f._id}>
                          {f.title} ({f.category}) — Pending: ₹{f.pendingAmount} (Due: {f.dueDate})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Payment Amount (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    value={paymentForm.paymentMode}
                    label="Payment Mode"
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  >
                    <MenuItem value="ONLINE">ONLINE (Card/Netbanking)</MenuItem>
                    <MenuItem value="UPI">UPI Instant Payment</MenuItem>
                    <MenuItem value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS)</MenuItem>
                    <MenuItem value="CASH">CASH Counter</MenuItem>
                    <MenuItem value="CHEQUE">CHEQUE / Demand Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Transaction Ref / Chq No"
                  fullWidth
                  size="small"
                  placeholder="e.g. TXN98402148"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cashier / Received By"
                  fullWidth
                  size="small"
                  value={paymentForm.receivedBy}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receivedBy: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Transaction Remarks"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  sx={{ py: 1.5, fontWeight: 800, borderRadius: 2.5 }}
                >
                  {processingPayment ? 'Processing...' : 'Confirm & Generate Digital Receipt'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAYMENT RECEIPTS HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <Box>
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search receipt no, student name, roll no, transaction ref..."
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPaymentsList}>
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loadingPayments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : paymentsList.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                No payment receipts recorded yet.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Receipt No</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Fee Category</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Amount Paid</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Payment Mode</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Txn Ref</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentsList.map((p) => (
                      <TableRow key={p._id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>
                          {p.receiptNo}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {p.studentName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {p.studentRollNo}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip label={p.feeCategory} size="small" />
                        </TableCell>

                        <TableCell sx={{ fontWeight: 900, color: 'success.main' }}>
                          ₹{p.amountPaid}
                        </TableCell>

                        <TableCell>
                          <Chip label={p.paymentMode} size="small" variant="outlined" />
                        </TableCell>

                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {p.transactionRef}
                        </TableCell>

                        <TableCell>{p.paymentDate}</TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => handleViewReceipt(p._id)}
                            sx={{ fontWeight: 800 }}
                          >
                            Receipt PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BATCH FEE GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 5 && (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoModeIcon color="primary" /> Mass Fee Structure Assignment
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Assign tuition or exam fees to all active students in a department automatically.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Department</InputLabel>
                  <Select
                    value={batchForm.department}
                    label="Target Department"
                    onChange={(e) => setBatchForm({ ...batchForm, department: e.target.value })}
                  >
                    <MenuItem value="ALL">All Active Departments</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d._id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fee Category</InputLabel>
                  <Select
                    value={batchForm.category}
                    label="Fee Category"
                    onChange={(e) => setBatchForm({ ...batchForm, category: e.target.value })}
                  >
                    <MenuItem value="Tuition Fee">Tuition Fee</MenuItem>
                    <MenuItem value="Hostel Fee">Hostel Fee</MenuItem>
                    <MenuItem value="Exam Fee">Exam Fee</MenuItem>
                    <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                    <MenuItem value="Library Fee">Library Fee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Fee Title"
                  fullWidth
                  size="small"
                  value={batchForm.title}
                  onChange={(e) => setBatchForm({ ...batchForm, title: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Base Fee Amount (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  value={batchForm.baseAmount}
                  onChange={(e) => setBatchForm({ ...batchForm, baseAmount: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Scholarship Waiver %"
                  type="number"
                  fullWidth
                  size="small"
                  value={batchForm.scholarshipPercentage}
                  onChange={(e) => setBatchForm({ ...batchForm, scholarshipPercentage: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={batchForm.dueDate}
                  onChange={(e) => setBatchForm({ ...batchForm, dueDate: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<AutoModeIcon />}
                  onClick={handleBatchGenerate}
                  disabled={generatingBatch}
                  sx={{ py: 1.5, fontWeight: 800, borderRadius: 2.5 }}
                >
                  {generatingBatch ? 'Processing Mass Fee Assignment...' : 'Generate & Assign Fees to Students'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT FEE ASSIGNMENT */}
      {/* ========================================================================= */}
      <Dialog open={openFeeModal} onClose={() => setOpenFeeModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedFee ? 'Edit Fee Assignment' : 'Assign New Fee to Student'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={feeForm.studentId}
                  label="Select Student"
                  disabled={!!selectedFee}
                  onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                >
                  {students.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name} ({s.studentId || s.admissionNumber}) — {s.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={feeForm.category}
                  label="Category"
                  onChange={(e) => setFeeForm({ ...feeForm, category: e.target.value })}
                >
                  <MenuItem value="Tuition Fee">Tuition Fee</MenuItem>
                  <MenuItem value="Hostel Fee">Hostel Fee</MenuItem>
                  <MenuItem value="Exam Fee">Exam Fee</MenuItem>
                  <MenuItem value="Transport Fee">Transport Fee</MenuItem>
                  <MenuItem value="Library Fee">Library Fee</MenuItem>
                  <MenuItem value="Admission Fee">Admission Fee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={feeForm.dueDate}
                onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Fee Title"
                fullWidth
                size="small"
                value={feeForm.title}
                onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Base Amount (₹)"
                type="number"
                fullWidth
                size="small"
                value={feeForm.baseAmount}
                onChange={(e) => setFeeForm({ ...feeForm, baseAmount: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Late Fine (₹)"
                type="number"
                fullWidth
                size="small"
                value={feeForm.fineAmount}
                onChange={(e) => setFeeForm({ ...feeForm, fineAmount: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Scholarship Waiver (₹)"
                type="number"
                fullWidth
                size="small"
                value={feeForm.scholarshipAmount}
                onChange={(e) => setFeeForm({ ...feeForm, scholarshipAmount: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Remarks"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={feeForm.remarks}
                onChange={(e) => setFeeForm({ ...feeForm, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeeModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFee} disabled={savingFee} sx={{ fontWeight: 800 }}>
            {savingFee ? 'Saving...' : 'Save Fee Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: APPLY SCHOLARSHIP WAIVER */}
      {/* ========================================================================= */}
      <Dialog open={openScholarshipModal} onClose={() => setOpenScholarshipModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardGiftcardIcon color="info" /> Apply Scholarship Waiver
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Student: <strong>{scholarshipFee?.studentName}</strong> ({scholarshipFee?.title})
          </Typography>

          <TextField
            label="Scholarship Discount Amount (₹)"
            type="number"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={scholarshipAmt}
            onChange={(e) => setScholarshipAmt(Number(e.target.value))}
          />

          <TextField
            label="Waiver Remarks / Scheme Name"
            fullWidth
            size="small"
            value={scholarshipRemarks}
            onChange={(e) => setScholarshipRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenScholarshipModal(false)}>Cancel</Button>
          <Button variant="contained" color="info" onClick={handleApplyScholarship} disabled={applyingScholarship} sx={{ fontWeight: 800 }}>
            {applyingScholarship ? 'Applying...' : 'Grant Scholarship Waiver'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: BULK APPLY LATE FINES */}
      {/* ========================================================================= */}
      <Dialog open={openFineModal} onClose={() => setOpenFineModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="error" /> Bulk Apply Overdue Late Fine
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will automatically scan all student fee records with past due dates and apply a flat penalty fee.
          </Typography>

          <TextField
            label="Late Fine Penalty Amount (₹)"
            type="number"
            fullWidth
            size="small"
            value={fineAmountInput}
            onChange={(e) => setFineAmountInput(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFineModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleApplyLateFine} disabled={applyingFine} sx={{ fontWeight: 800 }}>
            {applyingFine ? 'Applying...' : 'Apply Late Fines'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the fee assignment for <strong>{feeToDelete?.studentName}</strong> ({feeToDelete?.title})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteFee} disabled={deletingFee}>
            {deletingFee ? 'Deleting...' : 'Delete Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE DIGITAL RECEIPT PDF DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={openReceiptModal} onClose={() => setOpenReceiptModal(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
          {loadingReceiptDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !receiptData ? (
            <Typography>Receipt data not available.</Typography>
          ) : (
            <Paper sx={{ p: 4, borderRadius: 3, border: '2px solid #e2e8f0', boxShadow: 'none' }}>
              {/* Institution Header */}
              <Box sx={{ textAlign: 'center', pb: 2, mb: 3, borderBottom: '2px double #cbd5e1' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {receiptData.institution.name}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {receiptData.institution.address} • {receiptData.institution.contact}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 1, textDecoration: 'underline' }}>
                  OFFICIAL FEE PAYMENT RECEIPT
                </Typography>
              </Box>

              {/* Receipt Details Grid */}
              <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">RECEIPT NO</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
                    {receiptData.receipt.receiptNo}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">DATE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {receiptData.receipt.date}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">PAYMENT MODE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {receiptData.receipt.paymentMode}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">TRANSACTION REF</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {receiptData.receipt.transactionRef}
                  </Typography>
                </Grid>
              </Grid>

              {/* Student Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>
                  STUDENT PARTICULARS
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">Name: <strong>{receiptData.student.name}</strong></Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">Roll No: <strong>{receiptData.student.rollNo}</strong></Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">Department: {receiptData.student.department}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">Course: {receiptData.student.course}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Fee Breakdown Table */}
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Fee Particulars</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Base Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Fine</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Scholarship</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Total Payable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{receiptData.feeBreakdown.title}</TableCell>
                      <TableCell>{receiptData.feeBreakdown.category}</TableCell>
                      <TableCell align="right">₹{receiptData.feeBreakdown.baseAmount}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>+₹{receiptData.feeBreakdown.fineAmount}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>-₹{receiptData.feeBreakdown.scholarshipAmount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>₹{receiptData.feeBreakdown.totalPayable}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Summary Box */}
              <Grid container spacing={2} sx={{ alignItems: 'center', mb: 3, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                    AMOUNT RECEIVED: ₹{receiptData.receipt.amountPaid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Remaining Balance: ₹{receiptData.feeBreakdown.remainingBalance}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                  <Chip
                    label="PAYMENT SUCCESSFUL"
                    color="success"
                    icon={<VerifiedIcon />}
                    sx={{ fontWeight: 800 }}
                  />
                </Grid>
              </Grid>

              {/* Footer Verification Stamp */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode2Icon sx={{ fontSize: 50, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Digitally Verified by Accounts System
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Received By: {receiptData.receipt.receivedBy}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ borderBottom: '1px solid #000', width: 140, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    Authorized Signatory
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setOpenReceiptModal(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ fontWeight: 800 }}>
            Print Receipt PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
