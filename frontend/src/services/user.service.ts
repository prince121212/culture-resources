import { ApiError, ApiErrorData } from './auth.service';
import { User } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export interface UpdateUserProfileData {
  username?: string;
  email?: string;
  avatar?: string;
  // 可以根据需要添加更多字段
}

/**
 * 获取用户资料
 * @param userId 用户ID
 * @param token 认证令牌
 * @returns 用户资料
 */
export const getUserProfile = async (userId: string, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/profile/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '获取用户资料失败', data as ApiErrorData);
  }
  return data as User;
};

/**
 * 更新用户资料
 * @param userId 用户ID
 * @param profileData 更新的资料数据
 * @param token 认证令牌
 * @returns 更新后的用户资料
 */
export const updateUserProfile = async (
  userId: string,
  profileData: UpdateUserProfileData,
  token: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/users/profile/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '更新用户资料失败', data as ApiErrorData);
  }
  return data as User;
};

/**
 * 上传用户头像
 * @param userId 用户ID
 * @param file 头像文件
 * @param token 认证令牌
 * @returns 包含头像URL的响应
 */
export const uploadAvatar = async (
  userId: string,
  file: File,
  token: string
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '上传头像失败', data as ApiErrorData);
  }
  return data as { avatarUrl: string };
};

/**
 * 获取用户上传的资源
 * @param userId 用户ID
 * @param token 认证令牌
 * @returns 用户上传的资源列表
 */
export const getUserUploads = async (userId: string, token: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/users/uploads/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '获取用户上传资源失败', data as ApiErrorData);
  }
  return data;
};

/**
 * 获取用户收藏的资源
 * @param userId 用户ID
 * @param token 认证令牌
 * @returns 用户收藏的资源列表
 */
export const getUserFavorites = async (userId: string, token: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/users/favorites/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '获取用户收藏资源失败', data as ApiErrorData);
  }
  return data;
};

/**
 * 获取用户活动统计数据
 * @param userId 用户ID
 * @param token 认证令牌
 * @returns 用户活动统计数据
 */
export const getUserStats = async (userId: string, token: string): Promise<any> => {
  const response = await fetch(`${API_URL}/users/${userId}/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || '获取用户统计数据失败', data as ApiErrorData);
  }
  return data;
};