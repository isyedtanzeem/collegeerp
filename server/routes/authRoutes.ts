import express from 'express';
import {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', register);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);
router.put('/change-password', protect, validateChangePassword, changePassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
