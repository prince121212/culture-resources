'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, BookOpenIcon, FolderIcon, DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getResources, Resource } from '@/services/resource.service';
import { getCategories, Category } from '@/services/category.service';
import { getTags } from '@/services/tag.service';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    resourceCount: 0,
    categoryCount: 0,
    tagCount: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotResources, setHotResources] = useState<Resource[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 获取统计数据
        const [resourcesResponse, categoriesData, tags] = await Promise.all([
          getResources({ limit: 1 }), // 只获取第一页，一个资源，用于获取总数
          getCategories(),
          getTags(),
        ]);

        setStats({
          resourceCount: resourcesResponse.pagination.totalResources,
          categoryCount: categoriesData.length,
          tagCount: tags.length,
        });

        // 设置分类数据
        setCategories(categoriesData);

        // 获取热门资源
        const hotResourcesResponse = await getResources({ 
          page: 1, 
          limit: 3,
          sortBy: 'downloadCount',
          sortOrder: 'desc'
        });
        setHotResources(hotResourcesResponse.data);

        // 获取最新资源
        const latestResourcesResponse = await getResources({
          page: 1,
          limit: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        setLatestResources(latestResourcesResponse.data);
      } catch (error) {
        console.error('获取数据失败:', error);
        setError('获取数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取分类对应的图标
  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('书') || categoryName.includes('学')) return BookOpenIcon;
    if (categoryName.includes('视频') || categoryName.includes('影')) return DocumentTextIcon;
    return FolderIcon; // 默认图标
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 搜索区域 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              欢迎来到文化资源站
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              发现、分享、学习优质文化资源
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="搜索资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      ) : (
        <>
          {/* 统计信息 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">资源总数</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.resourceCount}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">分类总数</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.categoryCount}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">标签总数</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.tagCount}</div>
              </div>
            </div>
          </div>

          {/* 分类导航 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">资源分类</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {categories.slice(0, 4).map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <Link
                      key={category._id}
                      href={`/resources?category=${encodeURIComponent(category.name)}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center">
                        <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{category.resourceCount || 0} 个资源</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <FolderIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-500">暂无分类数据，请稍后再查看。</p>
                </div>
              </div>
            )}
          </div>

          {/* 热门资源 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">热门资源</h2>
              <Link
                href="/resources?sortBy=downloadCount&sortOrder=desc"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                查看更多 &rarr;
              </Link>
            </div>
            {hotResources.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotResources.map((resource) => (
                  <Link
                    key={resource._id}
                    href={`/resources/${resource._id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{resource.title}</div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{resource.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {resource.category}
                        </span>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{resource.downloadCount || 0} 次下载</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <InformationCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-500">暂无热门资源，请稍后再查看。</p>
                </div>
              </div>
            )}
          </div>

          {/* 最新资源 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">最新资源</h2>
              <Link
                href="/resources?sortBy=createdAt&sortOrder=desc"
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                查看更多 &rarr;
              </Link>
            </div>
            {latestResources.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {latestResources.map((resource) => (
                    <li key={resource._id}>
                      <Link
                        href={`/resources/${resource._id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-medium text-gray-900 dark:text-white">{resource.title}</div>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{resource.description}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {resource.category}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(resource.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <InformationCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-500">暂无最新资源，请稍后再查看。</p>
                </div>
              </div>
            )}
          </div>

          {/* 上传资源号召性按钮 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
                分享您的知识和资源
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 mb-6 max-w-2xl mx-auto">
                通过上传资源，您可以帮助更多人获取知识，同时也能获得社区的认可和支持。
              </p>
              <Link
                href="/resources/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                上传资源
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
