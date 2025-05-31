"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // 调试输出用户信息
    console.log("User info:", user);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Is loading:", isLoading);
    console.log("User role:", user?.role);

    // 检查用户是否已认证且是管理员
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error('请先登录');
        router.push('/auth/login');
        return;
      }

      if (user && user.role !== 'admin') {
        toast.error('您需要管理员权限才能访问此页面');
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 如果未认证或非管理员，返回空内容，让上面的useEffect处理跳转
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null;
  }

  // 继续显示管理后台的正常内容
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className={`bg-indigo-800 text-white transition-all duration-500 ease-in-out relative overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex flex-col items-center">
          <div className="w-full text-center">
            <h2 className="text-xl font-semibold transition-all duration-500 whitespace-nowrap overflow-hidden">
              {isSidebarOpen ? "管理后台" : "管理"}
            </h2>
          </div>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2">
            <Link href="/admin/dashboard" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>仪表盘</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/resources" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>资源管理</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/users" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>用户管理</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/reviews" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>内容审核</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/categories" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>分类管理</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/tags" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>标签管理</span>
            </Link>
          </div>
          <div className="px-4 py-2">
            <Link href="/admin/settings" className={`flex items-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`ml-3 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>系统设置</span>
            </Link>
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <Link href="/" className={`
            inline-flex items-center px-4 py-2 bg-gray-700/70 backdrop-blur-sm rounded-full shadow-sm 
            text-white hover:bg-gray-600/70 transition-all duration-300 font-medium
            ${isSidebarOpen ? 'justify-start w-auto' : 'justify-center w-12 h-12 p-0 mx-auto'}
          `}>
            <svg className={`${isSidebarOpen ? 'w-4 h-4 mr-2' : 'w-5 h-5'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'} whitespace-nowrap overflow-hidden`}>返回前台</span>
          </Link>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm relative">
          {/* 收缩按钮 */}
          <button 
            onClick={toggleSidebar} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-indigo-800 text-white p-1 rounded-full shadow-md hover:bg-indigo-700 z-10"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">管理后台</h1>
            {/* 隐藏欢迎和登出信息 */}
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
