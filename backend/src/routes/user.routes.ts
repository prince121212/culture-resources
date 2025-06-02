import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserUploads,
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

// 用户ID验证规则 (用于 :userId 参数)
const userIdValidationRulesForUserId = () => [
  param('userId').isMongoId().withMessage('无效的用户ID格式'),
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
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('个人简介不能超过500个字符'),
];



// 具体路由放在前面，避免被通用路由匹配

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

// 获取用户上传的资源
router.get('/uploads/:userId', userIdValidationRulesForUserId(), validate, getUserUploads);

// 注意：获取用户收藏的功能已经在 /api/favorites 路由中实现
// 这个路由已被移除以避免功能重复和验证问题
// router.get('/favorites/:userId', protect, userIdValidationRulesForUserId(), validate, getUserFavorites);

// 通用路由放在后面

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

// 获取用户活动统计数据 (需要认证) - 放在最后，避免与其他路由冲突
router.get('/:id/stats', protect, userIdValidationRules(), validate, getUserStats);

export default router;