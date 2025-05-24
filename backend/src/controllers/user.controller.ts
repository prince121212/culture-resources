import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { saveFileToGridFS, getFileById, getGridFSBucket } from '../config/gridfs';

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

    // 记录请求信息
    console.log(`[uploadAvatar] Received avatar upload request for userId: ${userId}`);
    console.log(`[uploadAvatar] Current user: ${currentUserId}`);

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

    // 打印文件信息，检查是否包含buffer
    console.log(`[uploadAvatar] File received: ${req.file.originalname}, mimetype: ${req.file.mimetype}`);
    console.log(`[uploadAvatar] File has buffer: ${!!req.file.buffer}, buffer length: ${req.file.buffer?.length || 0}`);
    console.log(`[uploadAvatar] File has path: ${!!req.file.path}, path: ${req.file.path || 'N/A'}`);

    if (!req.file.buffer) {
      console.error(`[uploadAvatar] ERROR: File buffer is empty or missing! This means multer is not configured to use memoryStorage`);
      res.status(500).json({ message: '服务器配置错误：文件上传未使用内存存储' });
      return;
    }

    // 保存文件到GridFS
    console.log(`[uploadAvatar] Saving file to GridFS...`);
    const fileId = await saveFileToGridFS(req.file);
    console.log(`[uploadAvatar] File saved to GridFS with ID: ${fileId}`);

    // 更新用户头像 (存储文件ID)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar: fileId.toString(), // 保存GridFS文件ID
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // 返回头像的访问URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
    const avatarUrl = `${baseUrl}/api/users/${userId}/avatar`;
    console.log(`[uploadAvatar] Avatar updated successfully for user: ${updatedUser.username}, avatarUrl: ${avatarUrl}`);

    res.status(200).json({
      message: '头像上传成功',
      avatarUrl, // 客户端将使用这个URL来获取头像
      user: updatedUser
    });
  } catch (error) {
    console.error('[uploadAvatar] Error during avatar upload:', error);
    next(error);
  }
};

/**
 * @desc    获取用户头像
 * @route   GET /api/users/:id/avatar
 * @access  Public
 */
export const getAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    console.log(`[getAvatar] Attempting to get avatar for userId: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`[getAvatar] Invalid userId format: ${userId}`);
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    const user = await User.findById(userId).select('avatar username'); // Also select username for logging
    console.log(`[getAvatar] User found: ${user ? user.username : 'null'}, Avatar ID from DB: ${user?.avatar}`);

    if (!user || !user.avatar) {
      console.log(`[getAvatar] User or user.avatar not found for userId: ${userId}. User: ${JSON.stringify(user)}`);
      res.sendStatus(404); // Directly send 404 status
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(user.avatar)) {
        console.log(`[getAvatar] Invalid avatar ObjectId format in DB: ${user.avatar}`);
        res.status(400).json({ message: '无效的头像文件ID格式' });
        return;
    }

    console.log(`[getAvatar] Attempting to open download stream for avatarId: ${user.avatar}`);
    const gfs = getGridFSBucket();
    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(user.avatar));

    downloadStream.on('file', (file) => {
      console.log(`[getAvatar] Streaming file: ${file.filename}, contentType: ${file.contentType}`);
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    });

    downloadStream.on('error', (err) => {
      console.error(`[getAvatar] Error streaming file from GridFS for avatarId ${user.avatar}:`, err);
      if (!res.headersSent) {
        res.sendStatus(404); // Directly send 404 status on stream error
      }
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error('[getAvatar] General error:', error);
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