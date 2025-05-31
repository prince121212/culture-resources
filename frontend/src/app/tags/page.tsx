'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTags, Tag } from '@/services/tag.service';
import { ApiError } from '@/services/auth.service';
import { TagIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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

  // 获取标签对应的颜色
  const getTagColor = (index: number) => {
    const colors = [
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800',
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">资源标签</h1>
          <p className="text-gray-600 dark:text-gray-400">通过标签快速筛选和发现相关资源</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : sortedTags.length > 0 ? (
          <div className="card p-8">
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag, index) => {
                const colorClass = getTagColor(index);
                return (
                  <Link
                    key={tag._id}
                    href={`/resources?tags=${encodeURIComponent(tag.name)}`}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md ${colorClass}`}
                  >
                    <TagIcon className="w-4 h-4 mr-2" />
                    <span>{tag.name}</span>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-30">
                      {tag.resourceCount || 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <InformationCircleIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">暂无标签</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">系统中还没有创建任何标签，请稍后再查看。</p>
              <Link
                href="/resources"
                className="btn-primary"
              >
                浏览所有资源
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
