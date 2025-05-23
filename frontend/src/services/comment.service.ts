import { ApiError } from './auth.service';

export interface CommentAuthor {
  _id: string;
  username: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  replyTo?: {
    _id: string;
    username: string;
  };
}

export interface CreateCommentData {
  content: string;
  resourceId: string;
  parentId?: string;
  replyTo?: {
    _id: string;
    username: string;
  };
}

export interface GetCommentsParams {
  resourceId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCommentsResponse {
  data: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// 获取评论列表
export async function getComments(
  params: GetCommentsParams
): Promise<PaginatedCommentsResponse> {
  const { resourceId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  const response = await fetch(
    `${API_BASE_URL}/resources/${resourceId}/comments?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '获取评论失败',
      { message: error.message || '获取评论失败', errors: error.errors }
    );
  }

  return response.json();
}

// 创建评论
export async function createComment(
  data: CreateCommentData,
  token: string
): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/resources/${data.resourceId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: data.content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '创建评论失败',
      { message: error.message || '创建评论失败', errors: error.errors }
    );
  }

  return response.json();
}

// 更新评论
export async function updateComment(
  commentId: string,
  content: string,
  token: string
): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '更新评论失败',
      { message: error.message || '更新评论失败', errors: error.errors }
    );
  }

  return response.json();
}

// 删除评论
export async function deleteComment(
  commentId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '删除评论失败',
      { message: error.message || '删除评论失败', errors: error.errors }
    );
  }
}

// 点赞/取消点赞评论
export async function toggleCommentLike(
  commentId: string,
  token: string
): Promise<{ likes: number; isLiked: boolean }> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '操作失败',
      { message: error.message || '操作失败', errors: error.errors }
    );
  }

  return response.json();
}

// 举报评论
export async function reportComment(
  commentId: string,
  reason: string,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.message || '举报失败',
      { message: error.message || '举报失败', errors: error.errors }
    );
  }
} 