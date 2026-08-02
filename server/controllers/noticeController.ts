import { Response } from 'express';
import Notice from '../models/Notice.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const query: any = {};

    if (userRole && userRole !== 'SUPER_ADMIN' && userRole !== 'PRINCIPAL') {
      query.targetRole = { $in: ['ALL', userRole] };
    }

    const notices = await Notice.find(query).sort({ isImportant: -1, createdAt: -1 });
    res.json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, targetRole, isImportant } = req.body;
    const postedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Admin Office';

    const notice = await Notice.create({
      title,
      content,
      category: category || 'GENERAL',
      targetRole: targetRole || 'ALL',
      postedBy,
      isImportant: isImportant || false,
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found' });
      return;
    }
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
