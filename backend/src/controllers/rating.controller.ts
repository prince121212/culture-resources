import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Rating from '../models/rating.model';
import Resource from '../models/resource.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * @desc    为资源添加评分
 * @route   POST /api/resources/:id/rate
 * @access  Private
 */
export const rateResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;
    const { rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: '无效的资源ID' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1到5之间' });
    }

    // 检查资源是否存在
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    // 查找用户是否已经评分过该资源
    let userRating = await Rating.findOne({ resource: resourceId, user: userId });

    if (userRating) {
      // 更新已有评分
      userRating.rating = rating;
      await userRating.save();
    } else {
      // 创建新评分
      userRating = await Rating.create({
        resource: resourceId,
        user: userId,
        rating,
      });
    }

    // 更新资源的平均评分
    await updateResourceAverageRating(resourceId);

    res.status(200).json(userRating);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户对资源的评分
 * @route   GET /api/resources/:id/rating
 * @access  Private
 */
export const getUserRating = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: '无效的资源ID' });
    }

    const userRating = await Rating.findOne({ resource: resourceId, user: userId });

    if (!userRating) {
      return res.status(200).json({ message: '未找到评分记录' });
    }

    res.status(200).json(userRating);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取资源的评分统计
 * @route   GET /api/resources/:id/ratings/stats
 * @access  Public
 */
export const getResourceRatingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: '无效的资源ID' });
    }

    // 检查资源是否存在
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: '资源不存在' });
    }

    // 获取所有评分
    const ratings = await Rating.find({ resource: resourceId });

    // 计算平均评分
    const totalRatings = ratings.length;
    let averageRating = 0;

    if (totalRatings > 0) {
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / totalRatings;
    }

    // 计算评分分布
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach((rating) => {
      ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
    });

    res.status(200).json({
      averageRating,
      totalRatings,
      ratingDistribution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新资源的平均评分
 * @param resourceId 资源ID
 */
const updateResourceAverageRating = async (resourceId: string) => {
  // 获取所有评分
  const ratings = await Rating.find({ resource: resourceId });

  // 计算平均评分
  const totalRatings = ratings.length;
  let averageRating = 0;

  if (totalRatings > 0) {
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = sum / totalRatings;
  }

  // 更新资源的评分字段
  await Resource.findByIdAndUpdate(resourceId, {
    rating: averageRating,
    ratingCount: totalRatings,
  });
};

/**
 * @desc    获取用户评分历史
 * @route   GET /api/ratings/user/:userId
 * @access  Private
 */
export const getUserRatings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user?.id;

    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // 排序参数
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: '无效的用户ID' });
    }

    // 检查是否是当前用户查看自己的评分历史
    if (userId !== currentUserId) {
      return res.status(403).json({ message: '没有权限查看其他用户的评分历史' });
    }

    // 获取总评分数
    const totalRatings = await Rating.countDocuments({ user: userId });

    // 获取评分历史，并关联资源信息
    const ratings = await Rating.find({ user: userId })
      .populate('resource', 'title description category link')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: ratings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRatings / limit),
        totalItems: totalRatings,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
