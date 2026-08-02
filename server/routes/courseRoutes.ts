import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCourses)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), createCourse);

router
  .route('/:id')
  .get(getCourseById)
  .put(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), updateCourse)
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), deleteCourse);

export default router;

