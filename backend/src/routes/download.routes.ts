import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  recordDownload,
  getDownloadHistory
} from '../controllers/download.controller';
import { protect } from '../middleware/auth.middleware';
import Resource from '../models/resource.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// 获取用户下载历史
router.get('/', protect, getDownloadHistory);

// 记录资源下载
router.post('/resources/:id/download', protect, recordDownload);

// 下载资源（公开访问）
router.get('/download/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    // 增加资源的下载计数
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });

    // 重定向到资源链接
    res.redirect(resource.link);
    return;
  } catch (error) {
    next(error);
  }
});

export default router;