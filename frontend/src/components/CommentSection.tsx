'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Image from 'next/image';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import {
  getComments,
  createComment,
  deleteComment,
  toggleCommentLike,
  reportComment,
  Comment,
} from '@/services/comment.service';
import { ApiError } from '@/services/auth.service';

interface CommentSectionProps {
  resourceId: string;
  currentUser?: {
    _id: string;
    username: string;
    avatar?: string;
    isAdmin?: boolean;
  };
  token?: string;
}

export default function CommentSection({
  resourceId,
  currentUser,
  token,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 获取评论列表
  const fetchComments = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getComments({
        resourceId,
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (page === 1) {
        setComments(response.data);
      } else {
        setComments(prev => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.currentPage < response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error('获取评论失败:', err);
      setError(err instanceof ApiError ? err.message : '获取评论时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchComments();
    }
  }, [resourceId]);

  // 处理评论提交
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !token) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const commentData = {
        content: newComment.trim(),
        resourceId,
        ...(replyTo && {
          parentId: replyTo.commentId,
          replyTo: {
            _id: replyTo.commentId,
            username: replyTo.authorName,
          },
        }),
      };

      const newCommentData = await createComment(commentData, token);

      if (replyTo) {
        // 添加回复
        setComments(prev =>
          prev.map(comment =>
            comment._id === replyTo.commentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentData],
                }
              : comment
          )
        );
      } else {
        // 添加新评论
        setComments(prev => [newCommentData, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('评论提交失败:', err);
      setError(err instanceof ApiError ? err.message : '评论提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理评论点赞
  const handleLike = async (commentId: string, isReply = false) => {
    if (!currentUser || !token) return;

    try {
      const result = await toggleCommentLike(commentId, token);

      setComments(prev =>
        prev.map(comment => {
          if (isReply && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply: Comment) =>
                reply._id === commentId
                  ? {
                      ...reply,
                      likes: result.likes,
                      isLiked: result.isLiked,
                    }
                  : reply
              ),
            };
          }
          return comment._id === commentId
            ? {
                ...comment,
                likes: result.likes,
                isLiked: result.isLiked,
              }
            : comment;
        })
      );
    } catch (err) {
      console.error('点赞失败:', err);
      setError(err instanceof ApiError ? err.message : '点赞失败');
    }
  };

  // 处理评论删除
  const handleDelete = async (commentId: string, isReply = false) => {
    if (!currentUser || !token) return;

    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      await deleteComment(commentId, token);

      if (isReply) {
        setComments(prev =>
          prev.map(comment => ({
            ...comment,
            replies: comment.replies?.filter((reply: Comment) => reply._id !== commentId),
          }))
        );
      } else {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
      }
    } catch (err) {
      console.error('删除失败:', err);
      setError(err instanceof ApiError ? err.message : '删除失败');
    }
  };

  // 处理举报
  const handleReport = async (commentId: string) => {
    if (!currentUser || !token) return;

    const reason = window.prompt('请输入举报原因：');
    if (!reason) return;

    try {
      await reportComment(commentId, reason, token);
      alert('举报已提交，我们会尽快处理');
    } catch (err) {
      console.error('举报失败:', err);
      setError(err instanceof ApiError ? err.message : '举报失败');
    }
  };

  // 加载更多评论
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchComments(currentPage + 1);
    }
  };

  // 渲染评论
  const renderComment = (comment: Comment, isReply = false) => {
    const canDelete =
      currentUser &&
      (currentUser._id === comment.author._id || currentUser.isAdmin);

    return (
      <div
        key={comment._id}
        className={`bg-white rounded-lg shadow-sm p-4 ${
          isReply ? 'ml-8 mt-2' : 'mb-4'
        }`}
      >
        <div className="flex items-start space-x-3">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${comment.author._id}/avatar`}
            alt={comment.author.username}
            width={40}
            height={40}
            className="rounded-full object-cover"
            style={{ width: '40px', height: '40px' }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {comment.author.username}
                </span>
                {comment.replyTo && (
                  <span className="text-gray-500 ml-2">
                    回复 @{comment.replyTo.username}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', {
                    locale: zhCN,
                  })}
                </span>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment._id, isReply)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
                {!isReply && currentUser && (
                  <button
                    onClick={() => handleReport(comment._id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FlagIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-gray-700">{comment.content}</p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => handleLike(comment._id, isReply)}
                className={`inline-flex items-center space-x-1 ${
                  comment.isLiked
                    ? 'text-red-600 hover:text-red-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {comment.isLiked ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{comment.likes}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() =>
                    setReplyTo({
                      commentId: comment._id,
                      authorName: comment.author.username,
                    })
                  }
                  className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span>回复</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {comment.replies?.map((reply: Comment) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">评论区</h2>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* 评论输入框 */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start space-x-3">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar`}
              alt={currentUser.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
              style={{ width: '40px', height: '40px' }}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyTo
                    ? `回复 @${replyTo.authorName}...`
                    : '写下你的评论...'
                }
                rows={3}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <div className="mt-2 flex justify-between items-center">
                {replyTo && (
                  <span className="text-sm text-gray-500">
                    回复 @{replyTo.authorName}
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      disabled={isSubmitting}
                    >
                      取消
                    </button>
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '发布中...' : '发布'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-white rounded-lg text-center text-gray-500">
          请登录后发表评论
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => renderComment(comment))}
            {hasMore && (
              <div className="text-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            暂无评论，快来发表第一条评论吧！
          </div>
        )}
      </div>
    </div>
  );
}