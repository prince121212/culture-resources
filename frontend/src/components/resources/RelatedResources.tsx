'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getResources, Resource } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';

interface RelatedResourcesProps {
  currentResourceId: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

const RelatedResources: React.FC<RelatedResourcesProps> = ({
  currentResourceId,
  category,
  tags,
  limit = 3
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 辅助函数：获取分类名称
  const getCategoryName = (category: any): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  useEffect(() => {
    const fetchRelatedResources = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 构建查询参数
        const params: any = {
          limit,
          sortBy: 'downloadCount', // 按下载量排序
          sortOrder: 'desc'
        };

        // 如果有分类，添加分类筛选
        if (category) {
          params.category = category;
        }

        // 如果有标签，添加标签筛选
        if (tags && tags.length > 0) {
          params.tags = tags.join(',');
        }

        const response = await getResources(params);

        // 过滤掉当前资源
        const filteredResources = response.data.filter(
          resource => resource._id !== currentResourceId
        );

        // 如果过滤后的资源少于限制数量，可以考虑再次请求更多资源
        if (filteredResources.length < limit && response.pagination.totalResources > limit) {
          const moreParams = { ...params, limit: limit * 2 };
          const moreResponse = await getResources(moreParams);
          const moreFilteredResources = moreResponse.data.filter(
            resource => resource._id !== currentResourceId
          ).slice(0, limit);

          setResources(moreFilteredResources);
        } else {
          setResources(filteredResources.slice(0, limit));
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('获取相关资源时发生错误');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (currentResourceId) {
      fetchRelatedResources();
    }
  }, [currentResourceId, category, tags, limit]);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        正在加载相关资源...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        加载相关资源失败: {error}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        没有找到相关资源
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">相关资源</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Link
            key={resource._id}
            href={`/resources/${resource._id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="text-lg font-medium text-gray-900 dark:text-white">{resource.title}</div>
              {resource.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {getCategoryName(resource.category)}
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {resource.downloadCount} 次下载
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedResources;
