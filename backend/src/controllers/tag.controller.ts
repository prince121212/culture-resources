import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Tag from '../models/tag.model';
import Resource from '../models/resource.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { parseTagExcelFile, importTags, validateTagExcelFile } from '../services/tag-excel.service';

// @desc    获取所有标签
// @route   GET /api/tags
// @access  Public
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, sort, activeOnly, withResourceCount } = req.query;
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

    // 默认添加资源计数，除非明确指定不需要
    if (withResourceCount !== 'false') {
      // 获取每个标签的资源计数
      const tagNames = tags.map(tag => tag.name);

      // 获取所有资源的标签统计
      const resourceCounts = await Resource.aggregate([
        { $match: { tags: { $in: tagNames }, status: 'approved' } }, // 只统计已审核通过的资源
        { $unwind: '$tags' }, // 展开标签数组
        { $match: { tags: { $in: tagNames } } }, // 再次过滤确保标签在列表中
        { $group: { _id: '$tags', count: { $sum: 1 } } }
      ]);

      // 将计数添加到标签对象中
      const tagsWithCount = tags.map(tag => {
        const tagObj = tag.toObject();
        const resourceCount = resourceCounts.find(rc => rc._id === tag.name);

        // 确保resourceCount字段存在，同时更新count字段
        const count = resourceCount ? resourceCount.count : 0;
        return {
          ...tagObj,
          resourceCount: count,
          count: count // 同时更新模型中的count字段
        };
      });

      res.status(200).json(tagsWithCount);
    } else {
      res.status(200).json(tags);
    }
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

// @desc    从Excel文件批量导入标签
// @route   POST /api/tags/import
// @access  Admin
export const importTagsFromExcel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 检查是否上传了文件
    if (!req.file) {
      return res.status(400).json({ message: '请上传Excel文件' });
    }

    // 验证文件格式
    const validation = validateTagExcelFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // 解析Excel文件
    const tagsData = parseTagExcelFile(req.file.buffer);

    if (tagsData.length === 0) {
      return res.status(400).json({ message: 'Excel文件中没有找到有效的标签数据' });
    }

    // 导入标签
    const importResult = await importTags(tagsData);

    // 返回导入结果
    res.status(200).json({
      message: `导入完成，成功创建 ${importResult.successCount} 个标签，失败 ${importResult.errorCount} 个`,
      data: importResult,
    });
  } catch (error) {
    console.error('导入标签出错:', error);
    res.status(500).json({
      message: '导入标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

// @desc    同步所有标签的资源计数
// @route   POST /api/tags/sync-counts
// @access  Admin
export const syncTagCounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 获取所有标签
    const tags = await Tag.find({});

    let updatedCount = 0;

    for (const tag of tags) {
      // 计算该标签的资源数量
      const resourceCount = await Resource.countDocuments({
        tags: tag.name,
        status: 'approved'
      });

      // 更新标签的count字段
      if (tag.count !== resourceCount) {
        tag.count = resourceCount;
        await tag.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      message: `标签计数同步完成，更新了 ${updatedCount} 个标签`,
      totalTags: tags.length,
      updatedCount
    });
  } catch (error) {
    console.error('同步标签计数出错:', error);
    res.status(500).json({
      message: '同步标签计数失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};