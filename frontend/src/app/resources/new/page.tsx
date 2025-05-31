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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/resources" 
            className="inline-flex items-center px-4 py-2 bg-gray-700/70 backdrop-blur-sm rounded-full shadow-sm text-white hover:bg-gray-600/70 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回资源列表
          </Link>
          <h1 className="text-3xl font-bold mt-2">上传资源</h1>
        </div>

        {generalFormError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 mb-6" role="alert">
            <strong className="font-bold">错误：</strong>
            <span className="block sm:inline">{generalFormError}</span>
          </div>
        )}

        <ResourceForm 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
          submitButtonText="提交审核"
          serverErrors={serverValidationErrors}
        />
      </div>
    </div>
  );
} 