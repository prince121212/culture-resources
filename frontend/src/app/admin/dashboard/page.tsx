"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface SystemStats {
  totalUsers: number;
  totalResources: number;
  totalPendingResources: number;
  totalApprovedResources: number;
  totalRejectedResources: number;
  totalCategories: number;
  totalTags: number;
  totalRatings: number;
  totalFavorites: number;
  recentUsers: any[];
  recentResources: any[];
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('获取统计数据失败');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('获取统计数据出错:', error);
        toast.error('获取统计数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">系统概览</h1>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 用户统计卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">总用户数</h2>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">最近注册: <span className="text-green-500 font-semibold">{stats.recentUsers?.length || 0}</span></p>
            </div>
          </div>

          {/* 资源统计卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">总资源数</h2>
                <p className="text-2xl font-semibold">{stats.totalResources}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">最近上传: <span className="text-green-500 font-semibold">{stats.recentResources?.length || 0}</span></p>
            </div>
          </div>

          {/* 待审核资源卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">待审核资源</h2>
                <p className="text-2xl font-semibold">{stats.totalPendingResources}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href="/admin/reviews" className="text-sm text-indigo-600 hover:text-indigo-800">查看待审核资源 →</a>
            </div>
          </div>

          {/* 已审核资源卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-600 text-sm">已审核资源</h2>
                <p className="text-2xl font-semibold">{(stats.totalApprovedResources || 0) + (stats.totalRejectedResources || 0)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                通过: <span className="text-green-500 font-semibold">{stats.totalApprovedResources || 0}</span> |
                拒绝: <span className="text-red-500 font-semibold">{stats.totalRejectedResources || 0}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                无法加载统计数据，请检查网络连接或稍后再试。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
