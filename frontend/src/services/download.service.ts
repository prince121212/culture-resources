import { ApiError } from './auth.service';
import { Resource, PaginatedResourcesResponse } from './resource.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * 获取用户下载历史
 */
export const getDownloadHistory = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResourcesResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/downloads?${query.toString()}`, {
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
      '获取下载历史失败',
      { message: data.message || '获取下载历史失败' }
    );
  }

  return data as PaginatedResourcesResponse;
};

/**
 * 记录资源下载
 */
export const recordDownload = async (
  resourceId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download`, {
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
      '记录下载失败',
      { message: data.message || '记录下载失败' }
    );
  }

  return data as { message: string };
};

/**
 * 下载资源并记录
 */
export const downloadResource = async (
  resourceId: string,
  token: string | null
): Promise<void> => {
  try {
    // 如果用户已登录，记录下载
    if (token) {
      try {
        await recordDownload(resourceId, token);
      } catch (error) {
        console.error('记录下载失败', error);
        // 即使记录失败，也继续下载
      }
    }

    // 打开下载链接
    window.open(`${API_BASE_URL}/downloads/download/${resourceId}`, '_blank');
  } catch (error) {
    console.error('下载资源失败', error);
    throw new Error('下载资源失败');
  }
};
