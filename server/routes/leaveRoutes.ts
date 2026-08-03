import { Router } from 'express';
import {
  getLeaves,
  getLeaveStats,
  getLeaveById,
  applyLeave,
  approveOrRejectLeave,
  cancelLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Query routes
router.get('/', getLeaves);
router.get('/stats', getLeaveStats);
router.get('/:id', getLeaveById);

// Leave Actions with optional file attachment
router.post('/', upload.single('attachment'), applyLeave);

// Approval Workflow Action (Approve / Reject)
router.put('/:id/workflow', approveOrRejectLeave);

// Applicant Cancel Action
router.put('/:id/cancel', cancelLeave);

// Admin Delete Action
router.delete('/:id', deleteLeave);

export default router;
