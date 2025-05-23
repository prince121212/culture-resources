import { Router, Request, Response, NextFunction } from 'express';
import {
  rateResource,
  getUserRating,
  getResourceRatingStats,
  getUserRatings,
} from '../controllers/rating.controller';
import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// 为资源添加评分
router.post('/resources/:id/rate', protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await rateResource(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取用户对资源的评分
router.get('/resources/:id/rating', protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUserRating(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取资源的评分统计
router.get('/resources/:id/ratings/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getResourceRatingStats(req, res, next);
  } catch (error) {
    next(error);
  }
});

// 获取用户评分历史
router.get('/ratings/user/:userId', protect, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await getUserRatings(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
