import { Router } from 'express';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagResources,
  importTagsFromExcel,
  syncTagCounts,
} from '../controllers/tag.controller';
import { protect, isAdmin } from '../middleware/auth.middleware';
import { param, body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { excelUpload } from '../config/excel-upload';

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

// 标签ID验证规则
const tagIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('无效的标签ID格式');
    }
    return true;
  }),
];

// 创建标签验证规则
const createTagValidationRules = () => [
  body('name')
    .notEmpty()
    .withMessage('标签名称不能为空')
    .isLength({ min: 1, max: 30 })
    .withMessage('标签名称长度必须在1-30个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('标签描述不能超过200个字符'),
];

// 更新标签验证规则
const updateTagValidationRules = () => [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('标签名称不能为空')
    .isLength({ min: 1, max: 30 })
    .withMessage('标签名称长度必须在1-30个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('标签描述不能超过200个字符'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive必须是布尔值'),
];

// 公开路由
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTags(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', tagIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTagById(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/resources', tagIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTagResources(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 管理员路由（需要认证和管理员权限）
router.post(
  '/',
  protect,
  isAdmin,
  createTagValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createTag(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  protect,
  isAdmin,
  tagIdValidationRules(),
  updateTagValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateTag(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Excel批量导入标签
router.post(
  '/import',
  protect,
  isAdmin,
  excelUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await importTagsFromExcel(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// 同步标签资源计数
router.post(
  '/sync-counts',
  protect,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await syncTagCounts(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  tagIdValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteTag(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
