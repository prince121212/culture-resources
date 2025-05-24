import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// 测试路由
router.get('/test', (_req: Request, res: Response) => {
  console.log('[测试路由] GET /test 命中');
  res.status(200).json({ message: '测试路由工作正常' });
});

// 测试删除评论路由
router.delete('/comments/:id', (req: Request, res: Response) => {
  const commentId = req.params.id;
  console.log(`[测试删除评论路由] DELETE /comments/:id 命中，评论ID: ${commentId}`);
  res.status(200).json({ message: `测试删除评论成功，评论ID: ${commentId}` });
});

export default router;