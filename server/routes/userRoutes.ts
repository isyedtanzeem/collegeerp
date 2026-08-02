import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getUsers)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), updateUser)
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), deleteUser);

export default router;
