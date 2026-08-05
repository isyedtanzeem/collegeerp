import express from 'express';
import {
  getSystemSettings,
  updateSystemSettings,
  getRolePermissions,
  updateRolePermission,
  updateUserProfile,
  changeUserPassword,
} from '../controllers/settingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/system', getSystemSettings);
router.put('/system', authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), updateSystemSettings);

router.get('/permissions', getRolePermissions);
router.put('/permissions/:role', authorizeRoles('SUPER_ADMIN'), updateRolePermission);

router.put('/profile', updateUserProfile);
router.put('/change-password', changeUserPassword);

export default router;
