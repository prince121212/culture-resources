import { Router } from 'express';
import {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware'; // 导入AuthenticatedRequest类型
import { Request, Response, NextFunction } from 'express';

const router = Router();

// 获取资源的评论
router.get('/resources/:id/comments', (req: Request, res: Response, next: NextFunction) => {
  console.log('[路由详细日志] GET /resources/:id/comments 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  return getResourceComments(req, res, next);
});

// 创建评论
router.post('/resources/:id/comments', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[路由详细日志] POST /resources/:id/comments 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  console.log('请求体:', req.body);
  console.log('用户信息:', req.user);
  return createComment(req, res, next);
});

// 更新评论 - 这些路由会被挂载到 /api/comments/:id
router.put('/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[路由详细日志] PUT /comments/:id 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  console.log('请求体:', req.body);
  return updateComment(req, res, next);
});

// 删除评论
router.delete('/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[路由详细日志] DELETE /comments/:id 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  return deleteComment(req, res, next);
});

// 点赞/取消点赞评论
router.post('/:id/like', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[路由详细日志] POST /comments/:id/like 命中');
  console.log('路径参数:', req.params);
  console.log('请求路径:', req.path);
  console.log('请求URL:', req.originalUrl);
  return toggleCommentLike(req, res, next);
});

export default router;