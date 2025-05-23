"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback or for initial render before useEffect runs.
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-gray-700">需要认证，正在跳转到登录页...</p>
        </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('已成功登出！');
    router.push('/auth/login');
  };

  // User is authenticated
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">仪表盘</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            登出
          </button>
        </div>
      </header>
      
      <main className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">欢迎回来, {user?.username || '用户'}!</h2>
          <p className="text-gray-600">您的邮箱是: {user?.email}</p>
          <p className="text-gray-600">您的角色是: {user?.role}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">快速导航</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-indigo-600 hover:text-indigo-800">我的资源</a></li>
              <li><a href="#" className="text-indigo-600 hover:text-indigo-800">上传新资源</a></li>
              <li><a href="#" className="text-indigo-600 hover:text-indigo-800">账户设置</a></li>
            </ul>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">最近活动</h3>
            <p className="text-gray-500 italic">暂无最近活动。</p>
          </div>
        </div>
      </main>
    </div>
  );
} 