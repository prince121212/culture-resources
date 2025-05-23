"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResourceForm from '@/components/resources/ResourceForm';
import { createResource, CreateResourceData } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import type { ValidationError } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewResourcePage() {
  const router = useRouter();
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalFormError, setGeneralFormError] = useState<string | null>(null);
  const [serverValidationErrors, setServerValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请登录以上传资源。');
      router.replace('/auth/login?redirect=/resources/new');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (data: CreateResourceData) => {
    if (!token) {
      setGeneralFormError('未找到认证令牌。请重新登录。');
      toast.error('未找到认证令牌。');
      return;
    }
    setIsSubmitting(true);
    setGeneralFormError(null);
    setServerValidationErrors([]);

    try {
      console.log('Submitting resource data:', data);
      const result = await createResource(data, token);
      console.log('Resource created successfully:', result);
      toast.success('资源上传成功！');
      router.push('/resources');
    } catch (err: unknown) {
      console.error('Error submitting resource:', err);
      let toastMessage = '上传资源失败，请重试。';
      let specificFieldErrors: ValidationError[] = [];
      let generalApiMessage: string | null = null;

      if (err instanceof ApiError) {
        toastMessage = err.response?.message || err.message;
        if (err.response?.errors && Array.isArray(err.response.errors)) {
          specificFieldErrors = err.response.errors;
          toastMessage = err.response.message || "请检查表单中的错误。";
        } else {
          generalApiMessage = err.response?.message || err.message;
        }
      } else if (err instanceof Error) {
        toastMessage = err.message;
        generalApiMessage = err.message;
      }
      
      setServerValidationErrors(specificFieldErrors);
      if (specificFieldErrors.length === 0 && generalApiMessage) {
        setGeneralFormError(generalApiMessage);
      }

      toast.error(toastMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading && !token)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-600">加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
          <Link href="/resources" className="text-indigo-600 hover:text-indigo-800">
            &larr; 返回资源列表
          </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">上传新资源</h1>
        <p className="text-gray-600 mt-1">与社区分享新的链接或文件。</p>
      </div>

      {generalFormError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{generalFormError}</span>
        </div>
      )}

      <ResourceForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
        submitButtonText="上传资源"
        serverErrors={serverValidationErrors}
      />
    </div>
  );
} 