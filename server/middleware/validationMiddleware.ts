import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ success: false, message: 'Valid email address is required' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Invalid email format' });
    return;
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    res.status(400).json({ success: false, message: 'Password is required' });
    return;
  }
  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ success: false, message: 'Please provide an email address' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    return;
  }
  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    return;
  }
  next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || typeof currentPassword !== 'string') {
    res.status(400).json({ success: false, message: 'Current password is required' });
    return;
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    return;
  }
  next();
};
