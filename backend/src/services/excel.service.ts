import * as XLSX from 'xlsx';
import Category, { ICategory } from '../models/category.model';
import mongoose from 'mongoose';

export interface CategoryImportData {
  name: string;
  description?: string;
  parentName?: string;
  order?: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  createdCategories: Array<{
    name: string;
    id: string;
  }>;
}

/**
 * 解析Excel文件并提取分类数据
 */
export const parseExcelFile = (buffer: Buffer): CategoryImportData[] => {
  try {
    // 读取Excel文件
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Excel文件中没有找到工作表');
    }

    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON数组
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false
    }) as any[][];

    if (jsonData.length < 2) {
      throw new Error('Excel文件至少需要包含表头和一行数据');
    }

    // 获取表头
    const headers = jsonData[0];
    const expectedHeaders = ['分类名称', '描述', '父分类名称', '排序'];

    // 验证表头
    const nameIndex = headers.findIndex((h: string) => h === '分类名称' || h === 'name');
    if (nameIndex === -1) {
      throw new Error('Excel文件必须包含"分类名称"列');
    }

    const descIndex = headers.findIndex((h: string) => h === '描述' || h === 'description');
    const parentIndex = headers.findIndex((h: string) => h === '父分类名称' || h === 'parent' || h === 'parentName');
    const orderIndex = headers.findIndex((h: string) => h === '排序' || h === 'order');

    // 解析数据行
    const categories: CategoryImportData[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // 跳过空行
      if (!row || row.length === 0 || !row[nameIndex]) {
        continue;
      }

      const category: CategoryImportData = {
        name: String(row[nameIndex] || '').trim(),
      };

      // 添加可选字段
      if (descIndex !== -1 && row[descIndex]) {
        category.description = String(row[descIndex] || '').trim();
      }

      if (parentIndex !== -1 && row[parentIndex]) {
        category.parentName = String(row[parentIndex] || '').trim();
      }

      if (orderIndex !== -1 && row[orderIndex]) {
        const orderValue = Number(row[orderIndex]);
        if (!isNaN(orderValue)) {
          category.order = orderValue;
        }
      }

      categories.push(category);
    }

    return categories;
  } catch (error) {
    throw new Error(`解析Excel文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 批量导入分类数据
 */
export const importCategories = async (categoriesData: CategoryImportData[]): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    totalRows: categoriesData.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
    createdCategories: []
  };

  // 获取所有现有分类，用于查找父分类
  const existingCategories = await Category.find({}).select('name _id');
  const categoryMap = new Map<string, string>();
  existingCategories.forEach((cat: any) => {
    categoryMap.set(cat.name, cat._id.toString());
  });

  // 按层级排序，先创建父分类
  const sortedCategories = [...categoriesData].sort((a, b) => {
    if (!a.parentName && b.parentName) return -1;
    if (a.parentName && !b.parentName) return 1;
    return 0;
  });

  for (let i = 0; i < sortedCategories.length; i++) {
    const categoryData = sortedCategories[i];
    const rowNumber = categoriesData.indexOf(categoryData) + 2; // +2 因为Excel从1开始，且第1行是表头

    try {
      // 验证分类名称
      if (!categoryData.name || categoryData.name.length < 2) {
        result.errors.push({
          row: rowNumber,
          error: '分类名称不能为空且长度至少为2个字符',
          data: categoryData
        });
        result.errorCount++;
        continue;
      }

      if (categoryData.name.length > 50) {
        result.errors.push({
          row: rowNumber,
          error: '分类名称不能超过50个字符',
          data: categoryData
        });
        result.errorCount++;
        continue;
      }

      // 检查分类名称是否已存在
      if (categoryMap.has(categoryData.name)) {
        result.errors.push({
          row: rowNumber,
          error: `分类名称"${categoryData.name}"已存在`,
          data: categoryData
        });
        result.errorCount++;
        continue;
      }

      // 查找父分类
      let parentId: string | null = null;
      if (categoryData.parentName) {
        parentId = categoryMap.get(categoryData.parentName) || null;
        if (!parentId) {
          result.errors.push({
            row: rowNumber,
            error: `父分类"${categoryData.parentName}"不存在`,
            data: categoryData
          });
          result.errorCount++;
          continue;
        }
      }

      // 创建分类
      const newCategory = new Category({
        name: categoryData.name,
        description: categoryData.description || '',
        parent: parentId,
        order: categoryData.order || 0,
      });

      await newCategory.save();

      // 添加到映射中，供后续分类使用
      categoryMap.set(newCategory.name, (newCategory as any)._id.toString());

      result.createdCategories.push({
        name: newCategory.name,
        id: (newCategory as any)._id.toString()
      });

      result.successCount++;

    } catch (error) {
      result.errors.push({
        row: rowNumber,
        error: error instanceof Error ? error.message : '创建分类时发生未知错误',
        data: categoryData
      });
      result.errorCount++;
    }
  }

  result.success = result.errorCount === 0;

  return result;
};

/**
 * 验证Excel文件格式
 */
export const validateExcelFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // 检查文件类型
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: '只支持Excel文件格式 (.xlsx, .xls)'
    };
  }

  // 检查文件大小 (最大5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小不能超过5MB'
    };
  }

  return { valid: true };
};
