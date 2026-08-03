import { Router } from 'express';
import {
  getAssignments,
  getAssignmentStats,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsForAssignment,
  getStudentSubmissions,
} from '../controllers/assignmentController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Base assignment routes
router.get('/', getAssignments);
router.get('/stats', getAssignmentStats);
router.get('/student/my-submissions', getStudentSubmissions);
router.get('/:id', getAssignmentById);
router.get('/:id/submissions', getSubmissionsForAssignment);

// Faculty Actions with attachment file upload
router.post('/', upload.single('attachment'), createAssignment);
router.put('/:id', upload.single('attachment'), updateAssignment);
router.delete('/:id', deleteAssignment);

// Student Submission with submission file upload
router.post('/:id/submit', upload.single('submissionFile'), submitAssignment);

// Faculty Grading Action
router.put('/submissions/:submissionId/grade', gradeSubmission);

export default router;
