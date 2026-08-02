import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  assignFaculty,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), createSubject);

router
  .route('/:id/assign-faculty')
  .patch(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), assignFaculty);

router
  .route('/:id')
  .get(getSubjectById)
  .put(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), updateSubject)
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), deleteSubject);

export default router;
