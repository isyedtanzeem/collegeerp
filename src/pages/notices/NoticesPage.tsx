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
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AddIcon from '@mui/icons-material/Add';
import { noticeService } from '../../services/noticeService.js';
import { Notice } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const NoticesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'ACADEMIC' | 'EXAM' | 'EVENT' | 'FEE' | 'GENERAL'>('GENERAL');
  const [targetRole, setTargetRole] = useState<'ALL' | 'FACULTY' | 'STUDENT' | 'HOD'>('ALL');
  const [isImportant, setIsImportant] = useState(false);

  const fetchNotices = async () => {
    if (!token) return;
    try {
      const res = await noticeService.getNotices();
      setNotices(res.notices || []);
    } catch (err) {
      console.error('[NoticesPage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [token]);

  const handleCreateNotice = async () => {
    if (!title || !content) return;
    try {
      await noticeService.createNotice({ title, content, category, targetRole, isImportant });
      setOpenDialog(false);
      setTitle('');
      setContent('');
      fetchNotices();
    } catch (err) {
      console.error('[NoticesPage] Error creating notice:', err);
    }
  };

  const canPostNotice = user && ['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(user.role);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Campus Notice Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Official announcements, examination schedules, academic updates, and events
          </Typography>
        </Box>
        {canPostNotice && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: 700 }}>
            Post Notice
          </Button>
        )}
      </Box>

      {/* Notices Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching campus announcements..." />
      ) : (
        <Grid container spacing={3}>
          {notices.map((item) => (
            <Grid size={{ xs: 12 }} key={item._id}>
              <Card sx={{ borderRadius: 3, borderLeft: item.isImportant ? '6px solid #ef4444' : '6px solid #0284c7' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      {item.isImportant && <Chip icon={<PriorityHighIcon />} label="Important" color="error" size="small" sx={{ fontWeight: 700 }} />}
                    </Box>
                    <Chip label={item.category} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                  </Box>

                  <Typography variant="body1" color="text.primary" sx={{ my: 1.5, lineHeight: 1.6 }}>
                    {item.content}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Posted by: <strong>{item.postedBy}</strong> • Target Audience: <strong>{item.targetRole}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Post Notice Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Publish Official Notice</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Notice Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextField label="Notice Content" fullWidth multiline rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
            <Stack direction="row" spacing={2}>
              <TextField select label="Category" fullWidth value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <MenuItem value="ACADEMIC">Academic</MenuItem>
                <MenuItem value="EXAM">Examination</MenuItem>
                <MenuItem value="EVENT">Campus Event</MenuItem>
                <MenuItem value="FEE">Finance / Fee</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>

              <TextField select label="Target Audience" fullWidth value={targetRole} onChange={(e) => setTargetRole(e.target.value as any)}>
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="STUDENT">Students Only</MenuItem>
                <MenuItem value="FACULTY">Faculty Only</MenuItem>
                <MenuItem value="HOD">HODs Only</MenuItem>
              </TextField>
            </Stack>

            <FormControlLabel control={<Checkbox checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />} label="Mark as High Priority / Important Notice" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateNotice} sx={{ fontWeight: 700 }}>
            Publish Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
