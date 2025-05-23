import { Router } from 'express';
import {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth.middleware'; // 取消注释，启用认证中间件

const router = Router();

// 获取资源的评论
router.get('/resources/:id/comments', (req, res, next) => {
  console.log('[路由日志] GET /resources/:id/comments 命中, id:', req.params.id);
  return getResourceComments(req, res, next);
});

// 创建评论
router.post('/resources/:id/comments', protect, (req, res, next) => {
  console.log('[路由日志] POST /resources/:id/comments 命中, id:', req.params.id, 'body:', req.body);
  return createComment(req, res, next);
});

// 更新评论 - 这些路由会被挂载到 /api/comments/:id
router.put('/:id', protect, (req, res, next) => {
  console.log('[路由日志] PUT /comments/:id 命中, id:', req.params.id);
  return updateComment(req, res, next);
});

// 删除评论
router.delete('/:id', protect, (req, res, next) => {
  console.log('[路由日志] DELETE /comments/:id 命中, id:', req.params.id);
  return deleteComment(req, res, next);
});

// 点赞/取消点赞评论
router.post('/:id/like', protect, (req, res, next) => {
  console.log('[路由日志] POST /comments/:id/like 命中, id:', req.params.id);
  return toggleCommentLike(req, res, next);
});

export default router;