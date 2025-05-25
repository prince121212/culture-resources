'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResourceForm from '@/components/resources/ResourceForm';
import {
  getResourceById,
  updateResource,
  CreateResourceData, // Re-used for form structure, though it's an update
  Resource as ResourceType,
  UpdateResourceResponse,
} from '@/services/resource.service';
import { ApiError, ValidationError } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user: currentUser, token, isAuthenticated, isLoading: authLoading } = useAuth();

  const resourceId = params?.id || null;

  const [resource, setResource] = useState<ResourceType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalPageError, setGeneralPageError] = useState<string | null>(null);
  const [serverValidationErrors, setServerValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      toast.error('请先登录以编辑资源。');
      router.replace(`/auth/login?redirect=/resources/${resourceId}/edit`);
      return;
    }

    if (resourceId) {
      const fetchResourceToEdit = async () => {
        setIsFetching(true);
        setGeneralPageError(null);
        try {
          const data = await getResourceById(resourceId);
          setResource(data);
          // Authorization check: current user must be the uploader
          if (currentUser?._id !== (typeof data.uploader === 'string' ? data.uploader : data.uploader._id)) {
            toast.error('您无权编辑此资源。');
            router.replace(`/resources/${resourceId}`); // Redirect to detail page or resource list
            return;
          }
        } catch (err: unknown) {
          let errorMessage = '获取资源信息失败。';
          if (err instanceof ApiError) {
            errorMessage = err.response?.message || err.message;
            if (err.status === 404) toast.error('未找到资源。');
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          setGeneralPageError(errorMessage);
          toast.error(errorMessage);
          router.replace('/resources'); // Redirect if resource cannot be fetched
        }
        setIsFetching(false);
      };
      fetchResourceToEdit();
    } else {
      setGeneralPageError('缺少资源ID。');
      toast.error('缺少资源ID。');
      router.replace('/resources');
      setIsFetching(false);
    }
  }, [resourceId, isAuthenticated, authLoading, currentUser, router]);

  const handleUpdate = async (data: CreateResourceData) => {
    if (!resourceId || !token) {
      toast.error('无法更新资源。缺少ID或认证信息。');
      return;
    }
    setIsSubmitting(true);
    setGeneralPageError(null);
    setServerValidationErrors([]);

    try {
      const response: UpdateResourceResponse = await updateResource(resourceId, data, token);
      // 处理新的响应格式
      const updated = response.data;
      const message = response.message;
      toast.success(message);
      router.push(`/resources/${updated._id}`);
    } catch (err: unknown) {
      let toastMessage = '更新资源失败，请重试。';
      let specificFieldErrors: ValidationError[] = [];
      let pageLevelErrorMessage: string | null = null; // For errors not tied to specific fields

      if (err instanceof ApiError) {
        toastMessage = err.response?.message || err.message; // Use API message for toast first
        if (err.response?.errors && Array.isArray(err.response.errors)) {
          specificFieldErrors = err.response.errors;
          // If specific errors exist, the toast message might be better as a general one
          toastMessage = err.response.message || "请检查表单中的错误。";
        } else {
          // No specific field errors from backend, so this is a general API error
          pageLevelErrorMessage = err.response?.message || err.message;
        }
      } else if (err instanceof Error) {
        toastMessage = err.message;
        pageLevelErrorMessage = err.message; // Treat other errors as general page errors
      }

      setServerValidationErrors(specificFieldErrors);
      // Set generalPageError only if there are no specific field errors and pageLevelErrorMessage exists
      if (specificFieldErrors.length === 0 && pageLevelErrorMessage) {
        setGeneralPageError(pageLevelErrorMessage);
      } else if (specificFieldErrors.length > 0 && !pageLevelErrorMessage) {
        // Optional: if only field errors, maybe set a generic page error too.
        setGeneralPageError("请修正以下高亮显示的错误。");
      }

      toast.error(toastMessage); // Display the most relevant message as a toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-white font-medium">加载编辑器中...</p>
      </div>
    );
  }

  if (generalPageError && !resource) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-red-500 mb-4 font-bold">错误: {generalPageError}</p>
        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-blue-400 hover:text-blue-300 font-medium">
          &larr; 返回
        </Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-white mb-4 font-medium">无法加载资源进行编辑。</p>
         <Link href="/resources" className="text-blue-400 hover:text-blue-300 font-medium">
            &larr; 返回资源列表
          </Link>
      </div>
    );
  }

  // Prepare initial data for the form, ensuring tags are properly formatted
  const formInitialData: Partial<CreateResourceData> = {
    title: resource.title,
    description: resource.description || '',
    // 使用resource.link作为url字段的值，因为CreateResourceData接受url字段
    url: resource.link,
    category: resource.category || '',
    // 修复类型错误：确保tags始终是数组
    tags: Array.isArray(resource.tags) ? resource.tags : [],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-blue-400 hover:text-blue-300 font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回资源详情
        </Link>
        <h1 className="text-3xl font-bold text-white mt-3 mb-2">编辑资源</h1>
        <p className="text-gray-300 text-lg">更新您的资源详情。</p>
      </div>

      {generalPageError && (
         <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">错误: </strong>
          <span className="block sm:inline">{generalPageError}</span>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <ResourceForm
          onSubmit={handleUpdate}
          initialData={formInitialData}
          isLoading={isSubmitting}
          submitButtonText="更新资源"
          serverErrors={serverValidationErrors}
        />
      </div>
    </div>
  );
}