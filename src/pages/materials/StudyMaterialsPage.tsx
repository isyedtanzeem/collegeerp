import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../../context/AuthContext.js';

interface MaterialItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  type: 'PDF' | 'PPT' | 'QUESTION_PAPER' | 'SYLLABUS' | 'NOTES';
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  downloadUrl: string;
  description: string;
  semester: number;
}

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-001',
    title: 'Data Structures Complete Lecture Notes (Sem 3)',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algorithms',
    type: 'PDF',
    fileSize: '4.8 MB',
    uploadDate: '2026-03-10',
    uploadedBy: 'Dr. Robert Vance',
    downloadUrl: '#',
    description: 'Comprehensive notes covering Arrays, Linked Lists, Trees, Graphs, and Hash Tables with C++ examples.',
    semester: 3,
  },
  {
    id: 'mat-002',
    title: 'DBMS Unit 2: Relational Algebra & SQL PPT',
    subjectCode: 'CS302',
    subjectName: 'Database Management Systems',
    type: 'PPT',
    fileSize: '12.4 MB',
    uploadDate: '2026-03-14',
    uploadedBy: 'Prof. Anita Sharma',
    downloadUrl: '#',
    description: 'Class presentation slides covering ER diagrams, Relational Schema, and SQL query optimization.',
    semester: 3,
  },
  {
    id: 'mat-003',
    title: 'Operating Systems End-Sem Question Papers (2022-2025)',
    subjectCode: 'CS303',
    subjectName: 'Operating Systems',
    type: 'QUESTION_PAPER',
    fileSize: '2.1 MB',
    uploadDate: '2026-02-28',
    uploadedBy: 'Exam Cell Archive',
    downloadUrl: '#',
    description: 'Compilation of past 4 years end-semester examination question papers with model solution guidelines.',
    semester: 3,
  },
  {
    id: 'mat-004',
    title: 'B.Tech CSE Semester 3 Official Course Syllabus & Lab Manual',
    subjectCode: 'CS300',
    subjectName: 'Curriculum Specification',
    type: 'SYLLABUS',
    fileSize: '1.5 MB',
    uploadDate: '2026-01-15',
    uploadedBy: 'Academic Council',
    downloadUrl: '#',
    description: 'Official university curriculum roadmap, credit allocation, grading rules, and lab experiment guidelines.',
    semester: 3,
  },
  {
    id: 'mat-005',
    title: 'Web Development React & Node.js Quick Reference Sheet',
    subjectCode: 'CS304',
    subjectName: 'Full Stack Web Development',
    type: 'NOTES',
    fileSize: '850 KB',
    uploadDate: '2026-03-18',
    uploadedBy: 'Er. David Miller',
    downloadUrl: '#',
    description: 'Cheatsheet for React hooks, Express router middleware, REST conventions, and async/await syntax.',
    semester: 3,
  },
  {
    id: 'mat-006',
    title: 'Discrete Mathematics Graph Theory Solved Problems',
    subjectCode: 'MA301',
    subjectName: 'Discrete Mathematics',
    type: 'PDF',
    fileSize: '3.2 MB',
    uploadDate: '2026-03-02',
    uploadedBy: 'Dr. Sarah Connor',
    downloadUrl: '#',
    description: 'Step-by-step solutions for graph isomorphism, Euler paths, Dijkstra algorithm, and tree traversals.',
    semester: 3,
  },
];

export const StudyMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF':
        return <PictureAsPdfIcon color="error" />;
      case 'PPT':
        return <SlideshowIcon color="warning" />;
      case 'QUESTION_PAPER':
        return <QuizIcon color="secondary" />;
      case 'SYLLABUS':
        return <MenuBookIcon color="info" />;
      case 'NOTES':
      default:
        return <DescriptionIcon color="primary" />;
    }
  };

  const filteredMaterials = INITIAL_MATERIALS.filter((mat) => {
    const matchesSearch =
      mat.title.toLowerCase().includes(search.toLowerCase()) ||
      mat.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
      mat.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      mat.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || mat.type === selectedType;
    const matchesSubject = selectedSubject === 'ALL' || mat.subjectCode === selectedSubject;

    return matchesSearch && matchesType && matchesSubject;
  });

  const handleDownload = (mat: MaterialItem) => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `Community College ERP - Official Study Resource\n\nTitle: ${mat.title}\nSubject: ${mat.subjectCode} - ${mat.subjectName}\nType: ${mat.type}\nUploaded By: ${mat.uploadedBy}\nUpload Date: ${mat.uploadDate}\n\nDescription:\n${mat.description}\n\n[This is a simulated document generated by the ERP System]`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${mat.subjectCode}_${mat.type}_${mat.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
          Study Materials & E-Resources
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Access lecture notes, presentation slides, previous semester question papers, and official course syllabi.
        </Typography>
      </Box>

      {/* Filters Toolbar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, subject code, topic, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Button size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </Button>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Material Type</InputLabel>
              <Select value={selectedType} label="Material Type" onChange={(e) => setSelectedType(e.target.value)}>
                <MenuItem value="ALL">All Resource Types</MenuItem>
                <MenuItem value="PDF">PDF Lecture Notes</MenuItem>
                <MenuItem value="PPT">Presentation Slides (PPT)</MenuItem>
                <MenuItem value="QUESTION_PAPER">Question Papers</MenuItem>
                <MenuItem value="SYLLABUS">Course Syllabus</MenuItem>
                <MenuItem value="NOTES">Quick Notes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 3.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Subject</InputLabel>
              <Select value={selectedSubject} label="Filter by Subject" onChange={(e) => setSelectedSubject(e.target.value)}>
                <MenuItem value="ALL">All Enrolled Subjects</MenuItem>
                <MenuItem value="CS301">CS301 - Data Structures</MenuItem>
                <MenuItem value="CS302">CS302 - DBMS</MenuItem>
                <MenuItem value="CS303">CS303 - Operating Systems</MenuItem>
                <MenuItem value="CS304">CS304 - Web Development</MenuItem>
                <MenuItem value="MA301">MA301 - Discrete Math</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <FolderZipIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No study materials match your search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try clearing filters or searching for another subject or keyword.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((mat) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={mat.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                      label={mat.subjectCode}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 800, fontFamily: 'monospace', borderRadius: 1.5 }}
                    />
                    <Chip
                      label={mat.type.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'grey.100', width: 42, height: 42 }}>
                      {getIconForType(mat.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {mat.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {mat.subjectName}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: '0.85rem' }}>
                    {mat.description}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      By <strong>{mat.uploadedBy}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mat.fileSize}
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, bgcolor: 'grey.50', borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(mat)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Download Resource
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
