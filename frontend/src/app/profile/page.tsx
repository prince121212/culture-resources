'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { getResources, Resource, PaginatedResourcesResponse } from '@/services/resource.service';
import ResourceCard from '@/components/resources/ResourceCard';
import { ApiError } from '@/services/auth.service';

export default function ProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();

  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [isFetchingResources, setIsFetchingResources] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看个人资料');
      router.replace('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (currentUser && token) {
      const fetchUserResources = async () => {
        setIsFetchingResources(true);
        setFetchError(null);
        try {
          const response: PaginatedResourcesResponse = await getResources({
            uploaderId: currentUser._id,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 50,
          });
          setUserResources(response.data);
        } catch (err) {
          let errorMessage = '获取您的资源失败';
          if (err instanceof ApiError) {
            errorMessage = err.response?.message || err.message;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          setFetchError(errorMessage);
          toast.error(errorMessage);
          setUserResources([]);
        }
        setIsFetchingResources(false);
      };
      fetchUserResources();
    }
  }, [currentUser, token, refreshKey]);

  if (authLoading || !isAuthenticated || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载个人资料...</p>
      </div>
    );
  }

  const handleResourceDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8 mb-8">
        <div className="flex items-center mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
            {currentUser.avatar ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar`}
                alt="用户头像"
                width={80}
                height={80}
                className="object-cover"
                style={{ width: '80px', height: '80px' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.png'; }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                无头像
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">个人资料</h1>
        </div>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">用户名:</span> {currentUser.username}
          </p>
          <p className="text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">电子邮箱:</span> {currentUser.email}
          </p>
          {currentUser.createdAt && (
          <p className="text-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">注册时间:</span> {new Date(currentUser.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          )}
        </div>
        <div className="mt-6">
          <Link
            href="/profile/edit"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            编辑个人资料
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">我上传的资源</h2>
        {isFetchingResources && <p className="text-center text-gray-500 dark:text-gray-400 py-4">正在加载您的资源...</p>}
        {fetchError && <p className="text-center text-red-500 py-4">错误: {fetchError}</p>}
        {!isFetchingResources && !fetchError && userResources.length === 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 min-h-[150px] flex flex-col items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">您还没有上传任何资源</p>
            <Link href="/resources/new" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                上传您的第一个资源
            </Link>
          </div>
        )}
        {!isFetchingResources && !fetchError && userResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userResources.map(resource => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                currentUserId={currentUser._id}
                token={token}
                onResourceDeleted={handleResourceDeleted}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">我的活动</h2>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">评分历史</h3>
              <Link
                href="/profile/ratings"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                查看我的评分历史
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">收藏资源</h3>
              <p className="text-gray-500 dark:text-gray-400">功能开发中...</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">活动统计</h3>
              <Link
                href="/profile/stats"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                查看我的活动统计
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/resources/new" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg focus:outline-none focus:shadow-outline transition-colors duration-150">
            上传更多资源
        </Link>
      </div>
    </div>
  );
}