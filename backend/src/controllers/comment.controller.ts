import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import Resource from '../models/resource.model';
import Comment, { IComment } from '../models/comment.model';
import User from '../models/user.model';

/**
 * @desc    创建评论
 * @route   POST /api/resources/:id/comments
 * @access  Private
 */
export const createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const { content, parentId, replyTo } = req.body;
    const userIdString = req.user?.id;

    if (!userIdString) {
      res.status(401).json({ message: '用户未授权' });
      return;
    }

    if (!content) {
      res.status(400).json({ message: '评论内容不能为空' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ message: '无效的父评论ID' });
      return;
    }

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        res.status(404).json({ message: '父评论不存在' });
        return;
      }
    }

    const comment = new Comment({
      resource: resourceId,
      author: new Types.ObjectId(userIdString), // 确保author是ObjectId
      content,
      parentId: parentId || null,
      replyTo: replyTo || null,
    });

    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');
    res.status(201).json(populatedComment);
    return;

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取资源的评论
 * @route   GET /api/resources/:id/comments
 * @access  Public
 */
export const getResourceComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const currentUserIdString = (req as AuthenticatedRequest).user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    const totalComments = await Comment.countDocuments({
      resource: resourceId,
      parentId: null,
      isDeleted: false,
    });

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments: IComment[] = await Comment.find({
      resource: resourceId,
      parentId: null,
      isDeleted: false,
    })
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const commentsWithRepliesPromises = comments.map(async (comment) => {
      const replies: IComment[] = await Comment.find({
        parentId: comment._id,
        isDeleted: false,
      }).populate('author', 'username avatar');

      // 处理顶级评论的isLiked状态
      let isCommentLiked = false;
      if (currentUserIdString && comment.likedBy) {
        isCommentLiked = comment.likedBy.map(id => id.toString()).includes(currentUserIdString);
      }

      // 处理回复的isLiked状态
      const repliesWithLikeStatus = replies.map(reply => {
        let isReplyLiked = false;
        if (currentUserIdString && reply.likedBy) {
          isReplyLiked = reply.likedBy.map(id => id.toString()).includes(currentUserIdString);
        }
        return { ...reply.toObject(), isLiked: isReplyLiked };
      });
      
      // 将评论转换为普通对象，并添加isLiked属性
      const commentObj = comment.toObject();
      return {
        ...commentObj,
        isLiked: isCommentLiked,
        replies: repliesWithLikeStatus,
      };
    });

    const commentsWithReplies = await Promise.all(commentsWithRepliesPromises);

    const totalPages = Math.ceil(totalComments / limit);

    res.status(200).json({
      data: commentsWithReplies,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新评论
 * @route   PUT /api/comments/:id
 * @access  Private
 */
export const updateComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    const userIdString = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ message: '无效的评论ID' });
      return;
    }

    if (!content) {
      res.status(400).json({ message: '评论内容不能为空' });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    // 检查是否是评论作者
    if (comment.author.toString() !== userIdString) {
      res.status(403).json({ message: '没有权限修改此评论' });
      return;
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除评论
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const commentId = req.params.id;
    const userIdString = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ message: '无效的评论ID' });
      return;
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    // 检查是否是评论作者或管理员
    // 获取当前用户信息，检查是否是管理员
    const currentUser = await User.findById(userIdString).select('role');
    const isAdmin = currentUser?.role === 'admin';
    
    if (comment.author.toString() !== userIdString && !isAdmin) {
      res.status(403).json({ message: '没有权限删除此评论' });
      return;
    }

    // 软删除评论
    comment.isDeleted = true;
    await comment.save();

    res.status(200).json({ message: '评论已删除' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    点赞/取消点赞评论
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
export const toggleCommentLike = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const commentId = req.params.id;
    const userIdString = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ message: '无效的评论ID' });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }

    const userId = new Types.ObjectId(userIdString);
    const userLikedIndex = comment.likedBy.findIndex(id => id.equals(userId));

    let isLiked = false;
    if (userLikedIndex === -1) {
      // 用户尚未点赞，添加点赞
      comment.likedBy.push(userId);
      comment.likes += 1;
      isLiked = true;
    } else {
      // 用户已点赞，取消点赞
      comment.likedBy.splice(userLikedIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
      isLiked = false;
    }

    await comment.save();

    res.status(200).json({
      likes: comment.likes,
      isLiked,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createComment,
  getResourceComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
};
