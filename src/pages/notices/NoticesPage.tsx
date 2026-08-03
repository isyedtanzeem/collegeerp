import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  Avatar,
  Badge,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

import { noticeService } from '../../services/noticeService.js';
import { Notice, NoticeAttachment, NoticeCategory, NoticePostType, NoticePriority } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const NoticesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<number>(0); // 0: All, 1: Admin, 2: Faculty, 3: Student
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPostType, setFormPostType] = useState<NoticePostType>('STUDENT_NOTICE');
  const [formCategory, setFormCategory] = useState<NoticeCategory>('GENERAL');
  const [formPriority, setFormPriority] = useState<NoticePriority>('MEDIUM');
  const [formTargetRole, setFormTargetRole] = useState<'ALL' | 'FACULTY' | 'STUDENT' | 'HOD'>('ALL');
  const [formDepartment, setFormDepartment] = useState('ALL');
  const [formSemester, setFormSemester] = useState<number>(0);
  const [formSection, setFormSection] = useState('ALL');
  const [formIsImportant, setFormIsImportant] = useState(false);
  const [formPinned, setFormPinned] = useState(false);
  const [formAttachments, setFormAttachments] = useState<NoticeAttachment[]>([]);

  // Attachment add state
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [newAttType, setNewAttType] = useState('pdf');
  const [newAttSize, setNewAttSize] = useState('1.5 MB');

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Snackbar Toast
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchNotices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let postTypeFilter: string | undefined = undefined;
      if (activeTab === 1) postTypeFilter = 'ADMIN_POST';
      if (activeTab === 2) postTypeFilter = 'FACULTY_POST';
      if (activeTab === 3) postTypeFilter = 'STUDENT_NOTICE';

      const res = await noticeService.getNotices({
        postType: postTypeFilter,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        search: searchTerm || undefined,
      });

      setNotices(res.notices || []);
    } catch (err) {
      console.error('[NoticesPage] Fetch Error:', err);
      showToast('Failed to load notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [token, activeTab, selectedPriority, selectedCategory, selectedDepartment]);

  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormContent('');

    // Pre-fill post type based on user role
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'PRINCIPAL') {
      setFormPostType('ADMIN_POST');
    } else if (user?.role === 'HOD' || user?.role === 'FACULTY') {
      setFormPostType('FACULTY_POST');
    } else {
      setFormPostType('STUDENT_NOTICE');
    }

    setFormCategory('GENERAL');
    setFormPriority('MEDIUM');
    setFormTargetRole('ALL');
    setFormDepartment(user?.department || 'ALL');
    setFormSemester(0);
    setFormSection('ALL');
    setFormIsImportant(false);
    setFormPinned(false);
    setFormAttachments([]);
    setOpenCreateDialog(true);
  };

  const handleOpenEdit = (item: Notice) => {
    setEditingNotice(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormPostType(item.postType || 'STUDENT_NOTICE');
    setFormCategory(item.category || 'GENERAL');
    setFormPriority(item.priority || 'MEDIUM');
    setFormTargetRole(item.targetRole || 'ALL');
    setFormDepartment(item.department || 'ALL');
    setFormSemester(item.semester || 0);
    setFormSection(item.section || 'ALL');
    setFormIsImportant(item.isImportant || false);
    setFormPinned(item.pinned || false);
    setFormAttachments(item.attachments || []);
    setOpenCreateDialog(true);
  };

  const handleSaveNotice = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Notice Title and Content are required.', 'error');
      return;
    }

    try {
      const payload: Partial<Notice> = {
        title: formTitle,
        content: formContent,
        postType: formPostType,
        category: formCategory,
        priority: formPriority,
        targetRole: formTargetRole,
        department: formDepartment,
        semester: Number(formSemester),
        section: formSection,
        isImportant: formIsImportant,
        pinned: formPinned,
        attachments: formAttachments,
      };

      if (editingNotice) {
        await noticeService.updateNotice(editingNotice._id, payload);
        showToast('Notice updated successfully!');
      } else {
        await noticeService.createNotice(payload);
        showToast('Notice published successfully!');
      }

      setOpenCreateDialog(false);
      fetchNotices();
    } catch (err) {
      console.error('[NoticesPage] Save Error:', err);
      showToast('Failed to save notice.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await noticeService.deleteNotice(deleteId);
      showToast('Notice deleted successfully.');
      setDeleteId(null);
      fetchNotices();
    } catch (err) {
      console.error('[NoticesPage] Delete Error:', err);
      showToast('Failed to delete notice.', 'error');
    }
  };

  const handleTogglePin = async (item: Notice) => {
    try {
      const res = await noticeService.togglePinNotice(item._id);
      showToast(res.message || 'Notice pin toggled.');
      fetchNotices();
    } catch (err) {
      console.error('[NoticesPage] Pin Error:', err);
      showToast('Failed to toggle pin.', 'error');
    }
  };

  const handleViewNoticeDetails = async (item: Notice) => {
    setViewingNotice(item);
    try {
      const res = await noticeService.getNoticeById(item._id);
      if (res.notice) {
        setViewingNotice(res.notice);
      }
    } catch (err) {
      console.error('[NoticesPage] Fetch single notice error:', err);
    }
  };

  const handleAddAttachment = () => {
    if (!newAttName.trim()) {
      showToast('Please specify attachment title.', 'error');
      return;
    }
    const sampleUrl = newAttUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    setFormAttachments([
      ...formAttachments,
      {
        name: newAttName.trim(),
        url: sampleUrl,
        fileType: newAttType,
        size: newAttSize,
      },
    ]);
    setNewAttName('');
    setNewAttUrl('');
  };

  const handleRemoveAttachment = (index: number) => {
    setFormAttachments(formAttachments.filter((_, i) => i !== index));
  };

  const canPostNotice = user && ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(user.role);

  // Helper Stats Counters
  const adminPostsCount = notices.filter((n) => n.postType === 'ADMIN_POST').length;
  const facultyPostsCount = notices.filter((n) => n.postType === 'FACULTY_POST').length;
  const studentNoticesCount = notices.filter((n) => n.postType === 'STUDENT_NOTICE').length;
  const urgentCount = notices.filter((n) => n.priority === 'URGENT').length;

  const getPriorityColor = (priority?: NoticePriority) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#fee2e2', text: '#dc2626', border: '#f87171' };
      case 'HIGH':
        return { bg: '#ffedd5', text: '#ea580c', border: '#fb923c' };
      case 'MEDIUM':
        return { bg: '#e0f2fe', text: '#0284c7', border: '#38bdf8' };
      case 'LOW':
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const getPostTypeBadge = (postType?: NoticePostType) => {
    switch (postType) {
      case 'ADMIN_POST':
        return <Chip icon={<AdminPanelSettingsIcon sx={{ fontSize: '1rem !important' }} />} label="Admin Post" color="secondary" size="small" sx={{ fontWeight: 700 }} />;
      case 'FACULTY_POST':
        return <Chip icon={<SchoolIcon sx={{ fontSize: '1rem !important' }} />} label="Faculty Circular" color="primary" size="small" sx={{ fontWeight: 700 }} />;
      case 'STUDENT_NOTICE':
      default:
        return <Chip icon={<PersonIcon sx={{ fontSize: '1rem !important' }} />} label="Student Notice" color="info" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Top Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Avatar sx={{ bgcolor: '#0284c7', width: 48, height: 48 }}>
                <CampaignIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  Campus Notice Board & Circulars
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Official executive announcements, faculty circulars, examination schedules, and student alerts
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" gap={1}>
              <Paper sx={{ p: 1.5, px: 2, bgcolor: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, backdropFilter: 'blur(10px)', color: '#fff', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                  Total Notices
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {notices.length}
                </Typography>
              </Paper>

              <Paper sx={{ p: 1.5, px: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 2, color: '#fff', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#fca5a5', display: 'block', fontWeight: 600 }}>
                  Urgent Alerts
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#f87171' }}>
                  {urgentCount}
                </Typography>
              </Paper>

              {canPostNotice && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  sx={{
                    bgcolor: '#0284c7',
                    hover: { bgcolor: '#0369a1' },
                    fontWeight: 700,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: 2,
                    alignSelf: 'center',
                  }}
                >
                  Publish Notice
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Row */}
      <Paper sx={{ borderRadius: 3, mb: 3, px: 2, pt: 1, bgcolor: '#ffffff' }} elevation={1}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All Notices (${notices.length})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab label={`Admin Posts (${adminPostsCount})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab label={`Faculty Circulars (${facultyPostsCount})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
          <Tab label={`Student Notices (${studentNoticesCount})`} sx={{ fontWeight: 700, textTransform: 'none', py: 2 }} />
        </Tabs>
      </Paper>

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#ffffff' }} elevation={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search notices by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </form>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="URGENT">🔴 Urgent</MenuItem>
              <MenuItem value="HIGH">🟠 High Priority</MenuItem>
              <MenuItem value="MEDIUM">🔵 Medium Priority</MenuItem>
              <MenuItem value="LOW">⚪ Low Priority</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="ACADEMIC">Academic</MenuItem>
              <MenuItem value="EXAM">Examination</MenuItem>
              <MenuItem value="EVENT">Campus Event</MenuItem>
              <MenuItem value="FEE">Finance & Fees</MenuItem>
              <MenuItem value="ADMIN">Administrative</MenuItem>
              <MenuItem value="PLACEMENT">Placements & Hiring</MenuItem>
              <MenuItem value="SPORTS">Sports & Cultural</MenuItem>
              <MenuItem value="GENERAL">General</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={fetchNotices}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Refresh
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Notices List Display */}
      {loading ? (
        <LoadingSpinner message="Fetching campus circulars & notices..." />
      ) : notices.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, my: 3 }}>
          <AnnouncementIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>
            No notices found matching the criteria.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try resetting your priority or category filters.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {notices.map((item) => {
            const pStyle = getPriorityColor(item.priority);
            return (
              <Grid size={{ xs: 12 }} key={item._id}>
                <Card
                  elevation={item.pinned ? 3 : 1}
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.2s ease-in-out',
                    borderLeft: `6px solid ${pStyle.border}`,
                    bgcolor: item.pinned ? '#fefce8' : '#ffffff',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {item.pinned && (
                          <Chip
                            icon={<PushPinIcon sx={{ fontSize: '1rem !important', color: '#b45309' }} />}
                            label="Pinned Notice"
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, border: '1px solid #fde68a' }}
                          />
                        )}

                        {getPostTypeBadge(item.postType)}

                        <Chip
                          label={item.priority || 'MEDIUM'}
                          size="small"
                          sx={{
                            bgcolor: pStyle.bg,
                            color: pStyle.text,
                            fontWeight: 800,
                            border: `1px solid ${pStyle.border}`,
                          }}
                        />

                        <Chip label={item.category || 'GENERAL'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </Box>

                      {/* Action Tools */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {canPostNotice && (
                          <Tooltip title={item.pinned ? 'Unpin Notice' : 'Pin to Top'}>
                            <IconButton size="small" color={item.pinned ? 'warning' : 'default'} onClick={() => handleTogglePin(item)}>
                              {item.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}

                        {canPostNotice && (
                          <Tooltip title="Edit Notice">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canPostNotice && (
                          <Tooltip title="Delete Notice">
                            <IconButton size="small" color="error" onClick={() => setDeleteId(item._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>

                    {/* Notice Title */}
                    <Typography
                      variant="h6"
                      onClick={() => handleViewNoticeDetails(item)}
                      sx={{
                        fontWeight: 700,
                        color: '#0f172a',
                        cursor: 'pointer',
                        '&:hover': { color: '#0284c7', textDecoration: 'underline' },
                        mb: 1,
                      }}
                    >
                      {item.title}
                    </Typography>

                    {/* Content Preview */}
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                      {item.content.length > 320 ? `${item.content.substring(0, 320)}...` : item.content}
                    </Typography>

                    {/* Attachments Chips if present */}
                    {item.attachments && item.attachments.length > 0 && (
                      <Box sx={{ mb: 2, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                          ATTACHED DOCUMENTS ({item.attachments.length}):
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {item.attachments.map((att, idx) => (
                            <Chip
                              key={idx}
                              icon={<PictureAsPdfIcon sx={{ color: '#ef4444' }} />}
                              label={`${att.name} (${att.size || 'PDF'})`}
                              clickable
                              component="a"
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="default"
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Footer Meta Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Posted by: <strong style={{ color: '#1e293b' }}>{item.postedBy}</strong>
                          {item.postedByRole && ` (${item.postedByRole})`}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Audience: <strong>{item.targetRole}</strong>
                          {item.department && item.department !== 'ALL' && ` • Dept: ${item.department}`}
                          {item.semester ? ` • Sem: ${item.semester}` : ''}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          icon={<VisibilityIcon sx={{ fontSize: '0.875rem !important' }} />}
                          label={`${item.viewsCount || 0} Views`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                        />
                        <Typography variant="caption" color="text.disabled">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleViewNoticeDetails(item)}
                          sx={{ fontWeight: 700, textTransform: 'none', p: 0 }}
                        >
                          Read Full Notice →
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Publish / Edit Notice Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#fff' }}>
          {editingNotice ? 'Edit Campus Notice' : 'Publish Campus Notice & Announcement'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Notice Title"
              fullWidth
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              placeholder="e.g. End Semester Exam TimeTable Announcement 2026"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Post Classification" fullWidth value={formPostType} onChange={(e) => setFormPostType(e.target.value as NoticePostType)}>
                  <MenuItem value="ADMIN_POST">Admin Post (Executive Office)</MenuItem>
                  <MenuItem value="FACULTY_POST">Faculty Circular (Academic / HOD)</MenuItem>
                  <MenuItem value="STUDENT_NOTICE">Student Notice (General / Class)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Priority Level" fullWidth value={formPriority} onChange={(e) => setFormPriority(e.target.value as NoticePriority)}>
                  <MenuItem value="URGENT">🔴 Urgent Priority</MenuItem>
                  <MenuItem value="HIGH">🟠 High Priority</MenuItem>
                  <MenuItem value="MEDIUM">🔵 Medium Priority</MenuItem>
                  <MenuItem value="LOW">⚪ Low Priority</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Notice Category" fullWidth value={formCategory} onChange={(e) => setFormCategory(e.target.value as NoticeCategory)}>
                  <MenuItem value="ACADEMIC">Academic</MenuItem>
                  <MenuItem value="EXAM">Examination</MenuItem>
                  <MenuItem value="EVENT">Campus Event</MenuItem>
                  <MenuItem value="FEE">Finance & Fee Dues</MenuItem>
                  <MenuItem value="ADMIN">Administrative</MenuItem>
                  <MenuItem value="PLACEMENT">Placements & Careers</MenuItem>
                  <MenuItem value="SPORTS">Sports & Cultural</MenuItem>
                  <MenuItem value="GENERAL">General</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Target Audience" fullWidth value={formTargetRole} onChange={(e) => setFormTargetRole(e.target.value as any)}>
                  <MenuItem value="ALL">All Campus (Everyone)</MenuItem>
                  <MenuItem value="STUDENT">Students Only</MenuItem>
                  <MenuItem value="FACULTY">Faculty Only</MenuItem>
                  <MenuItem value="HOD">HODs Only</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Target Department" fullWidth value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)}>
                  <MenuItem value="ALL">All Departments</MenuItem>
                  <MenuItem value="Computer Science & Engineering">Computer Science & Engineering</MenuItem>
                  <MenuItem value="Electronics & Communication">Electronics & Communication</MenuItem>
                  <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                  <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
                  <MenuItem value="Business Administration">Business Administration</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Target Semester" fullWidth value={formSemester} onChange={(e) => setFormSemester(Number(e.target.value))}>
                  <MenuItem value={0}>All Semesters</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Detailed Notice Content"
              fullWidth
              multiline
              rows={5}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              required
              placeholder="Provide complete announcement details, instructions, venue, dates, and instructions for recipients..."
            />

            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={<Checkbox checked={formIsImportant} onChange={(e) => setFormIsImportant(e.target.checked)} color="error" />}
                label="Mark as High Importance Notice"
              />
              <FormControlLabel
                control={<Checkbox checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} color="warning" />}
                label="Pin Notice to Top of Board"
              />
            </Stack>

            <Divider />

            {/* Document Attachments Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Document Attachments ({formAttachments.length})
              </Typography>

              {formAttachments.length > 0 && (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {formAttachments.map((att, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InsertDriveFileIcon color="primary" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {att.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {att.fileType.toUpperCase()} • {att.size || '1.2 MB'}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton size="small" color="error" onClick={() => handleRemoveAttachment(idx)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Add Document Attachment
                </Typography>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField size="small" label="Document Title" fullWidth value={newAttName} onChange={(e) => setNewAttName(e.target.value)} placeholder="e.g. Examination_Routine.pdf" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField size="small" label="File URL (PDF / Doc)" fullWidth value={newAttUrl} onChange={(e) => setNewAttUrl(e.target.value)} placeholder="Optional custom link or leave blank" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button variant="outlined" size="medium" fullWidth startIcon={<AttachFileIcon />} onClick={handleAddAttachment} sx={{ fontWeight: 700 }}>
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bg: '#f8fafc' }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNotice} sx={{ fontWeight: 700, px: 3 }}>
            {editingNotice ? 'Update Notice' : 'Publish Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Notice Details Dialog */}
      <Dialog open={Boolean(viewingNotice)} onClose={() => setViewingNotice(null)} maxWidth="md" fullWidth>
        {viewingNotice && (
          <>
            <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {getPostTypeBadge(viewingNotice.postType)}
                <Chip label={viewingNotice.priority || 'MEDIUM'} size="small" color="primary" sx={{ fontWeight: 700 }} />
                <Chip label={viewingNotice.category || 'GENERAL'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                {viewingNotice.title}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px dashed #cbd5e1' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Author: {viewingNotice.postedBy} {viewingNotice.postedByRole ? `(${viewingNotice.postedByRole})` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Audience: {viewingNotice.targetRole} • Dept: {viewingNotice.department || 'ALL'}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Published on: {new Date(viewingNotice.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '1.05rem', color: '#1e293b' }}>
                {viewingNotice.content}
              </Typography>

              {viewingNotice.attachments && viewingNotice.attachments.length > 0 && (
                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#0f172a' }}>
                    Attached Documents ({viewingNotice.attachments.length}):
                  </Typography>
                  <Stack spacing={1.5}>
                    {viewingNotice.attachments.map((att, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PictureAsPdfIcon color="error" sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {att.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              File format: {att.fileType.toUpperCase()} • Size: {att.size || '1.2 MB'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          component="a"
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontWeight: 700 }}
                        >
                          Download Document
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewingNotice(null)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete Notice</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to permanently remove this notice from the campus portal?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ fontWeight: 700 }}>
            Delete Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
