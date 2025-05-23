import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

/**
 * @desc    获取用户资料
 * @route   GET /api/users/profile/:id
 * @access  Public/Private (取决于是否是当前用户)
 */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新用户资料
 * @route   PUT /api/users/profile/:id
 * @access  Private
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 检查是否是当前用户
    if (userId !== currentUserId) {
      res.status(403).json({ message: '没有权限修改其他用户的资料' });
      return;
    }

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ message: '该邮箱已被其他用户使用' });
        return;
      }
    }

    // 更新用户资料
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    上传用户头像
 * @route   POST /api/users/:id/avatar
 * @access  Private
 */
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 检查是否是当前用户
    if (userId !== currentUserId) {
      res.status(403).json({ message: '没有权限修改其他用户的头像' });
      return;
    }

    // 检查是否上传了文件
    if (!req.file) {
      res.status(400).json({ message: '请上传头像文件' });
      return;
    }

    // 这里需要实现文件上传逻辑，可以使用第三方服务如AWS S3或本地存储
    // 假设我们已经上传了文件并获得了URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar: avatarUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '头像上传成功',
      avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户上传的资源
 * @route   GET /api/users/uploads/:userId
 * @access  Public
 */
export const getUserUploads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 这里需要引入Resource模型
    const Resource = mongoose.model('Resource');
    const uploads = await Resource.find({ uploader: userId });

    res.status(200).json(uploads);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户收藏的资源
 * @route   GET /api/users/favorites/:userId
 * @access  Private
 */
export const getUserFavorites = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 检查是否是当前用户
    if (userId !== currentUserId) {
      res.status(403).json({ message: '没有权限查看其他用户的收藏' });
      return;
    }

    // 这里需要引入Favorite模型
    const Favorite = mongoose.model('Favorite');
    const favorites = await Favorite.find({ user: userId }).populate('resource');

    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户活动统计数据
 * @route   GET /api/users/:id/stats
 * @access  Private
 */
export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 检查是否是当前用户
    if (userId !== currentUserId) {
      res.status(403).json({ message: '没有权限查看其他用户的统计数据' });
      return;
    }

    // 获取用户上传的资源统计
    const Resource = mongoose.model('Resource');
    const uploadStats = await Resource.aggregate([
      { $match: { uploader: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 处理上传统计结果
    const uploads = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    uploadStats.forEach((stat: any) => {
      if (stat._id === 'approved') uploads.approved = stat.count;
      else if (stat._id === 'pending') uploads.pending = stat.count;
      else if (stat._id === 'rejected') uploads.rejected = stat.count;
      uploads.total += stat.count;
    });

    // 获取用户下载统计
    const DownloadHistory = mongoose.model('DownloadHistory');
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalDownloads = await DownloadHistory.countDocuments({ user: userId });
    const monthlyDownloads = await DownloadHistory.countDocuments({
      user: userId,
      downloadDate: { $gte: firstDayOfMonth }
    });

    // 获取用户评分统计
    const Rating = mongoose.model('Rating');

    // 用户给出的评分
    const givenRatings = await Rating.find({ user: userId });
    const givenRatingsCount = givenRatings.length;
    let averageGivenRating = 0;

    if (givenRatingsCount > 0) {
      const sumGivenRatings = givenRatings.reduce((sum, rating) => sum + rating.rating, 0);
      averageGivenRating = sumGivenRatings / givenRatingsCount;
    }

    // 用户收到的评分
    const receivedRatingsAgg = await Rating.aggregate([
      {
        $lookup: {
          from: 'resources',
          localField: 'resource',
          foreignField: '_id',
          as: 'resourceData'
        }
      },
      { $unwind: '$resourceData' },
      { $match: { 'resourceData.uploader': new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          average: { $avg: '$rating' }
        }
      }
    ]);

    const receivedRatings = {
      total: 0,
      average: 0
    };

    if (receivedRatingsAgg.length > 0) {
      receivedRatings.total = receivedRatingsAgg[0].total;
      receivedRatings.average = receivedRatingsAgg[0].average;
    }

    // 获取评论统计
    const Comment = mongoose.model('Comment');

    // 用户发表的评论
    const postedComments = await Comment.countDocuments({ user: userId });

    // 用户收到的评论
    const receivedCommentsAgg = await Comment.aggregate([
      {
        $lookup: {
          from: 'resources',
          localField: 'resource',
          foreignField: '_id',
          as: 'resourceData'
        }
      },
      { $unwind: '$resourceData' },
      { $match: { 'resourceData.uploader': new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const receivedComments = receivedCommentsAgg.length > 0 ? receivedCommentsAgg[0].count : 0;

    // 获取收藏统计
    const Favorite = mongoose.model('Favorite');
    const favoritesCount = await Favorite.countDocuments({ user: userId });

    // 组合所有统计数据
    const stats = {
      uploads,
      downloads: {
        total: totalDownloads,
        lastMonth: monthlyDownloads
      },
      ratings: {
        given: givenRatingsCount,
        averageGiven: averageGivenRating,
        received: receivedRatings
      },
      comments: {
        posted: postedComments,
        received: receivedComments
      },
      favorites: {
        count: favoritesCount
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};