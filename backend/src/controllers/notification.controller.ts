import { Request, Response, NextFunction } from 'express';
import Notification from '../models/notification.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

// @desc    获取用户的通知列表
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权，无法获取通知' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;

    // 构建查询条件
    const query: any = { user: userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const totalNotifications = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户未读通知数量
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadNotificationCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权，无法获取通知数量' });
    }

    const count = await Notification.countDocuments({ user: userId, isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

// @desc    标记通知为已读
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '未授权，无法标记通知为已读' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的通知ID格式' });
    }

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      return res.status(404).json({ message: '通知不存在或不属于当前用户' });
    }

    if (notification.isRead) {
      return res.status(200).json({ message: '通知已经被标记为已读', data: notification });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: '通知已标记为已读', data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    标记所有通知为已读
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权，无法标记通知为已读' });
    }

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: '所有通知已标记为已读',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除通知
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '未授权，无法删除通知' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的通知ID格式' });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!notification) {
      return res.status(404).json({ message: '通知不存在或不属于当前用户' });
    }

    res.status(200).json({ message: '通知已删除', data: notification });
  } catch (error) {
    next(error);
  }
};
