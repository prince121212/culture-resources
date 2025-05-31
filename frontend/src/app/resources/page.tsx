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
import ResourceCard from '@/components/resources/ResourceCard';
import FavoriteButton from '@/components/resources/FavoriteButton';

export default function ResourcesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, token, isAuthenticated, isLoading: authIsLoading } = useAuth();

  // 状态管理
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [searchInput, setSearchInput] = useState(searchParams?.get('q') || ''); // 临时搜索输入
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

  // 同步搜索输入框和搜索查询
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

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

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1); // 重置页码
  };

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

  // 辅助函数：获取分类名称
  const getCategoryName = (category: any): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和上传按钮 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">资源库</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              浏览和发现社区分享的各种资源
            </p>
          </div>
          {!authIsLoading && isAuthenticated && (
            <Link
              href="/resources/new"
              className="btn-primary"
            >
              上传新资源
            </Link>
          )}
        </div>

        {/* 筛选和搜索栏 */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="搜索资源..."
                  className="input-field w-full pl-6"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </form>
            </div>

            {/* 分类筛选 */}
            <div className="relative">
              <select 
                className="input-field pr-10"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序 */}
            <div className="relative">
              <select
                value={sortBy === 'createdAt' && sortOrder === 'desc' ? 'newest' :
                       sortBy === 'createdAt' && sortOrder === 'asc' ? 'oldest' :
                       sortBy === 'downloadCount' ? 'popular' :
                       sortBy === 'rating' ? 'rating' : 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-field pr-10"
              >
                <option value="newest">最新上传</option>
                <option value="oldest">最早上传</option>
                <option value="popular">最多下载</option>
                <option value="downloads">最多下载</option>
                <option value="rating">评分最高</option>
              </select>
            </div>

            <button 
              type="submit" 
              onClick={handleSearch}
              className="btn-primary"
            >
              搜索
            </button>
          </div>
          
          {/* 已选筛选条件 */}
          {(searchQuery || selectedCategory || selectedTags.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">已选条件:</span>
              
              {searchQuery && (
                <div className="inline-flex items-center pl-2.5 pr-0 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs leading-5 h-6">
                  <span className="mr-auto">关键词: {searchQuery}</span>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchInput('');
                      setCurrentPage(1);
                    }}
                    className="text-amber-800 hover:text-amber-900 w-6 flex items-center justify-center !min-w-0 !min-h-0 !h-6 tag-delete-btn"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
              
              {selectedCategory && (
                <div className="inline-flex items-center pl-2.5 pr-0 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs leading-5 h-6">
                  <span className="mr-auto">分类: {categories.find(c => c._id === selectedCategory)?.name || selectedCategory}</span>
                  <button 
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className="text-blue-800 hover:text-blue-900 w-6 flex items-center justify-center !min-w-0 !min-h-0 !h-6 tag-delete-btn"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
              
              {selectedTags.length > 0 && selectedTags.map(tag => (
                <div key={tag} className="inline-flex items-center pl-2.5 pr-0 py-0.5 bg-green-100 text-green-800 rounded-full text-xs leading-5 h-6">
                  <span className="mr-auto">标签: {tag}</span>
                  <button 
                    onClick={() => handleTagToggle(tag)}
                    className="text-green-800 hover:text-green-900 w-6 flex items-center justify-center !min-w-0 !min-h-0 !h-6 tag-delete-btn"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                  setSelectedCategory('');
                  setSelectedTags([]);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                清除全部
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard 
                  key={resource._id}
                  resource={resource}
                  currentUserId={currentUser?._id}
                  token={token}
                  showFavoriteButton={true}
                  onResourceDeleted={() => {
                    // 重新获取资源列表
                    const fetchResources = async () => {
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
                      }
                    };
                    fetchResources();
                  }}
                />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    上一页
                  </button>
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-md">{currentPage}</button>
                  <span className="px-3 py-2 text-gray-500">/ {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card p-8 text-center">
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
                  className="btn-primary"
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