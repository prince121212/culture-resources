'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, UpdateUserProfileData } from '@/services/user.service';
import { ApiError, ValidationError } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading: authLoading, token, updateUserContext } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 当用户信息加载完成后，初始化表单数据
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      if (currentUser.avatar && currentUser.avatar.startsWith('/api/users/')) {
        setAvatar(currentUser.avatar);
      } else if (currentUser.avatar) {
        setAvatar(`/api/users/${currentUser._id}/avatar`);
      } else {
        setAvatar(null);
      }
    }
  }, [currentUser]);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录以编辑个人资料');
      router.replace('/auth/login?redirect=/profile/edit');
    }
  }, [isAuthenticated, authLoading, router]);

  // 处理头像文件选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);

      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentUser?._id || !token) {
      toast.error('无法更新资料，请重新登录');
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    setGeneralError(null);

    try {
      // 准备更新数据
      const updateData: UpdateUserProfileData = {
        username,
        email,
      };

      // 更新用户资料
      const updatedUser = await updateUserProfile(currentUser._id, updateData, token);

      // 更新头像（如果有新头像）
      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append('avatar', avatarFile);

          console.log(`准备上传头像: ${avatarFile.name}, 大小: ${Math.round(avatarFile.size / 1024)}KB, 类型: ${avatarFile.type}`);

          // 使用正确的头像上传API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          console.log(`头像上传响应状态: ${response.status}`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '头像上传响应解析失败' }));
            throw new Error(errorData.message || '头像上传失败');
          }

          const data = await response.json();
          console.log(`头像上传成功, 返回数据:`, data);

          // 更新用户头像信息
          if (data.user) {
            updatedUser.avatar = data.user.avatar;
          }
        } catch (error) {
          console.error('头像上传失败:', error);
          toast.error(error instanceof Error ? error.message : '头像上传失败，但其他资料已更新');
        }
      }

      // 更新全局用户上下文
      if (updateUserContext) {
        updateUserContext(updatedUser);
      }

      toast.success('个人资料更新成功');
      router.push('/profile');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.response?.errors && Array.isArray(err.response.errors)) {
          setValidationErrors(err.response.errors);
        } else {
          setGeneralError(err.message);
        }
        toast.error(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
        toast.error(err.message);
      } else {
        setGeneralError('更新资料时发生未知错误');
        toast.error('更新资料时发生未知错误');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取特定字段的验证错误
  const getFieldError = (field: string): string | undefined => {
    const error = validationErrors.find(err => err.path === field);
    return error?.msg;
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">编辑个人资料</h1>
          <Link
            href="/profile"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            返回个人中心
          </Link>
        </div>

        {generalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
          {/* 头像上传 */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              头像
            </label>
            <div className="flex items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                {(avatarPreview || avatar) ? (
                  avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="用户头像预览"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img
                      src={currentUser?.avatar ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar` : '/images/default-avatar.png'}
                      alt="用户头像"
                      className="object-cover w-full h-full"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.png'; }}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    无头像
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  dark:file:bg-indigo-900 dark:file:text-indigo-300
                  hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              支持 JPG, PNG, GIF 格式，最大 2MB
            </p>
          </div>

          {/* 用户名 */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                getFieldError('username') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isSubmitting}
              required
            />
            {getFieldError('username') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('username')}</p>
            )}
          </div>

          {/* 邮箱 */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                getFieldError('email') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isSubmitting}
              required
            />
            {getFieldError('email') && (
              <p className="text-red-500 text-xs italic mt-1">{getFieldError('email')}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存修改'}
            </button>
            <Link
              href="/profile"
              className="inline-block align-baseline font-bold text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
