import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloadCount,
  checkResourceLink,
  batchCheckResourceLinks,
  // getResourcesByUploader, // Example for a future route
  // getResourcesByCategory, // Example for a future route
} from '../controllers/resource.controller';
import { protect, isAdmin, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
    createResourceValidationRules,
    updateResourceValidationRules,
    resourceIdValidationRules,
    validate
} from '../validators/resource.validator';
import { Request, Response, NextFunction } from 'express';
import Resource from '../models/resource.model'; // 导入正确的Resource模型
import { createComment, getResourceComments } from '../controllers/comment.controller';

const router = Router();

// Public routes
router.get('/', getResources);         // Get all approved resources (with pagination, filtering)
router.get('/:id', resourceIdValidationRules(), validate, getResourceById);

// New public route for incrementing download count
router.patch('/:id/increment-download', resourceIdValidationRules(), validate, incrementDownloadCount);

// Protected routes (require authentication)
router.post(
  '/',
  protect,
  createResourceValidationRules(),
  validate,
  createResource
);

router.put(
  '/:id',
  protect,
  resourceIdValidationRules(), // Validate ID in params
  updateResourceValidationRules(), // Validate body
  validate,
  updateResource
);

router.delete(
  '/:id',
  protect,
  resourceIdValidationRules(),
  validate, // Even if no body, ID validation errors need to be handled
  deleteResource
);

// Example of more specific routes if needed in the future
// router.get('/user/:userId', getResourcesByUploader);
// router.get('/category/:categoryName', getResourcesByCategory);

// Admin routes for link checking
router.put('/:id/check-link', protect, isAdmin, resourceIdValidationRules(), validate, checkResourceLink);
router.post('/check-links', protect, isAdmin, batchCheckResourceLinks);

// 获取资源的评论
router.get('/:id/comments', (req: Request, res: Response, next: NextFunction) => {
  console.log('[资源路由详细日志] GET /:id/comments 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  return getResourceComments(req, res, next);
});

// 创建评论
router.post('/:id/comments', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[资源路由详细日志] POST /:id/comments 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  console.log('请求体:', req.body);
  console.log('用户信息:', req.user);
  return createComment(req, res, next);
});

export default router;