import { Router } from 'express';
import {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// 获取资源的评论
router.get('/resources/:id/comments', getResourceComments);

// 创建评论
router.post('/resources/:id/comments', protect, createComment);

// 更新评论
router.put('/:id', protect, updateComment);

// 删除评论
router.delete('/:id', protect, deleteComment);

// 点赞/取消点赞评论
router.post('/:id/like', protect, toggleCommentLike);

export default router;