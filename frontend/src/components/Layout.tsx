'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  // 检查系统主题偏好
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 切换暗色/亮色模式
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // 导航链接
  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/resources', label: '资源' },
    { href: '/categories', label: '分类' },
    { href: '/tags', label: '标签' },
  ];

  // 用户菜单链接 - 移除了"我的上传"和"我的收藏"，因为已集成到个人中心页面
  const userMenuLinks = [
    { href: '/profile', label: '个人中心' },
  ];

  return (
    <div className="min-h-screen bg-newspaper dark:bg-gray-900">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  <img src="/logo.png" alt="logo" height={32} width={32} className="h-8 w-8 object-contain" />
                  <span>文明</span>
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
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
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
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* 用户菜单 */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                  >
                    <span className="text-sm font-medium">{user?.username}</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user?.username[0].toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* 下拉菜单 */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {userMenuLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === link.href
                      ? 'border-indigo-500 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* 移动端用户菜单 */}
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user?.username[0].toUpperCase()}
                      </span>
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

      {/* 主要内容 */}
      <main>{children}</main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                关于我们
              </h3>
              <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
                文明是一个致力于分享优质文化资源的平台。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                快速链接
              </h3>
              <ul className="mt-4 space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                帮助中心
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    href="/help/faq"
                    className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    常见问题
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help/guide"
                    className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    使用指南
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help/contact"
                    className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                关注我们
              </h3>
              <div className="mt-4 flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">微信</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295a.328.328 0 00.168-.054l1.903-1.114a.864.864 0 01.718-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.053-.856-2.563.193-5.362 2.515-6.78 2.323-1.417 5.374-1.098 7.196.71 1.823 1.81 2.072 4.63.694 6.817-1.378 2.188-4.14 3.456-6.954 3.456-1.317 0-2.599-.27-3.797-.79a.752.752 0 00-.718.098l-1.903 1.114a.328.328 0 01-.168.054c-.16 0-.29-.132-.29-.295 0-.072-.03-.142-.048-.213l-.39-1.48a.59.59 0 01.213-.665c1.832-1.347 3.002-3.338 3.002-5.55 0-4.054-3.891-7.342-8.691-7.342zm5.362 9.53c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm-4.362-1c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">微博</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.098 20c-4.612 0-8.363-1.958-8.363-4.5 0-1.086.724-2.032 1.832-2.803.434-.255.872-.382 1.314-.382.442 0 .88.127 1.314.382 1.108.771 1.832 1.717 1.832 2.803 0 2.542 3.751 4.5 8.363 4.5 4.612 0 8.363-1.958 8.363-4.5 0-1.086-.724-2.032-1.832-2.803-.434-.255-.872-.382-1.314-.382-.442 0-.88.127-1.314.382-1.108.771-1.832 1.717-1.832 2.803 0 2.542-3.751 4.5-8.363 4.5zm0-16c-4.612 0-8.363 1.958-8.363 4.5 0 1.086.724 2.032 1.832 2.803.434.255.872.382 1.314.382.442 0 .88-.127 1.314-.382 1.108-.771 1.832-1.717 1.832-2.803 0-2.542 3.751-4.5 8.363-4.5 4.612 0 8.363 1.958 8.363 4.5 0 1.086-.724 2.032-1.832 2.803-.434.255-.872.382-1.314.382-.442 0-.88-.127-1.314-.382-1.108-.771-1.832-1.717-1.832-2.803 0-2.542-3.751-4.5-8.363-4.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">文明</h2>
              <p className="mt-4 text-lg text-gray-600">
                文明是一个致力于分享优质文化资源的平台。
              </p>
            </div>
            <div className="text-center text-base text-gray-500">
              &copy; {new Date().getFullYear()} 文明. 保留所有权利.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 