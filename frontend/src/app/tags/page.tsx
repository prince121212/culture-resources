'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTags, Tag } from '@/services/tag.service';
import { ApiError } from '@/services/auth.service';
import { HashtagIcon } from '@heroicons/react/24/outline';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTags = await getTags();
        setTags(fetchedTags);
      } catch (err) {
        let errorMessage = '获取标签失败';
        if (err instanceof ApiError) {
          errorMessage = err.response?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // 对标签按资源数量排序（如果存在）
  const sortedTags = tags.length > 0 
    ? [...tags].sort((a, b) => (b.resourceCount || 0) - (a.resourceCount || 0))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">资源标签</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : sortedTags.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4">
            {sortedTags.map((tag) => (
              <Link 
                key={tag._id} 
                href={`/resources?tags=${encodeURIComponent(tag.name)}`}
                className="group relative"
              >
                <div className="flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                  <HashtagIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mr-2" />
                  <span className="text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    {tag.name}
                  </span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 group-hover:text-indigo-800 dark:group-hover:text-indigo-200">
                    {tag.resourceCount || 0}
                  </span>
                </div>
                
                {/* 悬停提示 */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  查看 {tag.resourceCount || 0} 个相关资源
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <HashtagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-1">暂无标签</h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              还没有任何标签被创建，请稍后再查看。
            </p>
          </div>
        </div>
      )}
      
      {/* 删除热门标签组合部分，因为这也是模拟数据 */}
    </div>
  );
}
