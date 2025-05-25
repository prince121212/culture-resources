import * as XLSX from 'xlsx';
import Tag, { ITag } from '../models/tag.model';
import mongoose from 'mongoose';

export interface TagImportData {
  name: string;
  description?: string;
}

export interface TagImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  createdTags: Array<{
    name: string;
    id: string;
  }>;
}

/**
 * 解析Excel文件并提取标签数据
 */
export const parseTagExcelFile = (buffer: Buffer): TagImportData[] => {
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
    
    // 验证表头
    const nameIndex = headers.findIndex((h: string) => h === '标签名称' || h === 'name');
    if (nameIndex === -1) {
      throw new Error('Excel文件必须包含"标签名称"列');
    }
    
    const descIndex = headers.findIndex((h: string) => h === '描述' || h === 'description');
    
    // 解析数据行
    const tags: TagImportData[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // 跳过空行
      if (!row || row.length === 0 || !row[nameIndex]) {
        continue;
      }
      
      const tag: TagImportData = {
        name: String(row[nameIndex] || '').trim(),
      };
      
      // 添加可选字段
      if (descIndex !== -1 && row[descIndex]) {
        tag.description = String(row[descIndex] || '').trim();
      }
      
      tags.push(tag);
    }
    
    return tags;
  } catch (error) {
    throw new Error(`解析Excel文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 批量导入标签数据
 */
export const importTags = async (tagsData: TagImportData[]): Promise<TagImportResult> => {
  const result: TagImportResult = {
    success: false,
    totalRows: tagsData.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
    createdTags: []
  };
  
  // 获取所有现有标签，用于检查重复
  const existingTags = await Tag.find({}).select('name _id');
  const tagMap = new Set<string>();
  existingTags.forEach((tag: any) => {
    tagMap.add(tag.name.toLowerCase());
  });
  
  for (let i = 0; i < tagsData.length; i++) {
    const tagData = tagsData[i];
    const rowNumber = i + 2; // +2 因为Excel从1开始，且第1行是表头
    
    try {
      // 验证标签名称
      if (!tagData.name || tagData.name.length < 1) {
        result.errors.push({
          row: rowNumber,
          error: '标签名称不能为空',
          data: tagData
        });
        result.errorCount++;
        continue;
      }
      
      if (tagData.name.length > 30) {
        result.errors.push({
          row: rowNumber,
          error: '标签名称不能超过30个字符',
          data: tagData
        });
        result.errorCount++;
        continue;
      }
      
      // 检查标签名称是否已存在（不区分大小写）
      if (tagMap.has(tagData.name.toLowerCase())) {
        result.errors.push({
          row: rowNumber,
          error: `标签名称"${tagData.name}"已存在`,
          data: tagData
        });
        result.errorCount++;
        continue;
      }
      
      // 验证描述长度
      if (tagData.description && tagData.description.length > 200) {
        result.errors.push({
          row: rowNumber,
          error: '标签描述不能超过200个字符',
          data: tagData
        });
        result.errorCount++;
        continue;
      }
      
      // 创建标签
      const newTag = new Tag({
        name: tagData.name,
        description: tagData.description || '',
        count: 0,
        isActive: true,
      });
      
      await newTag.save();
      
      // 添加到映射中，防止后续重复
      tagMap.add(newTag.name.toLowerCase());
      
      result.createdTags.push({
        name: newTag.name,
        id: (newTag as any)._id.toString()
      });
      
      result.successCount++;
      
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        error: error instanceof Error ? error.message : '创建标签时发生未知错误',
        data: tagData
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
export const validateTagExcelFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
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
