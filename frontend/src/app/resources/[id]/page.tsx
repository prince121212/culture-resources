'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResourceById, Resource as ResourceType, deleteResource, incrementDownloadCount } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import CommentSection from '@/components/resources/CommentSection';
import ResourceRating from '@/components/resources/ResourceRating';
import FavoriteButton from '@/components/resources/FavoriteButton';
import toast from 'react-hot-toast';

interface ResourceDetailViewProps {
  resource: ResourceType;
  currentUserId?: string | null;
  token?: string | null;
  router: ReturnType<typeof useRouter>;
}

const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({ resource, currentUserId, token, router }) => {
  // 注释掉未使用的变量，但保留逻辑，未来可能会用到
  // const isUploader = typeof resource.uploader === 'object'
  //   ? resource.uploader._id === currentUserId
  //   : resource.uploader === currentUserId;

  // Helper to format date (can be moved to a utils file)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // 辅助函数：获取分类名称
  const getCategoryName = (category: {name?: string} | string | null | undefined): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  // 注释掉未使用的函数，但保留逻辑，未来可能会用到
  // const handleDelete = async () => {
  //   if (!token) {
  //     toast.error('请先登录');
  //     return;
  //   }
  //   if (window.confirm('确定要删除这个资源吗？此操作无法撤销。')) {
  //     try {
  //       await deleteResource(resource._id, token);
  //       toast.success('资源删除成功！');
  //       router.push('/resources');
  //     } catch (err) {
  //       let errorMessage = '删除资源失败';
  //       if (err instanceof ApiError) {
  //         errorMessage = err.response?.message || err.message;
  //       } else if (err instanceof Error) {
  //         errorMessage = err.message;
  //       }
  //       toast.error(errorMessage);
  //     }
  //   }
  // };

  const handleGoToResourceClick = () => {
    // Increment download count, fire and forget
    incrementDownloadCount(resource._id);
    // The browser will follow the href of the link naturally
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左侧主要内容 */}
      <div className="lg:col-span-2 space-y-8">
        {/* 资源头部信息 */}
        <div className="card p-8 bg-gradient-to-br from-white to-amber-25 border-amber-100">
          {/* 标题区域 */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 leading-tight text-gray-900">{resource.title}</h1>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="rating-stars text-2xl text-amber-500">★★★★★</div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900">{resource.rating ? resource.rating.toFixed(1) : '0'}</span>
                      <span className="text-sm text-gray-500">{resource.ratingCount || 0} 评价</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span className="font-medium">{resource.downloadCount || 0} 次访问</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-8">
                <FavoriteButton
                  resourceId={resource._id}
                  className="p-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-105 shadow-sm"
                />
                <button className="p-4 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all hover:scale-105 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 资源描述 */}
          {resource.description && (
            <div className="mb-8 p-6 bg-white rounded-xl border border-amber-100">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">资源介绍</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{resource.description}</p>
            </div>
          )}

          {/* 标签 */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">相关标签</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {resource.tags.map((tag, index) => (
                  <span key={index} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors cursor-pointer">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* 访问按钮 */}
          <div className="text-center">
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoToResourceClick}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-7 h-7 mr-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              立即访问资源
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <p className="text-sm text-gray-500 mt-3">点击即可访问完整资源内容</p>
          </div>
        </div>
      </div>

      {/* 右侧信息栏 */}
      <div className="lg:col-span-1 space-y-6">
        {/* 上传者信息 */}
        <div className="card p-6 bg-gradient-to-br from-white to-amber-25 border-amber-200 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            上传者
          </h3>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {typeof resource.uploader === 'object' ? (
                <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-xl font-bold border-3 border-amber-200 shadow-lg">
                  {resource.uploader.username ? resource.uploader.username.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-500 text-white flex items-center justify-center text-xl font-bold border-3 border-amber-200 shadow-lg">
                  U
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900">
                {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
              </h4>
              <p className="text-amber-700 font-medium text-base">资源贡献者</p>
              <div className="flex items-center mt-2">
                <div className="rating-stars text-sm text-amber-500">★★★★★</div>
                <span className="text-sm text-gray-500 ml-2 font-medium">4.9分</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-amber-800 mb-1">1</div>
              <div className="text-sm text-gray-600 font-medium">上传资源</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-amber-800 mb-1">{resource.downloadCount || 0}</div>
              <div className="text-sm text-gray-600 font-medium">获得访问</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>上传时间: {formatDate(resource.createdAt)}</p>
            <p>最后更新: {formatDate(resource.updatedAt)}</p>
            <p>分类: {getCategoryName(resource.category)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, token, isLoading: authLoading } = useAuth();
  const [resource, setResource] = useState<ResourceType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resourceId = params?.id && typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (resourceId) {
      const fetchResource = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getResourceById(resourceId);
          setResource(data);
        } catch (err) {
          let errorMessage = 'Failed to fetch resource details.';
          if (err instanceof ApiError) {
            errorMessage = err.response?.message || err.message;
            if (err.status === 404) {
                // Optionally redirect or show a more specific not found component
                toast.error('Resource not found.');
                router.push('/resources'); // Or a /404 page
                return;
            }
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          toast.error(errorMessage);
        }
        setIsLoading(false);
      };
      fetchResource();
    } else {
      setError('Resource ID is missing.');
      setIsLoading(false);
      toast.error('Resource ID is missing.');
      router.push('/resources');
    }
  }, [resourceId, router]);

  if (isLoading || authLoading) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-xl text-red-500 mb-4">错误: {error}</p>
            <Link href="/resources" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                &larr; 返回资源列表
            </Link>
        </div>
    );
  }

  if (!resource) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-xl text-gray-700 dark:text-gray-300">未找到资源</p>
            <Link href="/resources" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                &larr; 返回资源列表
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-gray-700/70 backdrop-blur-sm rounded-full shadow-sm text-white hover:bg-gray-600/70 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回上一页
          </button>
        </div>
        
        <ResourceDetailView resource={resource} currentUserId={currentUser?._id} token={token} router={router} />

        {/* 评论区 */}
        <div className="mt-12">
          <div className="card p-8 bg-gradient-to-br from-white to-amber-25 border-amber-100">
            {/* 评分组件 */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  资源评分
                </h2>
              </div>
              <div className="bg-white rounded-xl p-6 border border-amber-100 shadow-sm">
                <ResourceRating resourceId={resource._id} />
              </div>
            </div>
            
            <CommentSection resourceId={resource._id} />
          </div>
        </div>
    </div>
  );
}

// Using toast for error notifications requires react-hot-toast to be set up in layout
// import toast from 'react-hot-toast'; // Already imported at the top