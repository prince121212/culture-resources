'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, ApiErrorData } from '@/services/auth.service';
import toast from 'react-hot-toast';
import PaginationControls from './PaginationControls';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  resourceId: string;
  onCommentAdded?: () => void;
}

interface PaginatedCommentsResponse {
  data: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    limit: number;
  };
}

export default function CommentSection({ resourceId, onCommentAdded }: CommentSectionProps) {
  const { user, token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const commentsPerPage = 10;

  // 获取评论列表
  const fetchComments = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/resources/${resourceId}/comments?page=${page}&limit=${commentsPerPage}`
      );
      const data: PaginatedCommentsResponse = await response.json();
      
      if (!response.ok) {
        const errorDataFromServer = await response.json().catch(() => ({})); // Try to get more error details
        const errorData: ApiErrorData = { 
          message: `获取评论失败 (状态: ${response.status})`, 
          errors: response.status === 404 ? [{ msg: '找不到评论资源' }] : errorDataFromServer.errors || [{msg: response.statusText}]
        };
        console.error('Fetch comments error details:', errorDataFromServer);
        throw new ApiError(response.status, errorData.message, errorData);
      }

      setComments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalComments(data.pagination.totalComments);
    } catch (err) {
      console.error('Error in fetchComments:', err); // 更详细的日志
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else if (err instanceof Error) {
        setError(`获取评论时发生未知错误: ${err.message}`);
        toast.error(`获取评论时发生未知错误: ${err.message}`);
      } else {
        setError('获取评论时发生未知错误');
        toast.error('获取评论时发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) { // 确保 resourceId 存在
        fetchComments(page);
    }
  }, [resourceId, page]);

  // 提交新评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      toast.error('请先登录后再评论');
      return;
    }
    if (!newComment.trim()) {
      toast.error('评论内容不能为空');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/resources/${resourceId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      // 尝试解析JSON，即使响应不成功，以便获取错误信息
      const data = await response.json().catch(() => ({ message: `请求失败，状态码: ${response.status}` }));
      
      if (!response.ok) {
        console.error('Submit comment error details:', data);
        throw new ApiError(response.status, data.message || '提交评论失败', data);
      }

      toast.success('评论发布成功！');
      setNewComment('');
      fetchComments(1); // 刷新评论列表，回到第一页
      onCommentAdded?.();
    } catch (err) {
      console.error('Error in handleSubmitComment:', err); // 更详细的日志
      if (err instanceof ApiError) {
        toast.error(err.message || '提交评论时发生API错误');
      } else if (err instanceof Error) {
        toast.error(`提交评论时发生错误: ${err.message}`);
      } else {
        toast.error('提交评论时发生未知错误');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!token) {
      toast.error('请先登录');
      return;
    }

    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`, // 注意：删除评论的API路径与获取/创建不同
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json().catch(() => ({ message: `请求失败，状态码: ${response.status}` }));

      if (!response.ok) {
        console.error('Delete comment error details:', data);
        throw new ApiError(response.status, data.message || '删除评论失败', data);
      }

      toast.success('评论已删除');
      fetchComments(page);
    } catch (err) {
      console.error('Error in handleDeleteComment:', err); // 更详细的日志
      if (err instanceof ApiError) {
        toast.error(err.message || '删除评论时发生API错误');
      } else if (err instanceof Error) {
        toast.error(`删除评论时发生错误: ${err.message}`);
      } else {
        toast.error('删除评论时发生未知错误');
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { locale: zhCN });
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        评论 ({totalComments})
      </h2>

      {/* 评论表单 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              发表评论
            </label>
            <textarea
              id="comment"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="写下你的评论..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? '提交中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            请
            <a href="/auth/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              登录
            </a>
            后发表评论
          </p>
        </div>
      )}

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-4">加载评论中...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          暂无评论，快来发表第一条评论吧！
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {comment.user.avatar ? (
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.username}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                            {comment.user.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user.username}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  {comment.content}
                </div>
                {user?._id === comment.user._id && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 