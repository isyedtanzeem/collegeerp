import express from 'express';
import {
  getSystemSettings,
  updateSystemSettings,
  getRolePermissions,
  updateRolePermission,
  updateUserProfile,
  changeUserPassword,
} from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

router.get('/permissions', getRolePermissions);
router.put('/permissions/:role', updateRolePermission);

router.put('/profile', updateUserProfile);
router.put('/change-password', changeUserPassword);

export default router;
