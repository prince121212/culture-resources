import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserUploads,
  getUserFavorites,
  getUserStats,
  getAvatar
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { param, body, validationResult } from 'express-validator';
import multer from 'multer';

// 创建内存存储配置
const memoryStorage = multer.memoryStorage();

// 创建 multer 实例，明确使用 memoryStorage
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for testing
  },
  fileFilter: (_req, file, cb) => {
    console.log(`[multer] Processing file: ${file.originalname}, mimetype: ${file.mimetype}`);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log(`[multer] File type accepted: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`[multer] File type rejected: ${file.mimetype}`);
      cb(new Error('不支持的文件类型: ' + file.mimetype));
    }
  }
});

const router = express.Router();

// 验证中间件
const validate = (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
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
  memoryUpload.single('avatar'),
  uploadAvatar
);

// 获取用户头像
router.get('/:id/avatar', getAvatar);

// 获取用户上传的资源
router.get('/uploads/:userId', userIdValidationRules(), validate, getUserUploads);

// 获取用户收藏的资源 (需要认证)
router.get('/favorites/:userId', protect, userIdValidationRules(), validate, getUserFavorites);

// 获取用户活动统计数据 (需要认证)
router.get('/:id/stats', protect, userIdValidationRules(), validate, getUserStats);

export default router;