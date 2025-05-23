import express, { Express } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserUploads,
  getUserFavorites,
  getUserStats
} from '../controllers/user.controller';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
import { param, body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const router = express.Router();

// 验证中间件
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// 用户ID验证规则
const userIdValidationRules = () => [
  param('id').custom((value) => {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new Error('无效的用户ID格式');
    }
    return true;
  }),
];

// 用户资料更新验证规则
const userProfileUpdateValidationRules = () => [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请提供有效的邮箱地址'),
];

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 限制2MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)') as any);
    }
  }
});

// 获取用户资料
router.get('/profile/:id', userIdValidationRules(), validate, getUserProfile);

// 更新用户资料 (需要认证)
router.put(
  '/profile/:id',
  protect,
  userIdValidationRules(),
  userProfileUpdateValidationRules(),
  validate,
  updateUserProfile
);

// 上传用户头像 (需要认证)
router.post(
  '/:id/avatar',
  protect,
  userIdValidationRules(),
  validate,
  upload.single('avatar'),
  uploadAvatar
);

// 获取用户上传的资源
router.get('/uploads/:userId', userIdValidationRules(), validate, getUserUploads);

// 获取用户收藏的资源 (需要认证)
router.get('/favorites/:userId', protect, userIdValidationRules(), validate, getUserFavorites);

// 获取用户活动统计数据 (需要认证)
router.get('/:id/stats', protect, userIdValidationRules(), validate, getUserStats);

export default router;