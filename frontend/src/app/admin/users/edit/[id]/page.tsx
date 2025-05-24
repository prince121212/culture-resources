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
  points: number;
}

export default function EditUser() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
    points: 0,
  });
  
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
        setFormData({
          username: data.username,
          email: data.email,
          role: data.role,
          status: data.status,
          points: data.points,
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新用户信息失败');
      }

      toast.success('用户信息更新成功');
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      console.error('更新用户信息出错:', error);
      toast.error('更新用户信息失败，请稍后再试');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-2xl font-semibold">编辑用户信息</h1>
        <Link href={`/admin/users/${userId}`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          返回用户详情
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                角色
              </label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="user">普通用户</option>
                <option value="contributor">贡献者</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                状态
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="active">活跃</option>
                <option value="inactive">非活跃</option>
                <option value="banned">已禁用</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                积分
              </label>
              <input
                type="number"
                name="points"
                id="points"
                value={formData.points}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Link
              href={`/admin/users/${userId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
