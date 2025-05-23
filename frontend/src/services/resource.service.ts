import { ApiError, ApiErrorData } from './auth.service'; // Reuse ApiError or create a more generic one

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Interfaces
export interface Uploader {
  _id: string;
  username: string;
  email?: string; // Optional, as populated from backend
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  link: string;
  uploader: Uploader | string; // Can be populated Uploader object or just ID string
  category?: string;
  tags?: string[];
  downloadCount: number;
  rating?: number; // 平均评分
  ratingCount?: number; // 评分数量
  createdAt: string; // Date as string
  updatedAt: string; // Date as string
  isFavorite?: boolean; // 是否已收藏
  downloadDate?: string; // 下载日期（仅在下载历史中使用）
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  limit: number;
}

export interface PaginatedResourcesResponse {
  data: Resource[];
  pagination: PaginationInfo;
}

export interface GetResourcesParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  tags?: string; // Comma-separated string of tags
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  uploaderId?: string; // Added for filtering by uploader
}

export interface CreateResourceData {
  title: string;
  url?: string;
  link?: string;  // 添加link作为url的别名
  description?: string;
  category?: string;
  tags?: string[];
}

export type UpdateResourceData = Partial<CreateResourceData>;

// API Service Functions

/**
 * Fetches a list of resources with optional pagination, filtering, and sorting.
 */
export const getResources = async (params?: GetResourcesParams): Promise<PaginatedResourcesResponse> => {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/resources?${query.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to fetch resources', data as ApiErrorData);
  }
  return data as PaginatedResourcesResponse;
};

/**
 * Fetches a single resource by its ID.
 */
export const getResourceById = async (id: string): Promise<Resource> => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch resource ${id}`, data as ApiErrorData);
  }
  return data as Resource;
};

/**
 * Creates a new resource.
 * Requires authentication token.
 */
export const createResource = async (resourceData: CreateResourceData, token: string): Promise<Resource> => {
  try {
    console.log('Creating resource with data:', resourceData);
    console.log('API URL:', `${API_BASE_URL}/resources`);
    console.log('Using token:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(resourceData),
    });
    
    const data = await response.json();
    console.log('API Response:', response.status, data);

    if (!response.ok) {
      console.error('Error creating resource:', data);
      throw new ApiError(response.status, 'Failed to create resource', data as ApiErrorData);
    }
    return data as Resource;
  } catch (error) {
    console.error('Exception in createResource:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error while creating resource');
  }
};

/**
 * Updates an existing resource.
 * Requires authentication token.
 */
export const updateResource = async (id: string, resourceData: UpdateResourceData, token: string): Promise<Resource> => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(resourceData),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to update resource ${id}`, data as ApiErrorData);
  }
  return data as Resource;
};

/**
 * Deletes a resource.
 * Requires authentication token.
 */
export const deleteResource = async (id: string, token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to delete resource ${id}`, data as ApiErrorData);
  }
  return data as { message: string };
};

/**
 * Increments the download count for a resource.
 */
export const incrementDownloadCount = async (resourceId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/increment-download`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // Handle error silently or log it, as this is a fire-and-forget type of request for UX.
      // For now, let's log it to console if it fails.
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response for download count increment' }));
      console.error(`Failed to increment download count for resource ${resourceId}: ${response.status}`, errorData);
      // Optionally, re-throw a specific error or a generic one if the caller needs to know.
      // throw new ApiError(response.status, `Failed to increment download count`, errorData as ApiErrorData);
    }
    // No specific data needs to be returned to the caller for this operation usually.
  } catch (error) {
    console.error(`Network or other error incrementing download count for resource ${resourceId}:`, error);
    // Optionally, re-throw if the caller needs to handle this.
    // if (error instanceof ApiError) throw error; else throw new Error('Network error during download count increment');
  }
};