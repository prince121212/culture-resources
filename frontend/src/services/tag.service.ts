import axios from 'axios';
import { ApiError } from './auth.service';

export interface Tag {
  _id: string;
  name: string;
  description?: string;
  resourceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

/**
 * 获取所有标签
 */
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tags`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '获取标签列表失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '获取标签列表失败', { message: '获取标签列表失败' });
  }
};

/**
 * 获取单个标签详情
 */
export const getTag = async (id: string): Promise<Tag> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tags/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '获取标签详情失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '获取标签详情失败', { message: '获取标签详情失败' });
  }
};

/**
 * 创建新标签
 */
export const createTag = async (data: { name: string; description?: string }): Promise<Tag> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tags`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '创建标签失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '创建标签失败', { message: '创建标签失败' });
  }
};

/**
 * 更新标签
 */
export const updateTag = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Tag> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tags/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '更新标签失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '更新标签失败', { message: '更新标签失败' });
  }
};

/**
 * 删除标签
 */
export const deleteTag = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/tags/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || { message: '删除标签失败' };
      throw new ApiError(
        error.response?.status || 500,
        errorData.message,
        errorData
      );
    }
    throw new ApiError(500, '删除标签失败', { message: '删除标签失败' });
  }
};