'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  points: number;
  avatar: string;
}

interface UserStats {
  uploads: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  downloads: number;
  comments: number;
  favorites: number;
  ratings: number;
}

export default function UserDetail() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }

        const data = await response.json();
        setUser(data);

        // 获取用户统计数据
        const statsResponse = await fetch(`http://localhost:5001/api/admin/users/${userId}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('获取用户信息出错:', error);
        toast.error('获取用户信息失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchUserData();
    }
  }, [token, userId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setStatusLoading(true);
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新用户状态失败');
      }

      const updatedUser = await response.json();
      setUser(updatedUser.data);
      toast.success('用户状态更新成功');
    } catch (error) {
      console.error('更新用户状态出错:', error);
      toast.error('更新用户状态失败，请稍后再试');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">用户不存在</h2>
        <p className="mt-2 text-gray-500">找不到该用户信息</p>
        <Link href="/admin/users" className="mt-6 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          返回用户列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">用户详情</h1>
        <Link href="/admin/users" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          返回用户列表
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user._id}/avatar`}
                alt={user.username}
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'contributor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'}`}>
                  {user.role === 'admin' ? '管理员' :
                   user.role === 'contributor' ? '贡献者' : '普通用户'}
                </span>
                <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {user.status === 'active' ? '活跃' :
                   user.status === 'inactive' ? '非活跃' : '已禁用'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">用户信息</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">注册时间</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">最后登录</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(user.lastLogin)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">最后更新</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">积分</p>
                <p className="mt-1 text-sm text-gray-900">{user.points}</p>
              </div>
            </div>
          </div>

          {stats && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">用户活动统计</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">上传资源</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.uploads.total}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="text-green-600">{stats.uploads.approved} 已通过</span> ·
                    <span className="text-yellow-600 ml-1">{stats.uploads.pending} 待审核</span> ·
                    <span className="text-red-600 ml-1">{stats.uploads.rejected} 已拒绝</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">下载次数</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.downloads}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">评论数</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.comments}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">收藏数</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.favorites}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">评分数</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.ratings}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">用户管理</h3>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => router.push(`/admin/users/edit/${userId}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                编辑用户信息
              </button>

              {user.status === 'active' ? (
                <button
                  onClick={() => handleStatusChange('banned')}
                  disabled={statusLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {statusLoading ? '处理中...' : '禁用用户'}
                </button>
              ) : user.status === 'banned' ? (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={statusLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {statusLoading ? '处理中...' : '解除禁用'}
                </button>
              ) : null}

              <Link
                href={`/admin/users/${userId}/resources`}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                查看上传资源
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
