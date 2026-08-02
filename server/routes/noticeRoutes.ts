import express from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotices)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'), createNotice);

router
  .route('/:id')
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), deleteNotice);

export default router;
