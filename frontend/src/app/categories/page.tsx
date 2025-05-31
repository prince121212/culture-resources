'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, Category } from '@/services/category.service';
import { ApiError } from '@/services/auth.service';
import { FolderIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        let errorMessage = '获取分类失败';
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

    fetchCategories();
  }, []);

  // 获取分类对应的emoji图标
  const getCategoryEmoji = (categoryName: string) => {
    if (categoryName.includes('文学') || categoryName.includes('书')) return '📚';
    if (categoryName.includes('艺术') || categoryName.includes('设计')) return '🎨';
    if (categoryName.includes('音乐') || categoryName.includes('舞蹈')) return '🎵';
    if (categoryName.includes('历史') || categoryName.includes('文化')) return '🏛️';
    if (categoryName.includes('戏曲') || categoryName.includes('表演')) return '🎭';
    if (categoryName.includes('教育') || categoryName.includes('资料')) return '📖';
    return '📁'; // 默认图标
  };

  // 获取分类对应的背景颜色
  const getCategoryBgColor = (categoryName: string) => {
    if (categoryName.includes('文学') || categoryName.includes('书')) return 'bg-red-100 dark:bg-red-900';
    if (categoryName.includes('艺术') || categoryName.includes('设计')) return 'bg-blue-100 dark:bg-blue-900';
    if (categoryName.includes('音乐') || categoryName.includes('舞蹈')) return 'bg-green-100 dark:bg-green-900';
    if (categoryName.includes('历史') || categoryName.includes('文化')) return 'bg-yellow-100 dark:bg-yellow-900';
    if (categoryName.includes('戏曲') || categoryName.includes('表演')) return 'bg-purple-100 dark:bg-purple-900';
    if (categoryName.includes('教育') || categoryName.includes('资料')) return 'bg-indigo-100 dark:bg-indigo-900';
    return 'bg-gray-100 dark:bg-gray-900'; // 默认颜色
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">资源分类</h1>
          <p className="text-gray-600 dark:text-gray-400">浏览所有资源分类，快速找到您感兴趣的内容</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {categories.map((category) => {
              const emoji = getCategoryEmoji(category.name);
              const bgColor = getCategoryBgColor(category.name);
              return (
                <Link
                  key={category._id}
                  href={`/resources?category=${encodeURIComponent(category.name)}`}
                  className="card p-6 text-center hover:shadow-lg transition-all group"
                >
                  <div className={`w-16 h-16 ${bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-3xl">{emoji}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{category.description || '暂无描述'}</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FolderIcon className="w-4 h-4" />
                    <span>{category.resourceCount || 0} 个资源</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <InformationCircleIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">暂无分类</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">系统中还没有创建任何分类，请稍后再查看。</p>
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
