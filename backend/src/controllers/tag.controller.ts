import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Tag from '../models/tag.model';
import Resource from '../models/resource.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// @desc    获取所有标签
// @route   GET /api/tags
// @access  Public
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, sort, activeOnly } = req.query;
    const query: any = {};
    
    // 如果指定了只获取活跃标签
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    // 确定排序方式
    let sortOption = {};
    if (sort === 'count') {
      sortOption = { count: -1 }; // 按使用次数降序
    } else if (sort === 'name') {
      sortOption = { name: 1 }; // 按名称升序
    } else {
      sortOption = { createdAt: -1 }; // 默认按创建时间降序
    }
    
    // 查询标签
    let tagsQuery = Tag.find(query).sort(sortOption);
    
    // 如果指定了限制数量
    if (limit) {
      const limitNum = parseInt(limit as string);
      if (!isNaN(limitNum) && limitNum > 0) {
        tagsQuery = tagsQuery.limit(limitNum);
      }
    }
    
    const tags = await tagsQuery;
    
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};

// @desc    获取单个标签
// @route   GET /api/tags/:id
// @access  Public
export const getTagById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的标签ID格式' });
    }
    
    const tag = await Tag.findById(id);
    
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
};

// @desc    创建新标签
// @route   POST /api/tags
// @access  Admin
export const createTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    
    // 检查标签名是否已存在
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ message: '标签名已存在' });
    }
    
    const newTag = new Tag({
      name,
      description,
    });
    
    await newTag.save();
    
    res.status(201).json({
      message: '标签创建成功',
      data: newTag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新标签
// @route   PUT /api/tags/:id
// @access  Admin
export const updateTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的标签ID格式' });
    }
    
    const tag = await Tag.findById(id);
    
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    // 如果要更改标签名，检查新名称是否已存在
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ name });
      if (existingTag) {
        return res.status(400).json({ message: '标签名已存在' });
      }
      tag.name = name;
    }
    
    // 更新其他字段
    if (description !== undefined) tag.description = description;
    if (isActive !== undefined) tag.isActive = isActive;
    
    await tag.save();
    
    res.status(200).json({
      message: '标签更新成功',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除标签
// @route   DELETE /api/tags/:id
// @access  Admin
export const deleteTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的标签ID格式' });
    }
    
    // 检查标签是否存在
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    // 检查是否有资源使用该标签
    const resourcesCount = await Resource.countDocuments({ tags: id });
    if (resourcesCount > 0) {
      return res.status(400).json({ 
        message: '该标签被资源使用，无法删除',
        resourcesCount
      });
    }
    
    // 删除标签
    await Tag.findByIdAndDelete(id);
    
    res.status(200).json({
      message: '标签删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取标签下的资源
// @route   GET /api/tags/:id/resources
// @access  Public
export const getTagResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的标签ID格式' });
    }
    
    // 检查标签是否存在
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' });
    }
    
    // 查询资源
    const totalResources = await Resource.countDocuments({ 
      tags: id,
      status: 'approved' // 只获取已审核通过的资源
    });
    
    const resources = await Resource.find({ 
      tags: id,
      status: 'approved'
    })
      .populate('uploader', 'username avatar')
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
