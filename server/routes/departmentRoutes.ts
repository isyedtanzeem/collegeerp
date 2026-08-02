import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), updateDepartment)
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), deleteDepartment);

export default router;
