'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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

  // 导航链接
  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/resources', label: '资源' },
    { href: '/categories', label: '分类' },
    { href: '/tags', label: '标签' },
  ];

  // 用户菜单链接
  const userMenuLinks = [
    { href: '/profile', label: '个人中心' },
    { href: '/profile/uploads', label: '我的上传' },
    { href: '/profile/favorites', label: '我的收藏' },
  ];

  return (
    <nav className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="logo" height={32} width={32} className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">文明</span>
              </Link>
            </div>

            {/* 桌面端导航链接 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 右侧工具栏 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* 主题切换按钮 */}
            <ThemeToggle />

            {/* 用户菜单 */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                >
                  <span className="text-sm font-medium">{user?.username}</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user._id}/avatar`}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                        style={{ width: '32px', height: '32px' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user?.username ? user.username[0].toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                </button>

                {/* 下拉菜单 */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {userMenuLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent"
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
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="sm:hidden bg-card">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === link.href
                    ? 'border-primary text-primary bg-accent/50'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* 移动端主题切换按钮 */}
            <MobileThemeToggle />
          </div>

          {/* 移动端用户菜单 */}
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user._id}/avatar`}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="object-cover"
                        style={{ width: '40px', height: '40px' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user?.username ? user.username[0].toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {user?.username}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userMenuLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4 space-x-4">
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
