import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../models/category.model';
import Resource from '../models/resource.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { parseExcelFile, importCategories, validateExcelFile } from '../services/excel.service';

// @desc    获取所有分类（支持树形结构）
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flat, activeOnly, withResourceCount } = req.query;
    const query: any = {};

    // 如果指定了只获取活跃分类
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    // 获取所有分类
    const categories = await Category.find(query)
      .sort({ level: 1, order: 1 })
      .select('name description parent level order path isActive');

    // 默认添加资源计数，除非明确指定不需要
    if (withResourceCount !== 'false') {
      // 获取每个分类的资源计数
      const categoryIds = categories.map(cat => (cat._id as mongoose.Types.ObjectId).toString());

      // 获取所有资源的分类统计
      const resourceCounts = await Resource.aggregate([
        { $match: { category: { $in: categoryIds } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      // 将计数添加到分类对象中
      const categoriesWithCount = categories.map(category => {
        const categoryObj = category.toObject();
        const categoryId = (categoryObj._id as mongoose.Types.ObjectId).toString();
        const resourceCount = resourceCounts.find(rc => rc._id === categoryId);

        // 确保resourceCount字段存在
        return {
          ...categoryObj,
          resourceCount: resourceCount ? resourceCount.count : 0
        };
      });

      // 如果请求扁平结构，直接返回带有计数的分类
      if (flat === 'true') {
        return res.status(200).json(categoriesWithCount);
      }

      // 构建树形结构
      const categoryTree = buildCategoryTree(categoriesWithCount);
      return res.status(200).json(categoryTree);
    }

    // 如果明确指定不需要资源计数，按原来的逻辑处理
    if (flat === 'true') {
      return res.status(200).json(categories);
    }

    // 构建树形结构
    const categoryTree = buildCategoryTree(categories);
    res.status(200).json(categoryTree);
  } catch (error) {
    next(error);
  }
};

// @desc    获取单个分类
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的分类ID格式' });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    创建新分类
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, parent, order } = req.body;

    // 如果指定了父分类，验证其存在性
    if (parent && mongoose.Types.ObjectId.isValid(parent)) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: '父分类不存在' });
      }
    }

    const newCategory = new Category({
      name,
      description,
      parent: parent || null,
      order: order || 0,
    });

    await newCategory.save();

    res.status(201).json({
      message: '分类创建成功',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新分类
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, parent, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的分类ID格式' });
    }

    // 检查是否存在循环引用（父分类不能是自己或自己的子分类）
    if (parent && parent === id) {
      return res.status(400).json({ message: '分类不能将自己设为父分类' });
    }

    // 如果指定了父分类，验证其存在性
    if (parent && mongoose.Types.ObjectId.isValid(parent)) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: '父分类不存在' });
      }

      // 检查是否将分类设置为其子分类的父分类（避免循环引用）
      const childCategories = await Category.find({ path: new RegExp(`^${id}/`) });
      const childIds = childCategories.map(cat => (cat._id as mongoose.Types.ObjectId).toString());
      if (childIds.includes(parent)) {
        return res.status(400).json({ message: '不能将分类设置为其子分类的父分类' });
      }
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 更新分类信息
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.parent = parent !== undefined ? parent : category.parent;
    category.order = order !== undefined ? order : category.order;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();

    // 如果更新了分类名称或父分类，需要更新所有子分类的路径
    if ((name && name !== category.name) || (parent !== undefined && parent !== category.parent)) {
      await updateChildCategoriesPaths(category._id as mongoose.Types.ObjectId);
    }

    res.status(200).json({
      message: '分类更新成功',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除分类
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的分类ID格式' });
    }

    // 检查分类是否存在
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 检查是否有子分类
    const childCategories = await Category.find({ parent: id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        message: '该分类下有子分类，无法删除',
        childCategories: childCategories.map(cat => ({ id: cat._id, name: cat.name }))
      });
    }

    // 检查是否有资源使用该分类
    const resourcesCount = await Resource.countDocuments({ category: id });
    if (resourcesCount > 0) {
      return res.status(400).json({
        message: '该分类下有资源，无法删除',
        resourcesCount
      });
    }

    // 删除分类
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      message: '分类删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取分类下的资源
// @route   GET /api/categories/:id/resources
// @access  Public
export const getCategoryResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的分类ID格式' });
    }

    // 获取分类及其所有子分类
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 查找该分类及其所有子分类的ID
    const childCategories = await Category.find({ path: new RegExp(`^${category.path}`) });
    const categoryIds = [id, ...childCategories.map(cat => cat._id as mongoose.Types.ObjectId)];

    // 查询资源
    const totalResources = await Resource.countDocuments({
      category: { $in: categoryIds },
      status: 'approved' // 只获取已审核通过的资源
    });

    const resources = await Resource.find({
      category: { $in: categoryIds },
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

// 辅助函数：构建分类树
const buildCategoryTree = (categories: any[]) => {
  const categoryMap = new Map();
  const roots: any[] = [];

  // 首先将所有分类映射到一个Map中，以便快速查找
  categories.forEach(category => {
    // 检查category是否已经是普通对象
    const categoryObj = typeof category.toObject === 'function' ? category.toObject() : category;

    categoryMap.set(categoryObj._id.toString(), {
      ...categoryObj,
      children: []
    });
  });

  // 然后构建树形结构
  categories.forEach(category => {
    // 确保我们使用的是对象而不是mongoose文档
    const categoryObj = typeof category.toObject === 'function' ? category.toObject() : category;
    const categoryId = categoryObj._id.toString();
    const categoryWithChildren = categoryMap.get(categoryId);

    if (categoryObj.parent) {
      // 如果有父分类，将当前分类添加到父分类的children数组中
      const parentId = categoryObj.parent.toString();
      const parent = categoryMap.get(parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      }
    } else {
      // 如果没有父分类，则是根分类
      roots.push(categoryWithChildren);
    }
  });

  return roots;
};

// 辅助函数：更新子分类的路径
const updateChildCategoriesPaths = async (categoryId: mongoose.Types.ObjectId) => {
  const category = await Category.findById(categoryId);
  if (!category) return;

  // 获取所有直接子分类
  const childCategories = await Category.find({ parent: categoryId });

  for (const childCategory of childCategories) {
    // 更新子分类的路径和级别
    childCategory.level = category.level + 1;
    childCategory.path = `${category.path}/${childCategory.name}`;
    await childCategory.save();

    // 递归更新子分类的子分类
    await updateChildCategoriesPaths(childCategory._id as mongoose.Types.ObjectId);
  }
};

// @desc    从Excel文件批量导入分类
// @route   POST /api/categories/import
// @access  Admin
export const importCategoriesFromExcel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 检查是否上传了文件
    if (!req.file) {
      return res.status(400).json({ message: '请上传Excel文件' });
    }

    // 验证文件格式
    const validation = validateExcelFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // 解析Excel文件
    const categoriesData = parseExcelFile(req.file.buffer);

    if (categoriesData.length === 0) {
      return res.status(400).json({ message: 'Excel文件中没有找到有效的分类数据' });
    }

    // 导入分类
    const importResult = await importCategories(categoriesData);

    // 返回导入结果
    res.status(200).json({
      message: `导入完成，成功创建 ${importResult.successCount} 个分类，失败 ${importResult.errorCount} 个`,
      data: importResult,
    });
  } catch (error) {
    console.error('导入分类出错:', error);
    res.status(500).json({
      message: '导入分类失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};
