import { ApiError } from './auth.service';
import { Resource, PaginatedResourcesResponse } from './resource.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * 获取用户收藏的资源列表
 */
export const getFavoriteResources = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResourcesResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/favorites?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '获取收藏资源失败',
      { message: data.message || '获取收藏资源失败' }
    );
  }

  return data as PaginatedResourcesResponse;
};

/**
 * 收藏资源
 */
export const favoriteResource = async (
  resourceId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '收藏资源失败',
      { message: data.message || '收藏资源失败' }
    );
  }

  return data as { message: string };
};

/**
 * 取消收藏资源
 */
export const unfavoriteResource = async (
  resourceId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/favorite`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '取消收藏失败',
      { message: data.message || '取消收藏失败' }
    );
  }

  return data as { message: string };
};

/**
 * 检查资源是否已收藏
 */
export const checkFavorite = async (
  resourceId: string,
  token: string
): Promise<{ isFavorite: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/favorite`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '检查收藏状态失败',
      { message: data.message || '检查收藏状态失败' }
    );
  }

  return data as { isFavorite: boolean };
};

/**
 * 切换收藏状态
 */
export const toggleFavorite = async (
  resourceId: string,
  isFavorite: boolean,
  token: string
): Promise<{ isFavorite: boolean; message: string }> => {
  try {
    if (isFavorite) {
      const result = await unfavoriteResource(resourceId, token);
      return { isFavorite: false, message: result.message };
    } else {
      const result = await favoriteResource(resourceId, token);
      return { isFavorite: true, message: result.message };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('切换收藏状态失败');
  }
};
