'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, BookOpenIcon, FolderIcon, DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getResources, Resource } from '@/services/resource.service';
import { getCategories, Category } from '@/services/category.service';
import { getTags } from '@/services/tag.service';
import FavoriteButton from '@/components/resources/FavoriteButton';

export default function Home() {
  const router = useRouter();
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

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/resources');
    }
  };

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

  // 辅助函数：获取分类名称
  const getCategoryName = (category: any): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  return (
    <div className="min-h-screen">
      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎横幅 */}
        <div className="card p-12 text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">欢迎来到文化资源站</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">发现、分享、学习优质文化资源</p>

          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="搜索您感兴趣的资源..."
                className="input-field w-full pl-6 pr-20 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-6">搜索</button>
            </form>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            {/* 分类导航 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">浏览分类</h2>
                <Link
                  href="/categories"
                  className="text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                >
                  <span>查看更多</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              {categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.slice(0, 6).map((category) => {
                    const emoji = getCategoryEmoji(category.name);
                    const bgColor = getCategoryBgColor(category.name);
                    return (
                      <Link
                        key={category._id}
                        href={`/resources?category=${encodeURIComponent(category.name)}`}
                        className="card p-4 text-center hover:shadow-lg transition-all"
                      >
                        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <span className="text-2xl">{emoji}</span>
                        </div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.resourceCount || 0} 个资源</p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <FolderIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-500">暂无分类数据，请稍后再查看。</p>
                  </div>
                </div>
              )}
            </div>

            {/* 热门资源 */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">热门资源</h2>
                <Link
                  href="/resources?sortBy=downloadCount&sortOrder=desc"
                  className="text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                >
                  <span>查看更多</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            {hotResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotResources.map((resource) => (
                  <div key={resource._id} className="card p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <FavoriteButton
                        resourceId={resource._id}
                        initialIsFavorite={resource.isFavorite}
                        className="p-1"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{resource.description || '暂无描述'}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="rating-stars">★★★★★</div>
                        <span className="text-sm text-gray-500">
                          {resource.rating ? resource.rating.toFixed(1) : '0'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">访问 {resource.downloadCount || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="tag">{getCategoryName(resource.category)}</span>
                      {resource.tags && resource.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {typeof resource.uploader === 'object' ? (
                          <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
                            {resource.uploader.username ? resource.uploader.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-medium">
                            U
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
                        </span>
                      </div>
                      <Link href={`/resources/${resource._id}`} className="btn-primary text-sm px-4 py-2">访问资源</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <InformationCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-500">暂无热门资源，请稍后再查看。</p>
                </div>
              </div>
            )}
          </div>

            {/* 最新资源 */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">最新资源</h2>
                <Link
                  href="/resources?sortBy=createdAt&sortOrder=desc"
                  className="text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                >
                  <span>查看更多</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
              {latestResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestResources.map((resource) => (
                    <div key={resource._id} className="card p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{resource.title}</h3>
                        <FavoriteButton
                          resourceId={resource._id}
                          initialIsFavorite={resource.isFavorite}
                          className="p-1"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{resource.description || '暂无描述'}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="rating-stars">★★★★★</div>
                          <span className="text-sm text-gray-500">
                            {resource.rating ? resource.rating.toFixed(1) : '0'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">访问 {resource.downloadCount || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        <span className="tag">{getCategoryName(resource.category)}</span>
                        {resource.tags && resource.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {typeof resource.uploader === 'object' ? (
                            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
                              {resource.uploader.username ? resource.uploader.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-medium">
                              U
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
                          </span>
                        </div>
                        <Link href={`/resources/${resource._id}`} className="btn-primary text-sm px-4 py-2">访问资源</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-500">暂无最新资源，请稍后再查看。</p>
                  </div>
                </div>
              )}
            </div>

            {/* 分享知识和资源区块 */}
            <div className="mt-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">分享您的知识和资源</h2>
              <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
                通过上传资源，您可以让更多学人获取知识，同时也能获得社区的认可和支持。
              </p>
              <Link
                href="/resources/new"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-block"
              >
                上传资源
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
