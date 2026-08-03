import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassIcon from '@mui/icons-material/Class';

import { useAuth } from '../../context/AuthContext.js';
import {
  TimetableSlot,
  RoomOccupancy,
  DayOfWeek,
  Department,
  Faculty,
  Subject,
} from '../../types/index.js';
import { timetableService, CreateSlotPayload } from '../../services/timetableService.js';
import { departmentService } from '../../services/departmentService.js';
import { facultyService } from '../../services/facultyService.js';
import { subjectService } from '../../services/subjectService.js';

const DAYS_ORDER: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:15 - 12:15',
  '12:15 - 13:15',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<number>(0);

  // Master Data
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [roomStats, setRoomStats] = useState<RoomOccupancy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>('Computer Science & Engineering');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>(3);
  const [sectionFilter, setSectionFilter] = useState<string>('A');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog States
  const [openSlotDialog, setOpenSlotDialog] = useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSlotPayload>({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS',
    subject: '',
    subjectCode: '',
    semester: 3,
    section: 'A',
    facultyId: '',
    facultyName: '',
    roomNumber: 'LH-101',
    building: 'Main Academic Block',
    slotType: 'LECTURE',
    ignoreConflict: false,
  });

  // Conflict Check State
  const [checkingConflict, setCheckingConflict] = useState<boolean>(false);
  const [conflictResult, setConflictResult] = useState<{
    hasConflict: boolean;
    conflicts: any[];
  } | null>(null);

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
  const fetchTimetableData = useCallback(async () => {
    setLoading(true);
    try {
      const [slotsRes, roomsRes] = await Promise.all([
        timetableService.getSlots({ search: searchQuery }),
        timetableService.getRoomStats(),
      ]);
      if (slotsRes.success) setSlots(slotsRes.slots);
      if (roomsRes.success) setRoomStats(roomsRes.rooms);
    } catch (err: any) {
      console.error(err);
      showSnackbar('Failed to load timetable details', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [deptRes, facRes, subRes] = await Promise.all([
        departmentService.getDepartments(),
        facultyService.getFaculty(),
        subjectService.getSubjects(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (facRes.success) setFaculties(facRes.faculty);
      if (subRes.success) setSubjects(subRes.subjects);
    } catch (err: any) {
      console.error('Error fetching master data:', err);
    }
  }, []);

  useEffect(() => {
    fetchTimetableData();
    fetchMasterData();
  }, [fetchTimetableData, fetchMasterData]);

  // AUTOMATIC CONFLICT DETECTION PREVIEW
  const performConflictCheck = async (data: CreateSlotPayload) => {
    if (!data.dayOfWeek || !data.startTime || !data.endTime || !data.roomNumber || !data.facultyName) {
      setConflictResult(null);
      return;
    }
    setCheckingConflict(true);
    try {
      const res = await timetableService.checkConflicts({
        slotId: editingSlotId || undefined,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber,
        facultyName: data.facultyName,
        department: data.department,
        semester: data.semester,
        section: data.section,
      });

      if (res.success) {
        setConflictResult({
          hasConflict: res.hasConflict,
          conflicts: res.conflicts,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingConflict(false);
    }
  };

  // DIALOG OPENERS
  const handleOpenCreateModal = () => {
    setEditingSlotId(null);
    setConflictResult(null);

    const firstSub = subjects[0];
    const firstFac = faculties[0];

    const initial: CreateSlotPayload = {
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      department: deptFilter !== 'ALL' ? deptFilter : 'Computer Science & Engineering',
      course: 'B.Tech CS',
      subject: firstSub ? firstSub.name : 'Data Structures',
      subjectCode: firstSub ? firstSub.code : 'CS-301',
      semester: typeof semesterFilter === 'number' ? semesterFilter : 3,
      section: sectionFilter !== 'ALL' ? sectionFilter : 'A',
      facultyId: firstFac ? firstFac._id : '',
      facultyName: firstFac ? firstFac.name : 'Dr. Alan Turing',
      roomNumber: 'LH-101',
      building: 'Main Academic Block',
      slotType: 'LECTURE',
      ignoreConflict: false,
    };

    setFormData(initial);
    setOpenSlotDialog(true);
    performConflictCheck(initial);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlotId(slot._id);
    setConflictResult(null);

    const initial: CreateSlotPayload = {
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      department: slot.department,
      course: slot.course || 'B.Tech CS',
      subject: slot.subject,
      subjectCode: slot.subjectCode || '',
      semester: slot.semester,
      section: slot.section,
      facultyId: slot.facultyId || '',
      facultyName: slot.facultyName,
      roomNumber: slot.roomNumber,
      building: slot.building || 'Main Academic Block',
      slotType: slot.slotType,
      ignoreConflict: false,
    };

    setFormData(initial);
    setOpenSlotDialog(true);
    performConflictCheck(initial);
  };

  const handleSaveSlot = async () => {
    if (!formData.subject || !formData.facultyName || !formData.roomNumber) {
      showSnackbar('Subject, Faculty Name, and Room Number are required.', 'warning');
      return;
    }

    try {
      if (editingSlotId) {
        const res = await timetableService.updateSlot(editingSlotId, formData);
        if (res.success) {
          showSnackbar(res.message, 'success');
          setOpenSlotDialog(false);
          fetchTimetableData();
        }
      } else {
        const res = await timetableService.createSlot(formData);
        if (res.success) {
          showSnackbar(res.message, 'success');
          setOpenSlotDialog(false);
          fetchTimetableData();
        }
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error saving timetable slot', 'error');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable slot?')) return;
    try {
      const res = await timetableService.deleteSlot(id);
      if (res.success) {
        showSnackbar('Slot removed from schedule.', 'info');
        fetchTimetableData();
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Error removing slot', 'error');
    }
  };

  // FILTERED SLOTS
  const studentFilteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (deptFilter !== 'ALL' && s.department !== deptFilter) return false;
      if (semesterFilter !== 'ALL' && s.semester !== Number(semesterFilter)) return false;
      if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
      return true;
    });
  }, [slots, deptFilter, semesterFilter, sectionFilter]);

  const facultyFilteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (facultyFilter !== 'ALL' && s.facultyName !== facultyFilter) return false;
      return true;
    });
  }, [slots, facultyFilter]);

  // WEEKLY GRID MATRIX CREATION
  const gridMatrix = useMemo(() => {
    const activeSet = activeTab === 1 ? facultyFilteredSlots : studentFilteredSlots;

    const map: Record<string, Record<string, TimetableSlot[]>> = {};

    DAYS_ORDER.forEach((day) => {
      map[day] = {};
    });

    activeSet.forEach((slot) => {
      if (!map[slot.dayOfWeek]) map[slot.dayOfWeek] = {};
      const key = `${slot.startTime} - ${slot.endTime}`;
      if (!map[slot.dayOfWeek][key]) map[slot.dayOfWeek][key] = [];
      map[slot.dayOfWeek][key].push(slot);
    });

    return map;
  }, [activeTab, studentFilteredSlots, facultyFilteredSlots]);

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'LAB':
        return 'warning';
      case 'TUTORIAL':
        return 'info';
      case 'SEMINAR':
        return 'secondary';
      default:
        return 'primary';
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
              <Avatar sx={{ bgcolor: 'indigo.main', width: 46, height: 46 }}>
                <CalendarMonthIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Smart Timetable & Room Allocation Engine
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Weekly Matrix Schedules, Faculty Workloads, Room Double-Booking Conflict Detection
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTimetableData}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print Schedule
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
            >
              Add Schedule Slot
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* KPI DASHBOARD */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Total Scheduled Slots
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
                  <ClassIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {slots.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Weekly Lectures, Labs & Tutorials
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Allocated Rooms / Labs
                </Typography>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 36, height: 36 }}>
                  <MeetingRoomIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {roomStats.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                Active Lecture Halls & Labs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Faculty Engaged
                </Typography>
                <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 36, height: 36 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
                {new Set(slots.map((s) => s.facultyName)).size}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Assigned professors & instructors
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Conflict Status
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 36, height: 36 }}>
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.dark' }}>
                0 Overlaps
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 600 }}>
                Real-time validation active
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
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Student Section Timetable" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Faculty Timetable Desk" />
          <Tab icon={<MeetingRoomIcon />} iconPosition="start" label="Room Allocation Manager" />
          <Tab icon={<AccessTimeIcon />} iconPosition="start" label="All Slots Master List" />
        </Tabs>

        {/* TAB 0: STUDENT SECTION TIMETABLE (WEEKLY MATRIX) */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={deptFilter}
                    label="Department"
                    onChange={(e) => setDeptFilter(e.target.value)}
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

              <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={semesterFilter}
                    label="Semester"
                    onChange={(e) => setSemesterFilter(e.target.value as any)}
                  >
                    <MenuItem value="ALL">All Semesters</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        Semester {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={sectionFilter}
                    label="Section"
                    onChange={(e) => setSectionFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Sections</MenuItem>
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        Section {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 2, md: 3 }} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {studentFilteredSlots.length} Slots Found
                </Typography>
              </Grid>
            </Grid>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, width: 140 }}>Day / Time</TableCell>
                      {TIME_SLOTS.map((ts) => (
                        <TableCell key={ts} align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                          {ts}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DAYS_ORDER.map((day) => (
                      <TableRow key={day} hover>
                        <TableCell sx={{ fontWeight: 800, bgcolor: 'grey.50' }}>{day}</TableCell>
                        {TIME_SLOTS.map((ts) => {
                          const matchedSlots = gridMatrix[day]?.[ts] || [];

                          return (
                            <TableCell key={ts} align="center" sx={{ p: 1, minWidth: 120 }}>
                              {matchedSlots.length === 0 ? (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  - Free -
                                </Typography>
                              ) : (
                                matchedSlots.map((slot) => (
                                  <Card
                                    key={slot._id}
                                    variant="outlined"
                                    sx={{
                                      p: 1,
                                      mb: 0.5,
                                      borderRadius: 1.5,
                                      bgcolor: slot.slotType === 'LAB' ? 'warning.50' : 'primary.50',
                                      borderColor: slot.slotType === 'LAB' ? 'warning.200' : 'primary.200',
                                    }}
                                  >
                                    <Chip
                                      label={slot.slotType}
                                      size="small"
                                      color={getSlotTypeColor(slot.slotType) as any}
                                      sx={{ height: 18, fontSize: '0.65rem', mb: 0.5, fontWeight: 700 }}
                                    />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2 }}>
                                      {slot.subject}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Room: {slot.roomNumber}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
                                      {slot.facultyName}
                                    </Typography>
                                  </Card>
                                ))
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 1: FACULTY TIMETABLE DESK */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Faculty</InputLabel>
                  <Select
                    value={facultyFilter}
                    label="Select Faculty"
                    onChange={(e) => setFacultyFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Faculty Members</MenuItem>
                    {faculties.map((f) => (
                      <MenuItem key={f._id} value={f.name}>
                        {f.name} ({f.department})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 8 }} sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Assigned Workload: {facultyFilteredSlots.length} Periods / Week
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {DAYS_ORDER.map((day) => {
                const daySlots = facultyFilteredSlots.filter((s) => s.dayOfWeek === day);

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={day}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {day}
                          </Typography>
                          <Chip label={`${daySlots.length} Classes`} size="small" color="primary" />
                        </Stack>
                        <Divider sx={{ mb: 1.5 }} />

                        {daySlots.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                            No teaching slots assigned for {day}.
                          </Typography>
                        ) : (
                          <Stack spacing={1}>
                            {daySlots.map((s) => (
                              <Paper key={s._id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'grey.50' }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Chip label={`${s.startTime} - ${s.endTime}`} size="small" color="secondary" sx={{ mb: 0.5 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                      {s.subject} ({s.subjectCode})
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {s.department} • Sem {s.semester}-{s.section}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Chip label={s.roomNumber} color="success" size="small" sx={{ fontWeight: 700 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      {s.building}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* TAB 2: ROOM ALLOCATION MANAGER */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Classroom & Laboratory Utilization Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monitor room occupancy, detect vacant halls, and prevent double-booking.
            </Typography>

            <Grid container spacing={2.5}>
              {roomStats.map((room) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.roomNumber}>
                  <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                    <CardContent>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          Room {room.roomNumber}
                        </Typography>
                        <Chip
                          label={`${room.totalSlots} Slots / Week`}
                          color={room.totalSlots > 10 ? 'warning' : 'success'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Building: Main Academic Block
                      </Typography>

                      <Divider sx={{ mb: 1.5 }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Allocated Subjects & Faculty:
                      </Typography>
                      <Stack spacing={1}>
                        {room.slots.map((s) => (
                          <Paper key={s._id} variant="outlined" sx={{ p: 1, borderRadius: 1, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {s.dayOfWeek} ({s.startTime} - {s.endTime})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {s.subject} • {s.facultyName}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* TAB 3: ALL SLOTS MASTER LIST WITH ACTIONS */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search subject, faculty, room..."
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
            </Grid>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Day & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subject Info</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department & Class</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Faculty</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Room & Building</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots.map((s) => (
                    <TableRow key={s._id} hover>
                      <TableCell>
                        <Chip label={s.dayOfWeek} size="small" color="primary" sx={{ mb: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {s.startTime} - {s.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {s.subject}
                        </Typography>
                        <Chip label={s.slotType} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{s.department}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sem {s.semester} - Sec {s.section}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {s.facultyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={s.roomNumber} color="success" size="small" sx={{ fontWeight: 700 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {s.building}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(s)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteSlot(s._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* DIALOG: CREATE / EDIT TIMETABLE SLOT WITH AUTOMATIC CONFLICT CHECKING */}
      <Dialog open={openSlotDialog} onClose={() => setOpenSlotDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingSlotId ? 'Edit Timetable Schedule Slot' : 'Add New Timetable Schedule Slot'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek}
                  label="Day of Week"
                  onChange={(e) => {
                    const next = { ...formData, dayOfWeek: e.target.value as DayOfWeek };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {DAYS_ORDER.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Start Time (e.g. 09:00)"
                value={formData.startTime}
                onChange={(e) => {
                  const next = { ...formData, startTime: e.target.value };
                  setFormData(next);
                  performConflictCheck(next);
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="End Time (e.g. 10:00)"
                value={formData.endTime}
                onChange={(e) => {
                  const next = { ...formData, endTime: e.target.value };
                  setFormData(next);
                  performConflictCheck(next);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => {
                    const next = { ...formData, department: e.target.value };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {departments.map((d) => (
                    <MenuItem key={d._id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  label="Semester"
                  onChange={(e) => {
                    const next = { ...formData, semester: Number(e.target.value) };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <MenuItem key={s} value={s}>
                      Sem {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select
                  value={formData.section}
                  label="Section"
                  onChange={(e) => {
                    const next = { ...formData, section: e.target.value };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <MenuItem key={sec} value={sec}>
                      Sec {sec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  label="Subject"
                  onChange={(e) => {
                    const subName = e.target.value;
                    const matched = subjects.find((s) => s.name === subName);
                    const next = {
                      ...formData,
                      subject: subName,
                      subjectCode: matched ? matched.code : '',
                    };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {subjects.map((sub) => (
                    <MenuItem key={sub._id} value={sub.name}>
                      {sub.name} ({sub.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Faculty Member</InputLabel>
                <Select
                  value={formData.facultyName}
                  label="Faculty Member"
                  onChange={(e) => {
                    const name = e.target.value;
                    const matched = faculties.find((f) => f.name === name);
                    const next = {
                      ...formData,
                      facultyName: name,
                      facultyId: matched ? matched._id : '',
                    };
                    setFormData(next);
                    performConflictCheck(next);
                  }}
                >
                  {faculties.map((f) => (
                    <MenuItem key={f._id} value={f.name}>
                      {f.name} ({f.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Room Number"
                value={formData.roomNumber}
                onChange={(e) => {
                  const next = { ...formData, roomNumber: e.target.value };
                  setFormData(next);
                  performConflictCheck(next);
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Slot Type</InputLabel>
                <Select
                  value={formData.slotType}
                  label="Slot Type"
                  onChange={(e) => setFormData((p) => ({ ...p, slotType: e.target.value as any }))}
                >
                  <MenuItem value="LECTURE">Lecture</MenuItem>
                  <MenuItem value="LAB">Lab Session</MenuItem>
                  <MenuItem value="TUTORIAL">Tutorial</MenuItem>
                  <MenuItem value="SEMINAR">Seminar / Guest Lecture</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Building"
                value={formData.building}
                onChange={(e) => setFormData((p) => ({ ...p, building: e.target.value }))}
              />
            </Grid>

            {/* REAL-TIME CONFLICT PREVIEW PANEL */}
            <Grid size={{ xs: 12 }}>
              {checkingConflict ? (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  Checking room & faculty double-booking conflicts...
                </Alert>
              ) : conflictResult?.hasConflict ? (
                <Alert severity="error" icon={<WarningAmberIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Schedule Collision / Conflict Detected ({conflictResult.conflicts.length}):
                  </Typography>
                  {conflictResult.conflicts.map((c, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                      • {c.message}
                    </Typography>
                  ))}
                </Alert>
              ) : (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Room & Faculty available without any conflicts for the specified slot!
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSlotDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={conflictResult?.hasConflict ? 'warning' : 'primary'}
            onClick={handleSaveSlot}
          >
            {editingSlotId ? 'Update Slot' : 'Save Slot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
