'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { getResources, Resource, PaginatedResourcesResponse } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import { getUserStats, getUserFavorites } from '@/services/user.service';
import { getUserRatings, ResourceRating } from '@/services/rating.service';

// 用户统计数据类型
interface UserStats {
  uploads: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  ratings: {
    given: number;
    averageGiven: number;
    received: {
      total: number;
      average: number;
    };
  };
  comments: {
    posted: number;
    received: number;
  };
  favorites: {
    count: number;
  };
}

// 收藏类型已移除，现在直接使用Resource数组

// 评分类型
interface Rating {
  _id: string;
  resource: Resource;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();

  // 统计数据状态
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 我的上传状态
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [uploadsError, setUploadsError] = useState<string | null>(null);

  // 我的收藏状态
  const [favorites, setFavorites] = useState<Resource[]>([]); // 现在直接是Resource数组
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // 评分历史状态
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  // 筛选状态
  const [uploadStatusFilter, setUploadStatusFilter] = useState<string>('all');
  const [favoriteCategoryFilter, setFavoriteCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // 当前显示的内容区域
  const [activeSection, setActiveSection] = useState<string>('overview');

  // 获取数据的函数
  const fetchUserUploads = useCallback(async () => {
    if (!currentUser?._id || !token) return;

    setIsLoadingUploads(true);
    setUploadsError(null);
    try {
      const response: PaginatedResourcesResponse = await getResources({
        uploaderId: currentUser._id,
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50,
      });
      setUserResources(response.data);
    } catch (err) {
      let errorMessage = '获取您的资源失败';
      if (err instanceof ApiError) {
        errorMessage = err.response?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setUploadsError(errorMessage);
      toast.error(errorMessage);
      setUserResources([]);
    } finally {
      setIsLoadingUploads(false);
    }
  }, [currentUser?._id, token]);

  const fetchUserFavorites = useCallback(async () => {
    if (!currentUser?._id || !token) return;

    setIsLoadingFavorites(true);
    setFavoritesError(null);
    try {
      const favoritesData = await getUserFavorites(currentUser._id, token);
      setFavorites(favoritesData);
    } catch (err) {
      let errorMessage = '获取收藏失败';
      if (err instanceof ApiError) {
        errorMessage = err.response?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setFavoritesError(errorMessage);
      toast.error(errorMessage);
      setFavorites([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [currentUser?._id, token]);

  const fetchUserRatings = useCallback(async () => {
    if (!currentUser?._id || !token) return;

    setIsLoadingRatings(true);
    setRatingsError(null);
    try {
      const ratingsResponse = await getUserRatings(currentUser._id, token, { limit: 50 });
      // 转换数据格式以匹配现有的Rating接口
      const formattedRatings: Rating[] = ratingsResponse.data.map((rating: ResourceRating) => ({
        _id: rating._id,
        resource: typeof rating.resource === 'string' ? {
          _id: rating.resource,
          title: '未知资源',
          description: '',
          link: '',
          category: '',
          tags: [],
          uploader: { _id: '', username: '' },
          createdAt: rating.createdAt,
          updatedAt: rating.updatedAt,
          downloadCount: 0
        } : rating.resource as Resource,
        rating: rating.rating,
        comment: '', // ResourceRating 没有 comment 字段，使用空字符串
        createdAt: rating.createdAt
      }));
      setRatings(formattedRatings);
    } catch (err) {
      let errorMessage = '获取评分历史失败';
      if (err instanceof ApiError) {
        errorMessage = err.response?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setRatingsError(errorMessage);
      toast.error(errorMessage);
      setRatings([]);
    } finally {
      setIsLoadingRatings(false);
    }
  }, [currentUser?._id, token]);

  // 移除模拟数据，现在使用真实数据

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以查看个人资料');
      router.replace('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, authLoading, router]);

  // 获取用户统计数据
  useEffect(() => {
    if (currentUser?._id && token) {
      const fetchUserStats = async () => {
        setIsLoadingStats(true);
        setStatsError(null);
        try {
          const userStats = await getUserStats(currentUser._id, token);
          setStats(userStats);
        } catch (err) {
          console.error('获取用户统计数据失败:', err);
          setStatsError('获取用户统计数据失败');
          toast.error('获取用户统计数据失败');
        } finally {
          setIsLoadingStats(false);
        }
      };
      fetchUserStats();

      // 获取其他数据
      fetchUserUploads();
      fetchUserFavorites();
      fetchUserRatings();
    }
  }, [currentUser, token, fetchUserUploads, fetchUserFavorites, fetchUserRatings]);

  // 辅助函数
  const getStatusBadge = (status: string) => {
    const badgeStyle = {
      width: 64,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: 'oklch(0.448 0.119 151.328)',
      background: 'oklch(0.962 0.044 156.743)',
      boxSizing: 'border-box' as const,
      padding: 0,
    };
    switch (status) {
      case 'approved':
        return <span className="rounded-full" style={badgeStyle}>已审核</span>;
      case 'pending':
        return <span className="rounded-full" style={{...badgeStyle, color: '#b45309', background: '#fef3c7'}}>待审核</span>;
      case 'rejected':
        return <span className="rounded-full" style={{...badgeStyle, color: '#b91c1c', background: '#fee2e2'}}>已拒绝</span>;
      default:
        return <span className="rounded-full" style={{...badgeStyle, color: '#374151', background: '#f3f4f6'}}>未知</span>;
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (authLoading || !isAuthenticated || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载个人资料...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :root {
          --bg-primary: #f4f1e8;
          --bg-card: #faf8f3;
          --text-primary: #2d2a24;
          --text-secondary: #5a5650;
          --accent: #8b4513;
          --border: #d4c4a8;
        }
        .dark {
          --bg-primary: #0a0a0a;
          --bg-card: #18181b;
          --text-primary: #ededed;
          --text-secondary: #9ca3af;
          --accent: #6366f1;
          --border: #27272a;
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-8" style={{ backgroundColor: 'var(--bg-primary, #f4f1e8)' }}>
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary, #2d2a24)' }}>个人中心</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <div
            className="shadow-lg rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
            style={{
              backgroundColor: 'var(--bg-card, #faf8f3)',
              border: '1px solid var(--border, #d4c4a8)'
            }}
          >
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto mb-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar?t=${Date.now()}`}
                  alt="用户头像"
                  width={80}
                  height={80}
                  className="object-cover"
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
              <h2 className="text-xl font-bold dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>{currentUser.username}</h2>
              <p className="dark:text-gray-400" style={{ color: 'var(--text-secondary, #5a5650)' }}>{currentUser.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'overview'
                    ? 'font-medium dark:bg-amber-900/20 dark:text-amber-300'
                    : 'dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: activeSection === 'overview' ? 'rgba(139, 69, 19, 0.08)' : 'transparent',
                  color: activeSection === 'overview' ? 'var(--accent, #8b4513)' : 'var(--text-secondary, #5a5650)'
                }}
              >
                个人信息
              </button>
              <button
                onClick={() => setActiveSection('uploads')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'uploads'
                    ? 'font-medium dark:bg-amber-900/20 dark:text-amber-300'
                    : 'dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: activeSection === 'uploads' ? 'rgba(139, 69, 19, 0.08)' : 'transparent',
                  color: activeSection === 'uploads' ? 'var(--accent, #8b4513)' : 'var(--text-secondary, #5a5650)'
                }}
              >
                我的上传
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'favorites'
                    ? 'font-medium dark:bg-amber-900/20 dark:text-amber-300'
                    : 'dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: activeSection === 'favorites' ? 'rgba(139, 69, 19, 0.08)' : 'transparent',
                  color: activeSection === 'favorites' ? 'var(--accent, #8b4513)' : 'var(--text-secondary, #5a5650)'
                }}
              >
                我的收藏
              </button>
              <button
                onClick={() => setActiveSection('ratings')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'ratings'
                    ? 'font-medium dark:bg-amber-900/20 dark:text-amber-300'
                    : 'dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: activeSection === 'ratings' ? 'rgba(139, 69, 19, 0.08)' : 'transparent',
                  color: activeSection === 'ratings' ? 'var(--accent, #8b4513)' : 'var(--text-secondary, #5a5650)'
                }}
              >
                评分历史
              </button>
              <Link
                href="/profile/edit"
                className="block w-full text-left px-4 py-2 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
                style={{ color: 'var(--text-secondary, #5a5650)' }}
              >
                账户设置
              </Link>
            </nav>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="lg:col-span-3">
          {/* 统计卡片 */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 animate-pulse border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : statsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
              <p className="text-red-700 dark:text-red-400">{statsError}</p>
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                className="shadow-lg rounded-lg p-6 text-center dark:bg-gray-800 dark:border-gray-700"
                style={{
                  backgroundColor: 'var(--bg-card, #faf8f3)',
                  border: '1px solid var(--border, #d4c4a8)'
                }}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>{stats.uploads.total}</h3>
                <p className="dark:text-gray-400" style={{ color: 'var(--text-secondary, #5a5650)' }}>已上传</p>
              </div>
              <div
                className="shadow-lg rounded-lg p-6 text-center dark:bg-gray-800 dark:border-gray-700"
                style={{
                  backgroundColor: 'var(--bg-card, #faf8f3)',
                  border: '1px solid var(--border, #d4c4a8)'
                }}
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>{stats.favorites.count}</h3>
                <p className="dark:text-gray-400" style={{ color: 'var(--text-secondary, #5a5650)' }}>已收藏</p>
              </div>
              <div
                className="shadow-lg rounded-lg p-6 text-center dark:bg-gray-800 dark:border-gray-700"
                style={{
                  backgroundColor: 'var(--bg-card, #faf8f3)',
                  border: '1px solid var(--border, #d4c4a8)'
                }}
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>{stats.ratings.given}</h3>
                <p className="dark:text-gray-400" style={{ color: 'var(--text-secondary, #5a5650)' }}>评分历史</p>
              </div>
            </div>
          )}

          {/* 动态内容区域 */}
          {activeSection === 'overview' && (
            <div
              className="shadow-lg rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
              style={{
                backgroundColor: 'var(--bg-card, #faf8f3)',
                border: '1px solid var(--border, #d4c4a8)'
              }}
            >
              <h2 className="text-xl font-bold mb-4 dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>个人信息</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300" style={{ color: 'var(--text-secondary, #5a5650)' }}>姓名</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      style={{
                        border: '1px solid var(--border, #d4c4a8)',
                        backgroundColor: 'var(--bg-card, #faf8f3)',
                        color: 'var(--text-primary, #2d2a24)'
                      }}
                      value={currentUser.username}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300" style={{ color: 'var(--text-secondary, #5a5650)' }}>邮箱</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      style={{
                        border: '1px solid var(--border, #d4c4a8)',
                        backgroundColor: 'var(--bg-card, #faf8f3)',
                        color: 'var(--text-primary, #2d2a24)'
                      }}
                      value={currentUser.email}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300" style={{ color: 'var(--text-secondary, #5a5650)' }}>个人简介</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                    style={{
                      border: '1px solid var(--border, #d4c4a8)',
                      backgroundColor: 'var(--bg-card, #faf8f3)',
                      color: 'var(--text-primary, #2d2a24)'
                    }}
                    placeholder="介绍一下自己..."
                    readOnly
                  />
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/profile/edit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    编辑资料
                  </Link>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'uploads' && (
            <div
              className="shadow-lg rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
              style={{
                backgroundColor: 'var(--bg-card, #faf8f3)',
                border: '1px solid var(--border, #d4c4a8)'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>我的上传</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={uploadStatusFilter}
                    onChange={(e) => setUploadStatusFilter(e.target.value)}
                  >
                    <option value="all">全部状态</option>
                    <option value="approved">已审核</option>
                    <option value="pending">待审核</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                  <Link
                    href="/resources/new"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    上传新资源
                  </Link>
                </div>
              </div>

              {isLoadingUploads ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">正在加载您的资源...</div>
              ) : uploadsError ? (
                <div className="text-center text-red-500 py-4">错误: {uploadsError}</div>
              ) : userResources.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">您还没有上传任何资源</p>
                  <Link
                    href="/resources/new"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    上传您的第一个资源
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {userResources.map(resource => (
                    <div
                      key={resource._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        width: '100%',
                        minHeight: 58.8,
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 5.6
                      }}
                      onClick={() => router.push(`/resources/${resource._id}`)}
                    >
                      <div className="flex items-center justify-between mb-3" style={{height: '100%'}}>
                        <h3
                          className="font-semibold text-lg text-gray-800 dark:text-white text-left"
                          style={{
                            flex: '0 1 80%',
                            maxWidth: '80%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%'
                          }}
                        >
                          {resource.title}
                        </h3>
                        <div style={{flex: 'none'}}>
                          {getStatusBadge((resource as { status?: string }).status || 'pending')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-1" style={{ fontSize: 11, lineHeight: 1.3, minHeight: 20 }}>
                        <div className="text-[11px] text-gray-500" style={{ lineHeight: 1.3 }}>
                          上传时间：{formatDate(resource.createdAt)}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="rounded text-[11px] font-medium transition-colors"
                            style={{
                              width: 44,
                              height: 18,
                              minWidth: 44,
                              minHeight: 18,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1.3,
                              border: '1px solid #d97706',
                              color: '#fff',
                              background: '#d97706',
                            }}
                            onClick={e => { e.stopPropagation(); /* 编辑逻辑 */ }}
                          >编辑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'favorites' && (
            <div
              className="shadow-lg rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
              style={{
                backgroundColor: 'var(--bg-card, #faf8f3)',
                border: '1px solid var(--border, #d4c4a8)'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>我的收藏</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={favoriteCategoryFilter}
                    onChange={(e) => setFavoriteCategoryFilter(e.target.value)}
                  >
                    <option value="all">全部分类</option>
                    <option value="文学作品">文学作品</option>
                    <option value="艺术设计">艺术设计</option>
                    <option value="音乐舞蹈">音乐舞蹈</option>
                    <option value="历史文化">历史文化</option>
                  </select>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    清空收藏
                  </button>
                </div>
              </div>

              {isLoadingFavorites ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">正在加载收藏...</div>
              ) : favoritesError ? (
                <div className="text-center text-red-500 py-4">错误: {favoritesError}</div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">您还没有收藏任何资源</p>
                  <Link
                    href="/resources"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    去发现资源
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {favorites.map(resource => (
                    <div
                      key={resource._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        width: '100%',
                        minHeight: 58.8,
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 5.6
                      }}
                      onClick={() => router.push(`/resources/${resource._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3
                          className="font-semibold text-lg text-gray-800 dark:text-white text-left"
                          style={{
                            flex: '0 1 80%',
                            maxWidth: '80%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%'
                          }}
                        >
                          {resource.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'ratings' && (
            <div
              className="shadow-lg rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
              style={{
                backgroundColor: 'var(--bg-card, #faf8f3)',
                border: '1px solid var(--border, #d4c4a8)'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white" style={{ color: 'var(--text-primary, #2d2a24)' }}>评分历史</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="all">全部评分</option>
                    <option value="5">5星</option>
                    <option value="4">4星</option>
                    <option value="3">3星</option>
                    <option value="2">2星</option>
                    <option value="1">1星</option>
                  </select>
                </div>
              </div>

              {isLoadingRatings ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : ratingsError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                  <p className="text-red-700 dark:text-red-400">{ratingsError}</p>
                </div>
              ) : ratings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">您还没有评分任何资源</p>
                  <Link
                    href="/resources"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    去发现资源
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map(rating => (
                    <div
                      key={rating._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                      style={{
                        padding: '12.8px',
                        minHeight: '80px',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1" style={{paddingTop: 0, paddingBottom: 0, marginBottom: 0}}>
                          <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">{rating.resource.title}</h3>
                          <div className="flex items-center space-x-3 mb-2" style={{margin: 0}}>
                            <div className="text-yellow-400">
                              {getRatingStars(rating.rating)}
                            </div>
                            <span className="text-sm text-gray-500">您的评分：{rating.rating}星</span>
                            <span className="text-sm text-gray-500">{formatDate(rating.createdAt)}</span>
                          </div>
                          {rating.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link
                            href={`/resources/${rating.resource._id}`}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors"
                          >
                            查看资源
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}