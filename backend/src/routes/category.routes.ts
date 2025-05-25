import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryResources,
  importCategoriesFromExcel,
} from '../controllers/category.controller';
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

// 分类ID验证规则
const categoryIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('无效的分类ID格式');
    }
    return true;
  }),
];

// 创建分类验证规则
const createCategoryValidationRules = () => [
  body('name')
    .notEmpty()
    .withMessage('分类名称不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('分类名称长度必须在2-50个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('分类描述不能超过500个字符'),
  body('parent')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('无效的父分类ID格式');
      }
      return true;
    }),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序值必须是非负整数'),
];

// 更新分类验证规则
const updateCategoryValidationRules = () => [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('分类名称不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('分类名称长度必须在2-50个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('分类描述不能超过500个字符'),
  body('parent')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('无效的父分类ID格式');
      }
      return true;
    }),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序值必须是非负整数'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive必须是布尔值'),
];

// 公开路由
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCategories(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', categoryIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCategoryById(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/resources', categoryIdValidationRules(), validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCategoryResources(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 管理员路由（需要认证和管理员权限）
router.post(
  '/',
  protect,
  isAdmin,
  createCategoryValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createCategory(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  protect,
  isAdmin,
  categoryIdValidationRules(),
  updateCategoryValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateCategory(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Excel批量导入分类
router.post(
  '/import',
  protect,
  isAdmin,
  excelUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await importCategoriesFromExcel(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  categoryIdValidationRules(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteCategory(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default router;