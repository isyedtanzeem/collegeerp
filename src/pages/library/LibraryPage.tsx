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

import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HistoryIcon from '@mui/icons-material/History';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { useAuth } from '../../context/AuthContext.js';
import { Book, BookCategory, BookIssue, LibraryStats, Student } from '../../types/index.js';
import { libraryService, SaveBookPayload, SaveCategoryPayload } from '../../services/libraryService.js';
import { studentService } from '../../services/studentService.js';

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab Index
  const [activeTab, setActiveTab] = useState<number>(0);

  // Stats & Master Data State
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);
  const [bookSearch, setBookSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');

  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(false);
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('ALL');
  const [issueSearch, setIssueSearch] = useState<string>('');

  const [fines, setFines] = useState<BookIssue[]>([]);
  const [loadingFines, setLoadingFines] = useState<boolean>(false);
  const [fineStatusFilter, setFineStatusFilter] = useState<string>('PENDING');

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentHistoryData, setStudentHistoryData] = useState<any>(null);
  const [loadingStudentHistory, setLoadingStudentHistory] = useState<boolean>(false);

  // Dialog States
  const [openBookDialog, setOpenBookDialog] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookFormData, setBookFormData] = useState<SaveBookPayload>({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science & Software',
    publisher: '',
    edition: '1st Edition',
    totalCopies: 5,
    locationRack: 'Rack A-1',
    price: 50,
    callNumber: '',
  });

  const [openCategoryDialog, setOpenCategoryDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<SaveCategoryPayload>({
    name: '',
    code: '',
    description: '',
    locationSection: 'Main Library Floor 1',
    maxIssueDays: 14,
    finePerDay: 2,
  });

  const [openIssueDialog, setOpenIssueDialog] = useState<boolean>(false);
  const [issueFormData, setIssueFormData] = useState({
    bookId: '',
    studentId: '',
    borrowerType: 'STUDENT' as 'STUDENT' | 'FACULTY',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuedBy: user?.name || 'Chief Librarian',
    remarks: '',
  });

  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [selectedIssueToReturn, setSelectedIssueToReturn] = useState<BookIssue | null>(null);
  const [returnFormData, setReturnFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    fineAmountOverride: 0,
    remarks: '',
  });

  const [openSlipReceiptModal, setOpenSlipReceiptModal] = useState<boolean>(false);
  const [activeSlipIssue, setActiveSlipIssue] = useState<BookIssue | null>(null);

  // Snackbar Notification State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // FETCHERS
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await libraryService.getStats();
      if (res.success) setStats(res.stats);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const res = await libraryService.getBooks({
        category: categoryFilter,
        availability: availabilityFilter,
        search: bookSearch,
      });
      if (res.success) setBooks(res.books);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingBooks(false);
    }
  }, [categoryFilter, availabilityFilter, bookSearch]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await libraryService.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    setLoadingIssues(true);
    try {
      const res = await libraryService.getIssues({
        status: issueStatusFilter,
        search: issueSearch,
      });
      if (res.success) setIssues(res.issues);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingIssues(false);
    }
  }, [issueStatusFilter, issueSearch]);

  const fetchFines = useCallback(async () => {
    setLoadingFines(true);
    try {
      const res = await libraryService.getFines(fineStatusFilter);
      if (res.success) setFines(res.fines);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingFines(false);
    }
  }, [fineStatusFilter]);

  const fetchStudentsList = useCallback(async () => {
    try {
      const res = await studentService.getStudents();
      if (res.success) setStudents(res.students);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const fetchStudentHistory = async (stId: string) => {
    if (!stId) return;
    setLoadingStudentHistory(true);
    try {
      const res = await libraryService.getStudentHistory(stId);
      if (res.success) setStudentHistoryData(res);
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error loading student history', 'error');
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchStudentsList();
  }, [fetchStats, fetchCategories, fetchStudentsList]);

  useEffect(() => {
    if (activeTab === 0) fetchBooks();
    if (activeTab === 1) fetchCategories();
    if (activeTab === 3 || activeTab === 4) fetchIssues();
    if (activeTab === 6) fetchFines();
  }, [activeTab, fetchBooks, fetchCategories, fetchIssues, fetchFines]);

  // BOOK HANDLERS
  const handleOpenCreateBook = () => {
    setEditingBook(null);
    setBookFormData({
      title: '',
      author: '',
      isbn: `ISBN-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      category: categories[0]?.name || 'Computer Science & Software',
      publisher: 'Academic Press',
      edition: '1st Edition',
      totalCopies: 5,
      locationRack: 'Rack A-1',
      price: 60,
      callNumber: `LIB-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setOpenBookDialog(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setBookFormData({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      publisher: b.publisher || '',
      edition: b.edition || '',
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      locationRack: b.locationRack || '',
      price: b.price || 0,
      callNumber: b.callNumber || '',
    });
    setOpenBookDialog(true);
  };

  const handleSaveBook = async () => {
    if (!bookFormData.title || !bookFormData.author) {
      showSnackbar('Title and Author are required fields.', 'warning');
      return;
    }
    try {
      if (editingBook) {
        await libraryService.updateBook(editingBook._id, bookFormData);
        showSnackbar('Book catalog updated successfully!');
      } else {
        await libraryService.createBook(bookFormData);
        showSnackbar('New book added to library catalog!');
      }
      setOpenBookDialog(false);
      fetchBooks();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error saving book details', 'error');
    }
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from catalog?`)) return;
    try {
      await libraryService.deleteBook(id);
      showSnackbar('Book deleted from catalog.');
      fetchBooks();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error deleting book', 'error');
    }
  };

  // CATEGORY HANDLERS
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      code: '',
      description: '',
      locationSection: 'Main Library Floor 1',
      maxIssueDays: 14,
      finePerDay: 2,
    });
    setOpenCategoryDialog(true);
  };

  const handleOpenEditCategory = (cat: BookCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description || '',
      locationSection: cat.locationSection || '',
      maxIssueDays: cat.maxIssueDays,
      finePerDay: cat.finePerDay,
    });
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.code) {
      showSnackbar('Category Name and Code are required.', 'warning');
      return;
    }
    try {
      if (editingCategory) {
        await libraryService.updateCategory(editingCategory._id, categoryFormData);
        showSnackbar('Category updated successfully!');
      } else {
        await libraryService.createCategory(categoryFormData);
        showSnackbar('New category created!');
      }
      setOpenCategoryDialog(false);
      fetchCategories();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await libraryService.deleteCategory(id);
      showSnackbar('Category deleted.');
      fetchCategories();
      fetchStats();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  // BOOK ISSUE
  const handleOpenIssueForBook = (b?: Book) => {
    setIssueFormData({
      bookId: b?._id || (books[0]?._id || ''),
      studentId: students[0]?._id || '',
      borrowerType: 'STUDENT',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issuedBy: user?.name || 'Chief Librarian',
      remarks: 'Regular issue transaction',
    });
    setOpenIssueDialog(true);
  };

  const handleExecuteIssue = async () => {
    if (!issueFormData.bookId || !issueFormData.studentId) {
      showSnackbar('Please select both a Book and a Student/Borrower.', 'warning');
      return;
    }
    try {
      const res = await libraryService.issueBook(issueFormData);
      if (res.success) {
        showSnackbar(res.message, 'success');
        setOpenIssueDialog(false);
        setActiveSlipIssue(res.issue);
        setOpenSlipReceiptModal(true);
        fetchBooks();
        fetchIssues();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to issue book', 'error');
    }
  };

  // BOOK RETURN
  const handleOpenReturnModal = (iss: BookIssue) => {
    setSelectedIssueToReturn(iss);
    const todayStr = new Date().toISOString().split('T')[0];
    const dueTime = new Date(iss.dueDate).getTime();
    const retTime = new Date(todayStr).getTime();
    let calculatedFine = 0;
    if (retTime > dueTime) {
      const overdueDays = Math.ceil((retTime - dueTime) / (1000 * 60 * 60 * 24));
      calculatedFine = overdueDays * 2;
    }

    setReturnFormData({
      returnDate: todayStr,
      fineAmountOverride: calculatedFine,
      remarks: calculatedFine > 0 ? `Late return fine calculated (₹${calculatedFine})` : 'Returned on time',
    });
    setOpenReturnDialog(true);
  };

  const handleExecuteReturn = async () => {
    if (!selectedIssueToReturn) return;
    try {
      const res = await libraryService.returnBook({
        issueId: selectedIssueToReturn._id,
        returnDate: returnFormData.returnDate,
        fineAmountOverride: returnFormData.fineAmountOverride,
        remarks: returnFormData.remarks,
      });
      if (res.success) {
        showSnackbar(res.message, 'success');
        setOpenReturnDialog(false);
        fetchIssues();
        fetchBooks();
        fetchStats();
        fetchFines();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error executing book return', 'error');
    }
  };

  // FINE ACTIONS
  const handleFineAction = async (issueId: string, action: 'PAY' | 'WAIVE') => {
    const actionLabel = action === 'PAY' ? 'Collect Fine' : 'Waive Fine';
    if (!window.confirm(`${actionLabel} for this record?`)) return;
    try {
      const res = await libraryService.processFineAction(issueId, action);
      if (res.success) {
        showSnackbar(res.message, 'success');
        fetchFines();
        fetchStats();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error processing fine action', 'error');
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
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }} spacing={2}>
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 46, height: 46 }}>
                <MenuBookIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Library Management Portal
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Book Catalog, Categories, Lend & Return Desk, Fine Tracking & Borrower History
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
                fetchBooks();
                fetchCategories();
                fetchIssues();
                fetchFines();
              }}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateBook}
            >
              Add New Book
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutoStoriesIcon />}
              onClick={() => handleOpenIssueForBook()}
            >
              Issue Book
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
                  Total Books Cataloged
                </Typography>

                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
                  <MenuBookIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.totalBooks || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats?.totalCopies || 0} Total Volume Copies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Available Copies
                </Typography>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 36, height: 36 }}>
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {loadingStats ? <CircularProgress size={24} /> : stats?.availableCopies || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats?.issuedCopies || 0} Currently Issued Out
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Loans / Overdue
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 36, height: 36 }}>
                  <WarningAmberIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.dark' }}>
                {loadingStats ? <CircularProgress size={24} /> : `${stats?.activeIssuesCount || 0}`}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                {stats?.overdueCount || 0} Past Due Date
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Fines Collected / Pending
                </Typography>
                <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 36, height: 36 }}>
                  <LocalAtmIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                ₹{stats?.totalFinesCollected || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                ₹{stats?.totalFinesPending || 0} Pending Clearance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MODULE TABS NAV */}
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
          <Tab icon={<MenuBookIcon />} iconPosition="start" label="Books Catalog" />
          <Tab icon={<CategoryIcon />} iconPosition="start" label="Categories" />
          <Tab icon={<AutoStoriesIcon />} iconPosition="start" label="Issue Book Desk" />
          <Tab icon={<AssignmentReturnIcon />} iconPosition="start" label="Return Book Desk" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Transaction Log" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Student History" />
          <Tab
            icon={
              <Badge badgeContent={stats?.totalFinesPending ? `₹${stats.totalFinesPending}` : 0} color="error">
                <LocalAtmIcon />
              </Badge>
            }
            iconPosition="start"
            label="Library Fines"
          />
          <Tab icon={<PrintIcon />} iconPosition="start" label="Reports & Labels" />
        </Tabs>

        {/* TAB 0: BOOKS CATALOG */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Title, Author, ISBN, Rack..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
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

              <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={availabilityFilter}
                    label="Availability"
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="AVAILABLE">Available Now</MenuItem>
                    <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 2, md: 2 }}>
                <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateBook}>
                  New Book
                </Button>
              </Grid>
            </Grid>

            {loadingBooks ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading Library Catalog...
                </Typography>
              </Box>
            ) : books.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No books found matching criteria. Click "Add New Book" to populate catalog.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Title & Author</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ISBN / Call No.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Copies (Avail / Total)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Location Rack</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {books.map((b) => (
                      <TableRow key={b._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {b.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {b.author} {b.edition ? `• ${b.edition}` : ''} {b.publisher ? `• ${b.publisher}` : ''}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {b.isbn}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {b.callNumber || 'LIB-REG'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip label={b.category} size="small" variant="outlined" color="primary" />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            <span style={{ color: b.availableCopies > 0 ? '#2e7d32' : '#d32f2f' }}>
                              {b.availableCopies}
                            </span>{' '}
                            / {b.totalCopies}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <LocationOnIcon fontSize="inherit" color="action" />
                            <Typography variant="body2">{b.locationRack || 'Rack A1'}</Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {b.availableCopies > 0 ? (
                            <Chip label="AVAILABLE" size="small" color="success" />
                          ) : (
                            <Chip label="OUT OF STOCK" size="small" color="error" />
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                            <Tooltip title="Issue This Book">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  disabled={b.availableCopies <= 0}
                                  onClick={() => handleOpenIssueForBook(b)}
                                >
                                  Issue
                                </Button>
                              </span>
                            </Tooltip>

                            <IconButton size="small" color="primary" onClick={() => handleOpenEditBook(b)}>
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton size="small" color="error" onClick={() => handleDeleteBook(b._id, b.title)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 1: CATEGORIES */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Book Categories & Loan Terms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure categories, library sections, max borrowing days, and daily late fine rates
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateCategory}>
                Add Category
              </Button>
            </Stack>

            {loadingCategories ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : categories.length === 0 ? (
              <Alert severity="info">No categories defined. Click "Add Category" to create one.</Alert>
            ) : (
              <Grid container spacing={2.5}>
                {categories.map((cat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat._id}>
                    <Card variant="outlined" sx={{ borderRadius: 2.5, position: 'relative' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {cat.name}
                          </Typography>
                          <Chip label={cat.code} size="small" color="primary" sx={{ fontWeight: 700 }} />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {cat.description || 'Standard academic borrowing category.'}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Location Section
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {cat.locationSection || 'Main Library'}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Max Issue Period
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {cat.maxIssueDays} Days
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6 }} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Late Fine Rate
                            </Typography>
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 700 }}>
                              ₹{cat.finePerDay} / Day
                            </Typography>
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 2 }}>
                          <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenEditCategory(cat)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* TAB 2: ISSUE BOOK DESK */}
        {activeTab === 2 && (
          <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Book Issue Desk
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Lend a library volume to a student or faculty member and auto-generate an Issue Slip receipt.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Select Book</InputLabel>
                    <Select
                      value={issueFormData.bookId}
                      label="Select Book"
                      onChange={(e) => setIssueFormData({ ...issueFormData, bookId: e.target.value })}
                    >
                      {books.map((b) => (
                        <MenuItem key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                          {b.title} ({b.author}) — Available: {b.availableCopies}/{b.totalCopies} [{b.locationRack}]
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Borrower Type</InputLabel>
                    <Select
                      value={issueFormData.borrowerType}
                      label="Borrower Type"
                      onChange={(e) =>
                        setIssueFormData({
                          ...issueFormData,
                          borrowerType: e.target.value as 'STUDENT' | 'FACULTY',
                        })
                      }
                    >
                      <MenuItem value="STUDENT">Student</MenuItem>
                      <MenuItem value="FACULTY">Faculty Member</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Select Student / Borrower</InputLabel>
                    <Select
                      value={issueFormData.studentId}
                      label="Select Student / Borrower"
                      onChange={(e) => setIssueFormData({ ...issueFormData, studentId: e.target.value })}
                    >
                      {students.map((st) => (
                        <MenuItem key={st._id} value={st._id}>
                          {st.name} ({st.studentId || st.admissionNumber}) — {st.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Issue Date"
                    type="date"
                    value={issueFormData.issueDate}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issueDate: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Due Date for Return"
                    type="date"
                    value={issueFormData.dueDate}
                    onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Librarian / Issued By"
                    value={issueFormData.issuedBy}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issuedBy: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Remarks / Notes"
                    multiline
                    rows={2}
                    value={issueFormData.remarks}
                    onChange={(e) => setIssueFormData({ ...issueFormData, remarks: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<BookmarkAddedIcon />}
                    onClick={handleExecuteIssue}
                  >
                    Confirm & Generate Issue Slip
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* TAB 3: RETURN BOOK DESK */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Book Return Desk
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Process returns for actively borrowed books. Fine calculated automatically if past due date.
            </Typography>

            {loadingIssues ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Slip No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Book Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Borrower Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues
                      .filter((iss) => iss.status === 'ISSUED' || iss.status === 'OVERDUE')
                      .map((iss) => {
                        const isOverdue = new Date(iss.dueDate) < new Date();
                        return (
                          <TableRow key={iss._id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{iss.issueSlipNo}</TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {iss.bookTitle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {iss.bookIsbn}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {iss.borrowerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {iss.studentRollNo} • {iss.department}
                              </Typography>
                            </TableCell>

                            <TableCell>{iss.issueDate}</TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isOverdue ? 700 : 400,
                                  color: isOverdue ? 'error.main' : 'text.primary',
                                }}
                              >
                                {iss.dueDate}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {isOverdue ? (
                                <Chip label="OVERDUE" size="small" color="error" />
                              ) : (
                                <Chip label="ISSUED" size="small" color="primary" />
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<AssignmentReturnIcon />}
                                onClick={() => handleOpenReturnModal(iss)}
                              >
                                Return Book
                              </Button>
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

        {/* TAB 4: TRANSACTION LOG */}
        {activeTab === 4 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Slip No, Book Title, Borrower..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={issueStatusFilter}
                    label="Status Filter"
                    onChange={(e) => setIssueStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="ISSUED">Active Loans</MenuItem>
                    <MenuItem value="RETURNED">Returned</MenuItem>
                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {loadingIssues ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Slip No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Book Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Borrower Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fine</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issues.map((iss) => (
                      <TableRow key={iss._id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{iss.issueSlipNo}</TableCell>
                        <TableCell>{iss.bookTitle}</TableCell>
                        <TableCell>
                          {iss.borrowerName} ({iss.studentRollNo})
                        </TableCell>
                        <TableCell>{iss.issueDate}</TableCell>
                        <TableCell>{iss.dueDate}</TableCell>
                        <TableCell>{iss.returnDate || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={iss.status}
                            size="small"
                            color={
                              iss.status === 'RETURNED'
                                ? 'success'
                                : iss.status === 'ISSUED'
                                ? 'primary'
                                : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {iss.fineAmount > 0 ? (
                            <Chip
                              label={`₹${iss.fineAmount} (${iss.fineStatus})`}
                              size="small"
                              color={iss.fineStatus === 'PAID' ? 'success' : 'warning'}
                            />
                          ) : (
                            'None'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 5: STUDENT HISTORY */}
        {activeTab === 5 && (
          <Box sx={{ p: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Lookup Student Library Profile
              </Typography>

              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Student</InputLabel>
                    <Select
                      value={selectedStudentId}
                      label="Select Student"
                      onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        fetchStudentHistory(e.target.value);
                      }}
                    >
                      {students.map((st) => (
                        <MenuItem key={st._id} value={st._id}>
                          {st.name} ({st.studentId || st.admissionNumber}) — {st.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => fetchStudentHistory(selectedStudentId)}
                    disabled={!selectedStudentId}
                  >
                    View Borrowing Record
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {loadingStudentHistory ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : studentHistoryData ? (
              <Box>
                {/* Summary Profile Box */}
                <Card variant="outlined" sx={{ mb: 3, borderRadius: 2.5, bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {studentHistoryData.student?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Roll No: {studentHistoryData.student?.rollNo} | Dept: {studentHistoryData.student?.department}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={2} sx={{ justifyContent: { sm: 'flex-end' } }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                              {studentHistoryData.summary.activeLoans}
                            </Typography>
                            <Typography variant="caption">Active Loans</Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                              {studentHistoryData.summary.totalReturned}
                            </Typography>
                            <Typography variant="caption">Returned</Typography>
                          </Box>

                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>
                              ₹{studentHistoryData.summary.totalFinesPending}
                            </Typography>
                            <Typography variant="caption">Pending Fines</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* History Table */}
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Slip No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Book Title</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Fine</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentHistoryData.history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No borrowing history recorded for this student.
                          </TableCell>
                        </TableRow>
                      ) : (
                        studentHistoryData.history.map((iss: BookIssue) => (
                          <TableRow key={iss._id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{iss.issueSlipNo}</TableCell>
                            <TableCell>{iss.bookTitle}</TableCell>
                            <TableCell>{iss.issueDate}</TableCell>
                            <TableCell>{iss.dueDate}</TableCell>
                            <TableCell>{iss.returnDate || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={iss.status}
                                size="small"
                                color={iss.status === 'RETURNED' ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>₹{iss.fineAmount}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : null}
          </Box>
        )}

        {/* TAB 6: FINES MANAGEMENT */}
        {activeTab === 6 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Library Fines Desk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Collect or waive outstanding fines for overdue books
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Fine Status</InputLabel>
                <Select
                  value={fineStatusFilter}
                  label="Fine Status"
                  onChange={(e) => setFineStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Fines</MenuItem>
                  <MenuItem value="PENDING">Pending Payment</MenuItem>
                  <MenuItem value="PAID">Collected / Paid</MenuItem>
                  <MenuItem value="WAIVED">Waived Fines</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loadingFines ? (
              <CircularProgress />
            ) : fines.length === 0 ? (
              <Alert severity="success">No outstanding library fines matching criteria.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Slip No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Borrower</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Book Title</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date / Return Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fine Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fine Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fines.map((f) => (
                      <TableRow key={f._id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{f.issueSlipNo}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {f.borrowerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {f.studentRollNo} • {f.department}
                          </Typography>
                        </TableCell>
                        <TableCell>{f.bookTitle}</TableCell>
                        <TableCell>
                          <Typography variant="body2">Due: {f.dueDate}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Returned: {f.returnDate || 'Not returned'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'error.main' }}>
                            ₹{f.fineAmount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={f.fineStatus}
                            size="small"
                            color={
                              f.fineStatus === 'PAID'
                                ? 'success'
                                : f.fineStatus === 'WAIVED'
                                ? 'info'
                                : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          {f.fineStatus === 'PENDING' && (
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<LocalAtmIcon />}
                                onClick={() => handleFineAction(f._id, 'PAY')}
                              >
                                Collect Fine
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleFineAction(f._id, 'WAIVE')}
                              >
                                Waive Fine
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 7: REPORTS & LABELS */}
        {activeTab === 7 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Generate Reports & Labels
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Printable book barcodes, call number labels, library catalog summary, and overdue notices.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                    <QrCode2Icon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Book Call Number & Barcode Generator
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Print official shelf cards and barcode stickers for physical books
                      </Typography>
                    </Box>
                  </Stack>

                  <Button variant="contained" fullWidth startIcon={<PrintIcon />} onClick={() => window.print()}>
                    Print Barcode Label Sheet
                  </Button>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
                    <LocalOfferIcon color="secondary" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Library Master Catalog Summary
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Export complete list of titles, racks, and availability count
                      </Typography>
                    </Box>
                  </Stack>

                  <Button variant="outlined" color="primary" fullWidth startIcon={<PrintIcon />} onClick={() => window.print()}>
                    Print Library Inventory Catalog
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* DIALOG 1: ADD / EDIT BOOK */}
      <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingBook ? 'Edit Book Record' : 'Add New Book to Library Catalog'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="Book Title"
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Category"
                select
                value={bookFormData.category}
                onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Author(s)"
                value={bookFormData.author}
                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ISBN Number"
                value={bookFormData.isbn}
                onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Publisher"
                value={bookFormData.publisher}
                onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Edition"
                value={bookFormData.edition}
                onChange={(e) => setBookFormData({ ...bookFormData, edition: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Call Number"
                value={bookFormData.callNumber}
                onChange={(e) => setBookFormData({ ...bookFormData, callNumber: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Total Copies"
                value={bookFormData.totalCopies}
                onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: Number(e.target.value) })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Location Rack / Shelf"
                value={bookFormData.locationRack}
                onChange={(e) => setBookFormData({ ...bookFormData, locationRack: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Price (₹)"
                value={bookFormData.price}
                onChange={(e) => setBookFormData({ ...bookFormData, price: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBook}>
            Save Book
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: ADD / EDIT CATEGORY */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingCategory ? 'Edit Book Category' : 'Create Book Category'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Category Code (e.g., CS, EE, MATH)"
              value={categoryFormData.code}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Library Location Section"
              value={categoryFormData.locationSection}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, locationSection: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Issue Days"
                  value={categoryFormData.maxIssueDays}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, maxIssueDays: Number(e.target.value) })}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fine Per Day (₹)"
                  value={categoryFormData.finePerDay}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, finePerDay: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCategory}>
            Save Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 3: BOOK ISSUE SLIP MODAL */}
      <Dialog open={openSlipReceiptModal} onClose={() => setOpenSlipReceiptModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
          Official Library Issue Slip
        </DialogTitle>
        <DialogContent dividers>
          {activeSlipIssue && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  COLLEGE CENTRAL LIBRARY
                </Typography>
                <Chip label={`SLIP #: ${activeSlipIssue.issueSlipNo}`} color="primary" size="small" sx={{ mt: 0.5 }} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Typography variant="body2">
                  <strong>Book Title:</strong> {activeSlipIssue.bookTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>ISBN:</strong> {activeSlipIssue.bookIsbn}
                </Typography>
                <Typography variant="body2">
                  <strong>Borrower Name:</strong> {activeSlipIssue.borrowerName} ({activeSlipIssue.studentRollNo})
                </Typography>
                <Typography variant="body2">
                  <strong>Department:</strong> {activeSlipIssue.department}
                </Typography>
                <Typography variant="body2">
                  <strong>Issue Date:</strong> {activeSlipIssue.issueDate}
                </Typography>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
                  <strong>Return Due Date:</strong> {activeSlipIssue.dueDate}
                </Typography>
                <Typography variant="body2">
                  <strong>Issued By:</strong> {activeSlipIssue.issuedBy}
                </Typography>
              </Stack>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print Slip
          </Button>
          <Button variant="contained" onClick={() => setOpenSlipReceiptModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 4: RETURN BOOK CONFIRMATION MODAL */}
      <Dialog open={openReturnDialog} onClose={() => setOpenReturnDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Return Book Confirmation</DialogTitle>
        <DialogContent dividers>
          {selectedIssueToReturn && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                <strong>Book:</strong> {selectedIssueToReturn.bookTitle}
              </Typography>
              <Typography variant="body2">
                <strong>Borrower:</strong> {selectedIssueToReturn.borrowerName}
              </Typography>

              <TextField
                fullWidth
                label="Actual Return Date"
                type="date"
                value={returnFormData.returnDate}
                onChange={(e) => setReturnFormData({ ...returnFormData, returnDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                fullWidth
                type="number"
                label="Late Return Fine (₹)"
                value={returnFormData.fineAmountOverride}
                onChange={(e) => setReturnFormData({ ...returnFormData, fineAmountOverride: Number(e.target.value) })}
                helperText="Auto-calculated fine. Override if necessary or waive to 0."
              />

              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={returnFormData.remarks}
                onChange={(e) => setReturnFormData({ ...returnFormData, remarks: e.target.value })}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReturnDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleExecuteReturn}>
            Confirm Book Return
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
