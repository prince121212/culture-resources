import axios from 'axios';
import { ApiError } from './auth.service';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  resourceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

/**
 * 获取所有分类
 */
export const getCategories = async (params?: { withResourceCount?: boolean, flat?: boolean, activeOnly?: boolean }): Promise<Category[]> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.withResourceCount) queryParams.append('withResourceCount', 'true');
      if (params.flat) queryParams.append('flat', 'true');
      if (params.activeOnly) queryParams.append('activeOnly', 'true');
    } else {
      // 默认添加资源计数
      queryParams.append('withResourceCount', 'true');
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await axios.get(`${API_BASE_URL}/categories${queryString}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '获取分类列表失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '获取分类列表失败', { message: '获取分类列表失败' });
  }
};

/**
 * 获取单个分类详情
 */
export const getCategory = async (id: string): Promise<Category> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '获取分类详情失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '获取分类详情失败', { message: '获取分类详情失败' });
  }
};

/**
 * 创建新分类
 */
export const createCategory = async (data: { name: string; description?: string }): Promise<Category> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '创建分类失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '创建分类失败', { message: '创建分类失败' });
  }
};

/**
 * 更新分类
 */
export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Category> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/categories/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '更新分类失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '更新分类失败', { message: '更新分类失败' });
  }
};

/**
 * 删除分类
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '删除分类失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '删除分类失败', { message: '删除分类失败' });
  }
};