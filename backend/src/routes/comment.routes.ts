import { Router } from 'express';
import {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// 获取资源的评论
router.get('/resources/:id/comments', (req: Request, res: Response, next: NextFunction) => {
  return getResourceComments(req, res, next);
});

// 创建评论
router.post('/resources/:id/comments', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return createComment(req, res, next);
});

// 更新评论
router.put('/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return updateComment(req, res, next);
});

// 删除评论
router.delete('/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return deleteComment(req, res, next);
});

// 点赞/取消点赞评论
router.post('/comments/:id/like', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return toggleCommentLike(req, res, next);
});

export default router;