import { Router } from 'express';
import {
  getSettings,
  getSettingByKey,
  updateSetting,
  updateSettings,
  initializeSettings
} from '../controllers/setting.controller';
import { protect, isAdmin } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';
import { validate } from '../validators/resource.validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// 获取所有设置（公开设置对所有人可见，非公开设置只对管理员可见）
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getSettings(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取单个设置（公开设置对所有人可见，非公开设置只对管理员可见）
router.get('/:key', param('key').notEmpty().withMessage('设置键名不能为空'), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getSettingByKey(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 更新单个设置（仅管理员可操作）
router.put(
  '/:key',
  protect,
  isAdmin,
  [
    param('key').notEmpty().withMessage('设置键名不能为空'),
    body('value').exists().withMessage('设置值不能为空'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateSetting(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 批量更新设置（仅管理员可操作）
router.put(
  '/',
  protect,
  isAdmin,
  [
    body('settings').isArray().withMessage('settings必须是数组'),
    body('settings.*.key').notEmpty().withMessage('每个设置项必须包含key字段'),
    body('settings.*.value').exists().withMessage('每个设置项必须包含value字段'),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateSettings(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 初始化默认设置（仅管理员可操作）
router.post('/init', protect, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await initializeSettings(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
