import { Router } from 'express';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';
import { param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const router = Router();

// 验证中间件
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// 通知ID验证规则
const notificationIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('无效的通知ID格式');
    }
    return true;
  }),
];

// 所有通知路由都需要先验证用户是否已登录
router.use(protect);

// 获取用户的通知列表
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserNotifications(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取用户未读通知数量
router.get('/unread/count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUnreadNotificationCount(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 标记通知为已读
router.patch(
  '/:id/read',
  notificationIdValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await markNotificationAsRead(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 标记所有通知为已读
router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await markAllNotificationsAsRead(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 删除通知
router.delete(
  '/:id',
  notificationIdValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteNotification(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
