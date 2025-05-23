'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getUserRatings } from '@/services/rating.service';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 评分记录类型定义
interface RatingRecord {
  _id: string;
  resource: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    link: string;
  };
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export default function RatingsHistoryPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();
  
  const [ratings, setRatings] = useState<RatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看评分历史');
      router.replace('/auth/login?redirect=/profile/ratings');
    }
  }, [isAuthenticated, authLoading, router]);

  // 获取用户评分历史
  useEffect(() => {
    if (currentUser?._id && token) {
      fetchRatings();
    }
  }, [currentUser, token, page]);

  const fetchRatings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserRatings(currentUser!._id, token!, { page, limit: 10 });
      setRatings(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.error('获取评分历史失败:', err);
      setError('获取评分历史失败，请稍后再试');
      toast.error('获取评分历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染星级评分
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">我的评分历史</h1>
          <Link
            href="/profile"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            返回个人中心
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">您还没有对任何资源进行评分</p>
            <Link
              href="/resources"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
            >
              浏览资源
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      资源
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      评分
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      评分时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ratings.map((rating) => (
                    <tr key={rating._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              <Link href={`/resources/${rating.resource._id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                {rating.resource.title}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {rating.resource.description || '无描述'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(rating.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true, locale: zhCN })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/resources/${rating.resource._id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          查看资源
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-l-md border ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    上一页
                  </button>
                  <span className="px-4 py-1 border-t border-b bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-r-md border ${
                      page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    下一页
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
