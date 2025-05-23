'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getUserStats } from '@/services/user.service';

// 用户统计数据类型
interface UserStats {
  uploads: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  downloads: {
    total: number;
    lastMonth: number;
  };
  ratings: {
    given: number;
    averageGiven: number;
    received: {
      total: number;
      average: number;
    };
  };
  comments: {
    posted: number;
    received: number;
  };
  favorites: {
    count: number;
  };
}

export default function UserStatsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看活动统计');
      router.replace('/auth/login?redirect=/profile/stats');
    }
  }, [isAuthenticated, authLoading, router]);

  // 获取用户统计数据
  useEffect(() => {
    if (currentUser?._id && token) {
      fetchUserStats();
    }
  }, [currentUser, token]);

  const fetchUserStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userStats = await getUserStats(currentUser!._id, token!);
      setStats(userStats);
    } catch (err) {
      console.error('获取用户统计数据失败:', err);
      setError('获取用户统计数据失败，请稍后再试');
      toast.error('获取用户统计数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染统计卡片
  const renderStatCard = (title: string, value: number | string, description?: string) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">活动统计</h1>
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
        ) : stats ? (
          <div className="space-y-8">
            {/* 上传统计 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">上传统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderStatCard('总上传数', stats.uploads.total)}
                {renderStatCard('已通过', stats.uploads.approved)}
                {renderStatCard('审核中', stats.uploads.pending)}
                {renderStatCard('已拒绝', stats.uploads.rejected)}
              </div>
            </div>

            {/* 下载统计 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">下载统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderStatCard('总下载数', stats.downloads.total)}
                {renderStatCard('本月下载', stats.downloads.lastMonth)}
              </div>
            </div>

            {/* 评分统计 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">评分统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderStatCard('已评分数', stats.ratings.given)}
                {renderStatCard('平均评分', stats.ratings.averageGiven.toFixed(1))}
                {renderStatCard('收到评分', `${stats.ratings.received.average.toFixed(1)} (${stats.ratings.received.total})`)}
              </div>
            </div>

            {/* 评论统计 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">评论统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderStatCard('已发表评论', stats.comments.posted)}
                {renderStatCard('收到评论', stats.comments.received)}
              </div>
            </div>

            {/* 收藏统计 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">收藏统计</h2>
              <div className="grid grid-cols-1 gap-4">
                {renderStatCard('收藏资源数', stats.favorites.count)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">暂无统计数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
