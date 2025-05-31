'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { ApiError, ApiErrorData } from '@/services/auth.service';
import toast from 'react-hot-toast';
import PaginationControls from './PaginationControls';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Comment {
  _id: string;
  content: string;
  author: {
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`,
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
    <div>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.66-.4c-.54-.18-1.12-.3-1.34-.3-.44 0-.84.04-1.23.14C6.09 19.95 4 18.5 4 16.5c0-1.38.8-2.63 2-3.27V12a8 8 0 018-8c4.418 0 8 3.582 8 8z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          评论 ({totalComments})
        </h2>
      </div>

      {/* 评论表单 */}
      {isAuthenticated ? (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="border-b border-amber-100 px-6 py-4">
            <h3 className="font-semibold text-gray-800">发表评论</h3>
          </div>
          <form onSubmit={handleSubmitComment} className="p-6">
            <div className="mb-4">
              <textarea
                id="comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="写下你的评论..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? '提交中...' : '发表评论'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-amber-800">
            请
            <a href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium mx-1">
              登录
            </a>
            后发表评论
          </p>
        </div>
      )}

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-amber-700">加载评论中...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 rounded-xl p-6 border border-red-100">
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-amber-100 shadow-sm">
          <svg className="w-12 h-12 text-amber-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.66-.4c-.54-.18-1.12-.3-1.34-.3-.44 0-.84.04-1.23.14C6.09 19.95 4 18.5 4 16.5c0-1.38.8-2.63 2-3.27V12a8 8 0 018-8c4.418 0 8 3.582 8 8z"></path>
          </svg>
          <p className="text-gray-500 text-lg">暂无评论，快来发表第一条评论吧！</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white rounded-xl p-5 border border-amber-100 shadow-sm transition-shadow hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {comment.author.avatar ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${comment.author._id}/avatar`}
                          alt={comment.author.username}
                          width={40}
                          height={40}
                          className="rounded-full object-cover border-2 border-amber-200"
                          style={{ width: '40px', height: '40px' }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold border-2 border-amber-200">
                          {comment.author.username ? comment.author.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {comment.author.username}
                      </div>
                      <div className="text-xs text-amber-600">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {user?._id === comment.author._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="mt-3 text-gray-700 pl-12">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-6">
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