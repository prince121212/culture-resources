"use client";

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { ApiError, ValidationError } from '@/services/auth.service';
import type { UserRegistrationData } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setValidationErrors([]);
    if (auth.error) {
      auth.clearError();
    }

    try {
      const userData: UserRegistrationData = { username, email, password };
      const data = await auth.register(userData);

      toast.success(data.message || '注册成功！即将跳转到登录页面。');
      setUsername('');
      setEmail('');
      setPassword('');
      router.push('/auth/login');

    } catch (error: unknown) {
      console.error('Register page error caught:', error);
      let generalErrorMessage = '注册失败，发生未知错误。';
      let specificValidationErrors: ValidationError[] = [];

      if (error instanceof ApiError) {
        generalErrorMessage = error.response?.message || error.message || '注册失败，请检查输入。';
        if (error.response?.errors && Array.isArray(error.response.errors)) {
          specificValidationErrors = error.response.errors;
        }
      } else if (error instanceof Error) {
        generalErrorMessage = error.message;
      }
      
      toast.error(generalErrorMessage);
      setValidationErrors(specificValidationErrors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      router.push('/');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  if (auth.isLoading || auth.isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>加载中或正在跳转...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建您的账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {validationErrors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="ml-3">
                 <h3 className="text-sm font-medium text-red-800">请修正以下错误：</h3>
                 <ul className="list-disc list-inside text-sm text-red-700">
                  {validationErrors.map((errItem, index) => (
                    <li key={index}>{errItem.msg} {errItem.path ? `(${errItem.path})` : ''}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码 (至少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                已有账户？去登录
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 