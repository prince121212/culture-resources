import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import Resource from '../models/resource.model';
import Favorite from '../models/favorite.model';

/**
 * @desc    收藏资源
 * @route   POST /api/resources/:id/favorite
 * @access  Private
 */
export const favoriteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    // 检查资源是否存在
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({ user: userId, resource: resourceId });
    if (existingFavorite) {
      res.status(400).json({ message: '已经收藏过该资源' });
      return;
    }

    // 创建新收藏
    const favorite = new Favorite({
      user: userId,
      resource: resourceId,
    });

    await favorite.save();

    res.status(201).json({ message: '收藏成功', favorite });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    取消收藏资源
 * @route   DELETE /api/resources/:id/favorite
 * @access  Private
 */
export const unfavoriteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    // 检查是否已经收藏
    const favorite = await Favorite.findOne({ user: userId, resource: resourceId });
    if (!favorite) {
      res.status(404).json({ message: '未找到收藏记录' });
      return;
    }

    // 删除收藏
    await favorite.deleteOne();

    res.status(200).json({ message: '取消收藏成功' });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    检查用户是否已收藏资源
 * @route   GET /api/resources/:id/favorite
 * @access  Private
 */
export const checkFavorite = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    const favorite = await Favorite.findOne({ user: userId, resource: resourceId });

    res.status(200).json({ isFavorite: !!favorite });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户收藏的资源列表
 * @route   GET /api/favorites
 * @access  Private
 */
export const getFavorites = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalFavorites = await Favorite.countDocuments({ user: userId });

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'resource',
        populate: {
          path: 'uploader',
          select: 'username email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 提取资源数据，过滤掉已删除的资源
    const resources = favorites
      .map(favorite => favorite.resource)
      .filter(resource => resource !== null);

    res.status(200).json({
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFavorites / limit),
        totalResources: resources.length, // 使用实际资源数量
        limit,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  favoriteResource,
  unfavoriteResource,
  checkFavorite,
  getFavorites,
};
