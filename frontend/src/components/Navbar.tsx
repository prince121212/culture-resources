'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  FolderIcon,
  TagIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 组件挂载后执行
  useEffect(() => {
    setMounted(true);

    try {
      // 检查本地存储中是否有用户主题偏好设置
      const savedTheme = localStorage.getItem('theme');
      console.log('当前保存的主题:', savedTheme);

      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
        console.log('应用深色主题');
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
        console.log('应用浅色主题');
      } else {
        // 如果没有保存的偏好，则根据系统主题
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
          console.log('根据系统偏好应用深色主题');
        } else {
          console.log('根据系统偏好应用浅色主题');
        }
        // 保存初始主题到localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('主题设置出错:', error);
    }
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isUserDropdownOpen, isMobileMenuOpen]);

  // 切换暗色/亮色模式
  const toggleDarkMode = () => {
    try {
      const newDarkMode = !isDarkMode;
      console.log('切换主题:', newDarkMode ? 'dark' : 'light');
      setIsDarkMode(newDarkMode);

      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.error('切换主题出错:', error);
    }
  };

  // 在组件挂载前不渲染主题切换按钮，避免水合不匹配
  const ThemeToggle = () => {
    if (!mounted) return null;

    return (
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
      >
        {isDarkMode ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>
    );
  };

  // 移动端主题切换按钮
  const MobileThemeToggle = () => {
    if (!mounted) return null;

    return (
      <div className="flex items-center pl-3 pr-4 py-2">
        <button
          onClick={toggleDarkMode}
          className="flex items-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-opacity-80 focus:outline-none transition-colors duration-200"
        >
          {isDarkMode ? (
            <><SunIcon className="h-5 w-5 mr-2" /> <span>切换到亮色模式</span></>
          ) : (
            <><MoonIcon className="h-5 w-5 mr-2" /> <span>切换到暗色模式</span></>
          )}
        </button>
      </div>
    );
  };

  // 导航链接 - 根据原型设计整合四个主要导航
  const navLinks = [
    { href: '/', label: '首页', icon: HomeIcon },
    { href: '/resources', label: '资源库', icon: FolderIcon },
    { href: '/categories', label: '分类', icon: RectangleStackIcon },
    { href: '/tags', label: '标签', icon: TagIcon },
  ];

  // 用户菜单链接 - 移除了"我的上传"和"我的收藏"，因为已集成到个人中心页面
  const userMenuLinks: { href: string; label: string }[] = [];

  return (
    <>
      <style jsx global>{`
        @media (min-width: 640px) {
          #desktop-nav {
            display: block !important;
          }
          #mobile-menu-btn {
            display: none !important;
          }
          #mobile-menu {
            display: none !important;
          }
        }
        @media (max-width: 639px) {
          #desktop-nav {
            display: none !important;
          }
          #mobile-menu-btn {
            display: flex !important;
          }
          #mobile-menu {
            display: block !important;
          }
        }
      `}</style>
      <nav className="card border-b border-gray-200 dark:border-gray-700 mb-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo和主导航 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">文</span>
                </div>
                <span className="text-xl font-bold text-amber-800">文明资源平台</span>
              </Link>
            </div>
            {/* 桌面端导航菜单 - 使用内联媒体查询 */}
            <div
              className="ml-6"
              style={{
                display: 'none'
              }}
              id="desktop-nav"
            >
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className={`nav-link ${pathname === '/' ? 'active' : ''}`}
                >
                  首页
                </Link>
                <Link
                  href="/resources"
                  className={`nav-link ${pathname === '/resources' ? 'active' : ''}`}
                >
                  资源库
                </Link>
                <Link
                  href="/categories"
                  className={`nav-link ${pathname === '/categories' ? 'active' : ''}`}
                >
                  分类
                </Link>
                <Link
                  href="/tags"
                  className={`nav-link ${pathname === '/tags' ? 'active' : ''}`}
                >
                  标签
                </Link>
              </div>
            </div>


          </div>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-4">
            {/* 主题切换 */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {mounted && (
                isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                )
              )}
            </button>

            {/* 搜索框 */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="搜索资源..."
                className="input-field w-64 pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value.trim();
                    if (query) {
                      window.location.href = `/resources?q=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
              <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            {/* 用户菜单 */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user?._id}/avatar?t=${Date.now()}`}
                    alt="用户头像"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block">{user?.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* 用户下拉菜单 */}
                {isUserDropdownOpen && (
                  <div id="user-dropdown" className="dropdown right-0 mt-2 w-48 py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      个人中心
                    </Link>
                    {userMenuLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 - 640px以下显示 */}
          <div
            className="flex items-center"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
          >
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 - 640px以下显示，只显示导航项 */}
      {isMobileMenuOpen && (
        <div
          className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative z-50"
          style={{ display: 'none' }}
          id="mobile-menu"
        >
          {/* 移动端导航项 */}
          <div className="py-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                pathname === '/'
                  ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/resources"
              className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                pathname === '/resources'
                  ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              资源库
            </Link>
            <Link
              href="/categories"
              className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                pathname === '/categories'
                  ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              分类
            </Link>
            <Link
              href="/tags"
              className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors ${
                pathname === '/tags'
                  ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              标签
            </Link>
          </div>
        </div>
      )}
      </nav>
    </>
  );
};

export default Navbar;
