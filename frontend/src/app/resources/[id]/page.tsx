'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResourceById, Resource as ResourceType, deleteResource /*, incrementDownloadCount*/ } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import CommentSection from '@/components/resources/CommentSection';
import RelatedResources from '@/components/resources/RelatedResources';
import ResourceRating from '@/components/resources/ResourceRating';
import RatingStars from '@/components/resources/RatingStars';
import FavoriteButton from '@/components/resources/FavoriteButton';
import toast from 'react-hot-toast';

interface ResourceDetailViewProps {
  resource: ResourceType;
  currentUserId?: string | null;
  token?: string | null;
  router: ReturnType<typeof useRouter>;
}

const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({ resource, currentUserId, token, router }) => {
  const isUploader = typeof resource.uploader === 'object'
    ? resource.uploader._id === currentUserId
    : resource.uploader === currentUserId;

  // Helper to format date (can be moved to a utils file)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // 辅助函数：获取分类名称
  const getCategoryName = (category: any): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  const handleDelete = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }
    if (window.confirm('确定要删除这个资源吗？此操作无法撤销。')) {
      try {
        await deleteResource(resource._id, token);
        toast.success('资源删除成功！');
        router.push('/resources');
      } catch (err) {
        let errorMessage = '删除资源失败';
        if (err instanceof ApiError) {
          errorMessage = err.response?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        toast.error(errorMessage);
      }
    }
  };

  // 隐藏下载按钮后，此函数暂时不使用
  // const handleGoToResourceClick = () => {
  //   // Increment download count, fire and forget
  //   incrementDownloadCount(resource._id);
  //   // The browser will follow the href of the link naturally
  // };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">{resource.title}</h1>
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <p>分类: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getCategoryName(resource.category)}</span></p>
        {resource.tags && resource.tags.length > 0 && (
          <p>标签: <span className="font-semibold text-gray-700 dark:text-gray-300">{resource.tags.join(', ')}</span></p>
        )}
        <p>上传者: <span className="font-semibold text-gray-700 dark:text-gray-300">
          {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
          </span>
        </p>
        <p>上传时间: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(resource.createdAt)}</span></p>
        <p>最后更新: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(resource.updatedAt)}</span></p>
        <p>下载次数: <span className="font-semibold text-gray-700 dark:text-gray-300">{resource.downloadCount}</span></p>
        <div className="mt-1 text-gray-500 dark:text-gray-400">评分:
          <span className="ml-1 inline-flex items-center">
            <RatingStars initialRating={resource.rating || 0} readOnly size="sm" />
            <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">
              {resource.rating ? resource.rating.toFixed(1) : '0'} ({resource.ratingCount || 0})
            </span>
          </span>
        </div>
      </div>

      {resource.description && (
        <div className="prose dark:prose-invert max-w-none mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">资源描述</h2>
          <p className="text-gray-700 dark:text-gray-300">{resource.description}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 items-center">
        {/* 隐藏访问资源按钮 */}
        {/* <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleGoToResourceClick}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg focus:outline-none focus:shadow-outline transition-colors duration-150"
        >
          访问资源
        </a> */}

        {/* 收藏按钮 */}
        <div className="flex items-center">
          <FavoriteButton
            resourceId={resource._id}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">收藏</span>
        </div>

        {isUploader && (
          <div className="flex space-x-3">
            <Link
              href={`/resources/${resource._id}/edit`}
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              编辑资源
            </Link>
            <button
              onClick={handleDelete}
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              删除资源
            </button>
          </div>
        )}
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
            <p className="text-xl text-gray-600 dark:text-gray-400">正在加载资源详情...</p>
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
    <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
            <Link href="/resources" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                &larr; 返回资源列表
            </Link>
        </div>
        <ResourceDetailView resource={resource} currentUserId={currentUser?._id} token={token} router={router} />

        {/* 资源评分 */}
        <div className="mt-10">
          <ResourceRating
            resourceId={resource._id}
            onRatingChange={(newRating) => {
              // 更新当前页面显示的资源评分
              setResource(prev => prev ? {
                ...prev,
                rating: newRating,
                ratingCount: (prev.ratingCount || 0) + 1
              } : prev);
            }}
          />
        </div>

        {/* 相关资源 */}
        <div className="mt-10">
          <RelatedResources
            currentResourceId={resource._id}
            category={(() => {
              if (!resource.category) return undefined;
              if (typeof resource.category === 'string') return resource.category;
              if (typeof resource.category === 'object' && 'name' in resource.category && resource.category.name) return resource.category.name;
              return undefined;
            })()}
            tags={resource.tags}
          />
        </div>

        {/* 评论区 */}
        <div className="mt-10">
          <CommentSection resourceId={resource._id} />
        </div>
    </div>
  );
}

// Using toast for error notifications requires react-hot-toast to be set up in layout
// import toast from 'react-hot-toast'; // Already imported at the top