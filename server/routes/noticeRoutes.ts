import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  togglePinNotice,
} from '../controllers/noticeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotices)
  .post(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'), createNotice);

router
  .route('/:id')
  .get(getNoticeById)
  .put(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'), updateNotice)
  .delete(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'), deleteNotice);

router
  .route('/:id/pin')
  .patch(authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'HOD'), togglePinNotice);

export default router;

