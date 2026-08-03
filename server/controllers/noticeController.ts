import { Response } from 'express';
import Notice from '../models/Notice.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get all notices with query filters and search
// @route   GET /api/v1/notices
// @access  Protected
export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const { postType, category, priority, targetRole, department, search } = req.query;

    const query: any = {};

    // Role visibility filter
    if (userRole && userRole !== 'SUPER_ADMIN' && userRole !== 'PRINCIPAL') {
      query.targetRole = { $in: ['ALL', userRole] };
    }

    if (postType && postType !== 'ALL') query.postType = postType;
    if (category && category !== 'ALL') query.category = category;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (targetRole && targetRole !== 'ALL') query.targetRole = targetRole;
    if (department && department !== 'ALL') query.department = department;

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { postedBy: searchRegex },
        { category: searchRegex },
      ];
    }

    // Sort pinned notices first, then important notices, then newest
    const notices = await Notice.find(query).sort({ pinned: -1, isImportant: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single notice by ID & increment view count
// @route   GET /api/v1/notices/:id
// @access  Protected
export const getNoticeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found' });
      return;
    }

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create new notice
// @route   POST /api/v1/notices
// @access  Protected (Admin / Principal / HOD / Faculty)
export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      content,
      category,
      postType,
      priority,
      targetRole,
      department,
      semester,
      section,
      isImportant,
      pinned,
      attachments,
    } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Please provide both notice title and content.' });
      return;
    }

    const user = req.user;
    const postedBy = user ? `${user.name}` : 'Admin Office';
    const postedByRole = user ? user.role : 'SUPER_ADMIN';
    const postedById = user ? user._id.toString() : undefined;

    // Automatically assign default postType based on role if not provided
    let inferredPostType = postType;
    if (!inferredPostType) {
      if (['SUPER_ADMIN', 'PRINCIPAL'].includes(postedByRole)) {
        inferredPostType = 'ADMIN_POST';
      } else if (['HOD', 'FACULTY'].includes(postedByRole)) {
        inferredPostType = 'FACULTY_POST';
      } else {
        inferredPostType = 'STUDENT_NOTICE';
      }
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || 'GENERAL',
      postType: inferredPostType,
      priority: priority || 'MEDIUM',
      targetRole: targetRole || 'ALL',
      department: department || 'ALL',
      semester: semester || 0,
      section: section || 'ALL',
      postedBy,
      postedByRole,
      postedById,
      isImportant: isImportant || false,
      pinned: pinned || false,
      attachments: attachments || [],
    });

    res.status(201).json({
      success: true,
      message: 'Notice published successfully!',
      notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update existing notice
// @route   PUT /api/v1/notices/:id
// @access  Protected (Admin / Principal / HOD / Creator)
export const updateNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found' });
      return;
    }

    Object.assign(notice, req.body);
    await notice.save();

    res.json({
      success: true,
      message: 'Notice updated successfully!',
      notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/v1/notices/:id
// @access  Protected (Admin / Principal / HOD / Creator)
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

// @desc    Toggle notice pin status
// @route   PATCH /api/v1/notices/:id/pin
// @access  Protected
export const togglePinNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found' });
      return;
    }

    notice.pinned = !notice.pinned;
    await notice.save();

    res.json({
      success: true,
      message: notice.pinned ? 'Notice pinned to top' : 'Notice unpinned',
      pinned: notice.pinned,
      notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

