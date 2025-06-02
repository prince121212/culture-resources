import { Router } from 'express';
import { 
  favoriteResource, 
  unfavoriteResource, 
  checkFavorite, 
  getFavorites,
  clearAllFavorites
} from '../controllers/favorite.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// 获取用户收藏的资源列表
router.get('/', protect, getFavorites);

// 清空用户所有收藏
router.delete('/', protect, clearAllFavorites);

// 收藏资源
router.post('/resources/:id/favorite', protect, favoriteResource);

// 取消收藏资源
router.delete('/resources/:id/favorite', protect, unfavoriteResource);

// 检查用户是否已收藏资源
router.get('/resources/:id/favorite', protect, checkFavorite);

export default router;
