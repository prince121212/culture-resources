import { ApiError } from './auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export interface ResourceRating {
  _id: string;
  resource: string | {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    link: string;
  };
  user: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// 分页响应接口
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

// 获取用户评分历史参数
export interface GetUserRatingsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 为资源添加评分
 */
export const rateResource = async (
  resourceId: string,
  rating: number,
  token: string
): Promise<ResourceRating> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '评分失败',
      { message: data.message || '评分失败' }
    );
  }

  return data as ResourceRating;
};

/**
 * 获取用户对资源的评分
 */
export const getUserRating = async (
  resourceId: string,
  token: string
): Promise<ResourceRating | null> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/rating`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  // 如果状态码是404，表示用户尚未评分
  if (response.status === 404) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '获取评分失败',
      { message: data.message || '获取评分失败' }
    );
  }

  return data as ResourceRating;
};

/**
 * 获取资源的评分统计
 */
export const getResourceRatingStats = async (
  resourceId: string
): Promise<ResourceRatingStats> => {
  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/ratings/stats`);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '获取评分统计失败',
      { message: data.message || '获取评分统计失败' }
    );
  }

  return data as ResourceRatingStats;
};

/**
 * 获取用户评分历史
 * @param userId 用户ID
 * @param token 认证令牌
 * @param params 分页和排序参数
 * @returns 分页的评分历史记录
 */
export const getUserRatings = async (
  userId: string,
  token: string,
  params?: GetUserRatingsParams
): Promise<PaginatedResponse<ResourceRating>> => {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/ratings/user/${userId}?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      '获取评分历史失败',
      { message: data.message || '获取评分历史失败' }
    );
  }
  return data as PaginatedResponse<ResourceRating>;
};
