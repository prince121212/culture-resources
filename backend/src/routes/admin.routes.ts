import { Router } from 'express';
import {
  getPendingResources,
  reviewResource,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  getUserStats,
  getUserResources,
  getSystemStats,
} from '../controllers/admin.controller';
import { protect, isAdmin } from '../middleware/auth.middleware';
import { param, body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const router = Router();

// 验证中间件
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // Ensure no implicit return of Response
  }
  next();
};

// 资源ID验证规则
const resourceIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('无效的资源ID格式');
    }
    return true;
  }),
];

// 用户ID验证规则
const userIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('无效的用户ID格式');
    }
    return true;
  }),
];

// 资源审核验证规则
const resourceReviewValidationRules = () => [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('状态必须是 approved 或 rejected'),
  body('rejectReason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('拒绝资源时必须提供拒绝原因')
    .isLength({ min: 5, max: 500 })
    .withMessage('拒绝原因必须在5-500个字符之间'),
];

// 用户角色更新验证规则
const userRoleUpdateValidationRules = () => [
  body('role')
    .isIn(['user', 'contributor', 'admin'])
    .withMessage('角色必须是 user、contributor 或 admin'),
];

// 所有管理员路由都需要先验证用户是否已登录，然后验证是否是管理员
router.use(protect, isAdmin);

// 获取待审核资源列表
router.get('/resources/pending', getPendingResources);

// 审核资源
router.put(
  '/resources/:id/review',
  resourceIdValidationRules(),
  resourceReviewValidationRules(),
  validate,
  reviewResource
);

// 用户状态更新验证规则
const userStatusUpdateValidationRules = () => [
  body('status')
    .isIn(['active', 'inactive', 'banned'])
    .withMessage('状态必须是 active、inactive 或 banned'),
];

// 用户信息更新验证规则
const userUpdateValidationRules = () => [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请提供有效的邮箱地址'),
  body('role')
    .optional()
    .isIn(['user', 'contributor', 'admin'])
    .withMessage('角色必须是 user、contributor 或 admin'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'banned'])
    .withMessage('状态必须是 active、inactive 或 banned'),
  body('points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('积分必须是非负整数'),
];

// 获取所有用户列表
router.get('/users', getUsers);

// 获取单个用户详情
router.get('/users/:id', userIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserById(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 更新用户信息
router.put(
  '/users/:id',
  userIdValidationRules(),
  userUpdateValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 更新用户角色
router.put(
  '/users/:id/role',
  userIdValidationRules(),
  userRoleUpdateValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateUserRole(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 更新用户状态
router.put(
  '/users/:id/status',
  userIdValidationRules(),
  userStatusUpdateValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateUserStatus(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 获取用户统计数据
router.get('/users/:id/stats', userIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserStats(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取用户上传的资源
router.get('/users/:id/resources', userIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserResources(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取系统统计数据
router.get('/stats', getSystemStats);

export default router;
