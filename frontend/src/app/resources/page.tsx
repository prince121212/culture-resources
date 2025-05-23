'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { getResources, Resource, GetResourcesParams } from '@/services/resource.service';
import { getCategories, Category } from '@/services/category.service';
import { getTags, Tag } from '@/services/tag.service';

export default function ResourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  // 状态管理
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams?.get('tags') ? searchParams.get('tags')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams?.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 数据状态
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取分类和标签数据
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('获取筛选数据失败:', error);
        // 不设置错误状态，因为这不影响主要功能
      }
    };
    
    fetchFiltersData();
  }, []);

  // 获取资源数据
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params: GetResourcesParams = {
          page: currentPage,
          limit: 9,
          keyword: searchQuery || undefined,
          category: selectedCategory || undefined,
          tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
          sortBy: sortBy === 'popular' ? 'downloadCount' : sortBy === 'rating' ? 'rating' : sortBy,
          sortOrder: sortOrder as ('asc' | 'desc')
        };
        
        const response = await getResources(params);
        setResources(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('获取资源列表失败:', error);
        setError('获取资源数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const url = `/resources?${params.toString()}`;
    router.push(url);
    
  }, [searchQuery, selectedCategory, selectedTags, sortBy, sortOrder, currentPage, router]);

  // 处理标签选择
  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
    setCurrentPage(1); // 重置页码
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    // 解析排序方式和顺序
    if (value === 'newest') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortBy('createdAt');
      setSortOrder('asc');
    } else if (value === 'popular') {
      setSortBy('downloadCount');
      setSortOrder('desc');
    } else if (value === 'downloads') {
      setSortBy('downloadCount');
      setSortOrder('desc');
    } else if (value === 'rating') {
      setSortBy('rating');
      setSortOrder('desc');
    }
    setCurrentPage(1); // 重置页码
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和上传按钮 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">资源库</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              浏览和发现社区分享的各种资源
            </p>
          </div>
          {!authIsLoading && isAuthenticated && (
            <Link
              href="/resources/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              上传新资源
            </Link>
          )}
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="搜索资源..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 筛选按钮 */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                筛选
                {isFilterOpen ? (
                  <ChevronUpIcon className="h-5 w-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 ml-2" />
                )}
              </button>

              {/* 排序选择 */}
              <select
                value={sortBy === 'createdAt' && sortOrder === 'desc' ? 'newest' : 
                       sortBy === 'createdAt' && sortOrder === 'asc' ? 'oldest' :
                       sortBy === 'downloadCount' ? 'popular' : 
                       sortBy === 'rating' ? 'rating' : 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="block w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <option value="newest">最新上传</option>
                <option value="oldest">最早上传</option>
                <option value="popular">最多浏览</option>
                <option value="downloads">最多下载</option>
                <option value="rating">最高评分</option>
              </select>
            </div>

            {/* 筛选面板 */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 分类筛选 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <button
                            key={category._id}
                            onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCategory === category.name
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无可用分类</p>
                      )}
                    </div>
                  </div>

                  {/* 标签筛选 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <button
                            key={tag._id}
                            onClick={() => handleTagToggle(tag.name)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedTags.includes(tag.name)
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无可用标签</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 资源列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Link
                  key={resource._id}
                  href={`/resources/${resource._id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{resource.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {resource.description || '暂无描述'}
                    </p>
                    <div className="flex items-center text-sm mb-3">
                      <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 rounded-md">
                        {resource.category || '未分类'}
                      </span>
                      {resource.tags && resource.tags.length > 0 && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          {resource.tags.slice(0, 2).join(', ')}
                          {resource.tags.length > 2 ? '...' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span>{resource.downloadCount || 0} 次下载</span>
                        {resource.rating && (
                          <span className="ml-3">★ {resource.rating.toFixed(1)}</span>
                        )}
                      </div>
                      <span>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页导航 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-1">暂无资源</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchQuery || selectedCategory || selectedTags.length > 0 ? 
                  '没有找到符合条件的资源，请尝试调整搜索条件。' : 
                  '暂时没有任何资源，请稍后再查看。'}
              </p>
              {!authIsLoading && isAuthenticated && (
                <Link
                  href="/resources/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  上传第一个资源
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 