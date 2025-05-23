import { Request, Response, NextFunction } from 'express';
import Resource from '../models/resource.model';
import User from '../models/user.model';
import Notification from '../models/notification.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
// import Comment from '../models/comment.model'; // Commented out until the model is found/created
import Favorite from '../models/favorite.model';
import DownloadHistory from '../models/downloadHistory.model'; // Changed from Download to DownloadHistory
import Rating from '../models/rating.model';
import Category from '../models/category.model'; // Added import for Category
import Tag from '../models/tag.model'; // Added import for Tag

// @desc    获取待审核资源列表
// @route   GET /api/admin/resources/pending
// @access  Admin
export const getPendingResources = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalResources = await Resource.countDocuments({ status: 'pending' });
    const resources = await Resource.find({ status: 'pending' })
      .populate('uploader', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResources / limit),
        totalResources,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    审核资源（通过或拒绝）
// @route   PUT /api/admin/resources/:id/review
// @access  Admin
export const reviewResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;
    const reviewerId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的资源ID格式' });
      return;
    }

    if (!reviewerId) {
      res.status(401).json({ message: '未授权，无法执行审核操作' });
      return;
    }

    if (status !== 'approved' && status !== 'rejected') {
      res.status(400).json({ message: '无效的审核状态，必须是 approved 或 rejected' });
      return;
    }

    if (status === 'rejected' && !rejectReason) {
      res.status(400).json({ message: '拒绝资源时必须提供拒绝原因' });
      return;
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    if (resource.status !== 'pending') {
      res.status(400).json({ message: `资源当前状态为 ${resource.status}，无法进行审核` });
      return;
    }

    // 更新资源状态
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectReason: status === 'rejected' ? rejectReason : undefined,
      },
      { new: true }
    ).populate('uploader', 'username email');

    if (!updatedResource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    // 创建通知
    const notificationType = status === 'approved' ? 'resource_approved' : 'resource_rejected';
    const notificationTitle = status === 'approved' ? '资源审核通过' : '资源审核被拒绝';
    const notificationContent = status === 'approved'
      ? `您上传的资源"${updatedResource.title}"已通过审核，现已发布。`
      : `您上传的资源"${updatedResource.title}"未通过审核。原因：${rejectReason}`;

    await Notification.create({
      user: updatedResource.uploader,
      type: notificationType,
      title: notificationTitle,
      content: notificationContent,
      resourceId: updatedResource._id,
    });

    res.status(200).json({
      message: status === 'approved' ? '资源审核通过' : '资源审核已拒绝',
      data: updatedResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取所有用户列表
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    // 构建查询条件
    const query: any = {};

    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户角色
// @route   PUT /api/admin/users/:id/role
// @access  Admin
export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    if (!['user', 'contributor', 'admin'].includes(role)) {
      res.status(400).json({ message: '无效的角色，必须是 user、contributor 或 admin' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '用户角色更新成功',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取单个用户详情
// @route   GET /api/admin/users/:id
// @access  Admin
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户信息
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, role, status, points } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 验证角色
    if (role && !['user', 'contributor', 'admin'].includes(role)) {
      res.status(400).json({ message: '无效的角色，必须是 user、contributor 或 admin' });
      return;
    }

    // 验证状态
    if (status && !['active', 'inactive', 'banned'].includes(status)) {
      res.status(400).json({ message: '无效的状态，必须是 active、inactive 或 banned' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
        role,
        status,
        points,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '用户信息更新成功',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新用户状态
// @route   PUT /api/admin/users/:id/status
// @access  Admin
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    if (!['active', 'inactive', 'banned'].includes(status)) {
      res.status(400).json({ message: '无效的状态，必须是 active、inactive 或 banned' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({
      message: '用户状态更新成功',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户统计数据
// @route   GET /api/admin/users/:id/stats
// @access  Admin
export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const totalResourcesUploaded = await Resource.countDocuments({ uploader: id });
    const totalCollections = await Favorite.countDocuments({ user: id });
    const totalDownloads = await DownloadHistory.countDocuments({ user: id }); // Changed from Download to DownloadHistory
    // const totalComments = await Comment.countDocuments({ user: id }); // Commented out until Comment model is available
    const totalRatings = await Rating.countDocuments({ user: id });

    // 获取用户最近的活动（例如：最近上传、最近收藏、最近评论）
    const recentUploads = await Resource.find({ uploader: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt');
    const recentFavorites = await Favorite.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resource', 'title');
    // const recentComments = await Comment.find({ user: id })
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .populate('resource', 'title')
    //   .select('content createdAt resource');

    res.status(200).json({
      totalResourcesUploaded,
      totalCollections,
      totalDownloads,
      // totalComments,
      totalRatings,
      recentUploads,
      recentFavorites,
      // recentComments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户上传的资源
// @route   GET /api/admin/users/:id/resources
// @access  Admin
export const getUserResources = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 构建查询条件
    const query: any = { uploader: id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const totalResources = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResources / limit),
        totalResources,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取系统统计数据
// @route   GET /api/admin/stats
// @access  Admin
export const getSystemStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalApprovedResources = await Resource.countDocuments({ status: 'approved' });
    const totalPendingResources = await Resource.countDocuments({ status: 'pending' });
    const totalRejectedResources = await Resource.countDocuments({ status: 'rejected' });
    const totalCategories = await Category.countDocuments();
    const totalTags = await Tag.countDocuments();
    const totalDownloads = await DownloadHistory.countDocuments(); // Changed from Download to DownloadHistory
    // const totalComments = await Comment.countDocuments(); // Commented out until Comment model is available
    const totalRatings = await Rating.countDocuments();
    const totalFavorites = await Favorite.countDocuments();

    // 最近注册的用户
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');

    // 最近上传的资源
    const recentResources = await Resource.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploader', 'username')
      .select('title uploader createdAt');

    res.status(200).json({
      totalUsers,
      totalResources,
      totalApprovedResources,
      totalPendingResources,
      totalRejectedResources,
      totalCategories,
      totalTags,
      totalDownloads,
      // totalComments,
      totalRatings,
      totalFavorites,
      recentUsers,
      recentResources,
    });
  } catch (error) {
    next(error);
  }
};
