'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getResources, Resource, PaginatedResourcesResponse } from '@/services/resource.service';
import ResourceCard from '@/components/resources/ResourceCard';
import { ApiError } from '@/services/auth.service';

export default function UploadsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();

  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [isFetchingResources, setIsFetchingResources] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看您上传的资源');
      router.replace('/auth/login?redirect=/profile/uploads');
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
          let errorMessage = '获取您上传的资源失败';
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
        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载...</p>
      </div>
    );
  }

  const handleResourceDeleted = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('资源已成功删除');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link 
          href="/profile" 
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
        >
          &larr; 返回个人中心
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">我上传的资源</h1>
      </div>

      <div className="mt-6">
        {isFetchingResources && <p className="text-center text-gray-500 dark:text-gray-400 py-4">正在加载您上传的资源...</p>}
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
      
      {!isFetchingResources && !fetchError && userResources.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/resources/new" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg focus:outline-none focus:shadow-outline transition-colors duration-150">
              上传更多资源
          </Link>
        </div>
      )}
    </div>
  );
}
