import { Request, Response, NextFunction } from 'express';
import Resource, { IResource } from '../models/resource.model';
import User from '../models/user.model'; // Needed for uploader info, etc.
import Category from '../models/category.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware'; // To access req.user
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import Notification from '../models/notification.model';
import Tag from '../models/tag.model';

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private
export const createResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, url, link, category, tags } = req.body;
    const uploader = req.user?.id; // Get uploader ID from authenticated user

    if (!uploader) {
      res.status(400).json({ message: 'Uploader ID is missing. User may not be authenticated properly.' });
      return;
    }

    // 检查 title 和 link/url 字段
    const resourceLink = link || url;
    if (!title || !resourceLink) {
      res.status(400).json({ message: 'Title and Link are required fields.' });
      return;
    }

    // 处理标签：如果标签不存在则新建
    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      for (const tagName of tags) {
        // 确保标签名称不为空且去除空格
        const trimmedTagName = tagName.trim();
        if (!trimmedTagName) continue;

        let tagDoc = await Tag.findOne({ name: trimmedTagName });
        if (!tagDoc) {
          // 创建新标签
          tagDoc = new Tag({ name: trimmedTagName });
          await tagDoc.save();
        }

        // 将标签名称添加到资源的标签数组中（保持与资源模型一致）
        processedTags.push(trimmedTagName);
      }
    }

    const newResource = new Resource({
      title,
      description,
      link: resourceLink,
      uploader,
      category,
      tags: processedTags, // 使用标签名称而不是ID
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources with pagination, filtering, and sorting
// @route   GET /api/resources
// @access  Public
export const getResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { uploaderId } = req.query; // Destructure uploaderId

    // Build query object
    const query: any = {};

    // 状态过滤：默认只显示已审核通过的资源，除非明确指定其他状态
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    } else if (!req.query.status) {
      // 如果没有指定状态，默认只显示已审核通过的资源
      query.status = 'approved';
    }

    // Filtering by keyword (searches title and description)
    if (req.query.keyword) {
      const keyword = req.query.keyword as string;
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filtering by category (exact match)
    if (req.query.category) {
      const category = req.query.category as string;
      query.category = category;
    }

    // Filtering by tags (matches if resource contains ANY of the provided tags)
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',').map(tag => tag.trim());
      if (tags.length > 0) {
        query.tags = { $in: tags };
      }
    }

    // Filtering by uploaderId
    if (uploaderId) {
      if (!mongoose.Types.ObjectId.isValid(uploaderId as string)) {
        // 如果ID格式无效，忽略此过滤条件
      } else {
        query.uploader = uploaderId as string; // Apply uploader filter
      }
    }

    // Sorting
    const sortOptions: any = {};
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      const sortOrder = (req.query.sortOrder as string) === 'desc' ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1; // Default sort by creation date descending
    }

    const totalResources = await Resource.countDocuments(query);

    const resources = await Resource.find(query)
      .populate('uploader', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // 处理分类信息，将ObjectId转换为分类对象
    const processedResources = await Promise.all(
      resources.map(async (resource) => {
        const resourceObj: any = resource.toObject();

        // 处理分类信息：兼容ObjectId和字符串两种格式
        if (resourceObj.category) {
          if (mongoose.Types.ObjectId.isValid(resourceObj.category)) {
            // 如果是ObjectId，查询分类信息
            try {
              const categoryDoc = await Category.findById(resourceObj.category);
              if (categoryDoc) {
                resourceObj.category = {
                  _id: (categoryDoc._id as any).toString(),
                  name: categoryDoc.name,
                  description: categoryDoc.description
                };
              }
            } catch (error) {
              // 如果获取分类失败，保持原始的category值
            }
          } else if (typeof resourceObj.category === 'string') {
            // 如果是字符串，直接使用（兼容旧数据）
            resourceObj.category = {
              name: resourceObj.category,
              description: null
            };
          }
        }

        return resourceObj;
      })
    );

    res.status(200).json({
      data: processedResources,
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

// @desc    Get a single resource by ID
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid resource ID format' });
      return;
    }

    const resource = await Resource.findById(id)
      .populate('uploader', 'username email')
      .populate('reviewedBy', 'username');

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    // 如果category是ObjectId，尝试获取分类信息
    let populatedResource: any = resource.toObject();

    // 处理分类信息：兼容ObjectId和字符串两种格式
    if (resource.category) {
      if (mongoose.Types.ObjectId.isValid(resource.category)) {
        // 如果是ObjectId，查询分类信息
        try {
          const categoryDoc = await Category.findById(resource.category);
          if (categoryDoc) {
            populatedResource.category = {
              _id: (categoryDoc._id as any).toString(),
              name: categoryDoc.name,
              description: categoryDoc.description
            };
          }
        } catch (error) {
          // 如果获取分类失败，保持原始的category值
        }
      } else if (typeof resource.category === 'string') {
        // 如果是字符串，直接使用（兼容旧数据）
        populatedResource.category = {
          name: resource.category,
          description: null
        };
      }
    }

    res.status(200).json(populatedResource);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing resource
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, url, category, tags } = req.body;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid resource ID format' });
      return;
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    // Check if the authenticated user is the uploader of the resource
    if (resource.uploader.toString() !== userId) {
      res.status(403).json({ message: 'User not authorized to update this resource' });
      return;
    }

    // Update fields if provided
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (url) resource.link = url;
    if (category) resource.category = category;

    // 处理标签更新：如果提供了新标签，处理标签创建
    if (tags && Array.isArray(tags)) {
      let processedTags: string[] = [];
      for (const tagName of tags) {
        // 确保标签名称不为空且去除空格
        const trimmedTagName = tagName.trim();
        if (!trimmedTagName) continue;

        let tagDoc = await Tag.findOne({ name: trimmedTagName });
        if (!tagDoc) {
          // 创建新标签
          tagDoc = new Tag({ name: trimmedTagName });
          await tagDoc.save();
        }

        // 将标签名称添加到资源的标签数组中
        processedTags.push(trimmedTagName);
      }
      resource.tags = processedTags;
    }

    // 重置资源状态为待审核，清除审核相关信息
    resource.status = 'pending';
    resource.reviewedBy = undefined;
    resource.reviewedAt = undefined;
    resource.rejectReason = undefined;

    const updatedResource = await resource.save();
    res.status(200).json({
      message: '资源更新成功，已重新提交审核',
      data: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid resource ID format' });
      return;
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    // Check if the authenticated user is the uploader of the resource
    if (resource.uploader.toString() !== userId) {
      res.status(403).json({ message: 'User not authorized to delete this resource' });
      return;
    }

    await resource.deleteOne(); // Mongoose 6+ uses deleteOne()
    res.status(200).json({ message: 'Resource removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment download count for a resource
// @route   PATCH /api/resources/:id/increment-download
// @access  Public
export const incrementDownloadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid resource ID format' });
      return;
    }

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true } // Return the updated document
    );

    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    // You can choose to send back the updated resource or just a success message
    // res.status(200).json(resource);
    res.status(200).json({ message: 'Download count incremented successfully', downloadCount: resource.downloadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Check resource link validity and update status to terminated if invalid
// @route   PUT /api/resources/:id/check-link
// @access  Admin
export const checkResourceLink = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的资源ID格式' });
      return;
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    // 只检查已审核通过的资源
    if (resource.status !== 'approved') {
      res.status(400).json({
        message: `资源当前状态为 ${resource.status}，只有已审核通过的资源才能检查链接有效性`
      });
      return;
    }

    // 检查链接有效性
    let isValid = true;
    let errorMessage = '';

    try {
      const response = await fetch(resource.link, {
        method: 'HEAD',
        timeout: 5000 // 5秒超时
      });

      // 检查HTTP状态码，2xx和3xx表示链接有效
      if (response.status >= 400) {
        isValid = false;
        errorMessage = `链接返回错误状态码: ${response.status}`;
      }
    } catch (error) {
      isValid = false;
      errorMessage = `链接检查失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }

    if (!isValid) {
      // 更新资源状态为terminated
      const updatedResource = await Resource.findByIdAndUpdate(
        id,
        {
          status: 'terminated',
          reviewedBy: req.user?.id,
          reviewedAt: new Date(),
          rejectReason: errorMessage,
        },
        { new: true }
      ).populate('uploader', 'username email');

      if (!updatedResource) {
        res.status(404).json({ message: '资源不存在' });
        return;
      }

      // 创建通知
      await Notification.create({
        user: updatedResource.uploader,
        type: 'resource_terminated',
        title: '资源链接已失效',
        content: `您上传的资源"${updatedResource.title}"的链接已失效，原因：${errorMessage}。请更新链接以恢复资源。`,
        resourceId: updatedResource._id,
      });

      res.status(200).json({
        message: '资源链接已失效，状态已更新为terminated',
        data: updatedResource,
      });
      return;
    }

    // 链接有效，返回成功信息
    res.status(200).json({
      message: '资源链接有效',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch check all approved resources for link validity
// @route   POST /api/resources/check-links
// @access  Admin
export const batchCheckResourceLinks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      res.status(401).json({ message: '未授权，无法执行链接检查操作' });
      return;
    }

    // 获取所有已审核通过的资源
    const resources = await Resource.find({ status: 'approved' });

    const results = {
      total: resources.length,
      checked: 0,
      valid: 0,
      invalid: 0,
      failed: 0,
      invalidResources: [] as any[]
    };

    // 逐个检查资源链接
    for (const resource of resources) {
      results.checked++;

      try {
        // 检查链接有效性
        let isValid = true;
        let errorMessage = '';

        try {
          const response = await fetch(resource.link, {
            method: 'HEAD',
            timeout: 5000 // 5秒超时
          });

          // 检查HTTP状态码，2xx和3xx表示链接有效
          if (response.status >= 400) {
            isValid = false;
            errorMessage = `链接返回错误状态码: ${response.status}`;
          }
        } catch (error) {
          isValid = false;
          errorMessage = `链接检查失败: ${error instanceof Error ? error.message : '未知错误'}`;
        }

        if (!isValid) {
          results.invalidResources.push({
            resourceId: resource._id,
            errorMessage,
          });
          results.invalid++;
        } else {
          results.valid++;
        }
      } catch (error) {
        results.failed++;
      }
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};