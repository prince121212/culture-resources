"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Uploader {
  _id: string;
  username: string;
  email: string;
}

interface Resource {
  _id: string;
  title: string;
  description: string;
  link: string;
  uploader: Uploader;
  category?: string;
  tags?: string[];
  downloadCount: number;
  rating: number;
  ratingCount: number;
  status: string;
  reviewedBy?: {
    _id: string;
    username: string;
  };
  reviewedAt?: string;
  rejectReason?: string;
  version: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResourceDetail({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingLink, setCheckingLink] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/resources/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('获取资源详情失败');
        }

        const data = await response.json();
        setResource(data);
      } catch (error) {
        console.error('获取资源详情出错:', error);
        setError('获取资源详情失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchResource();
    }
  }, [token, params.id]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '待审核';
      case 'rejected':
        return '已拒绝';
      case 'draft':
        return '草稿';
      case 'terminated':
        return '已终止';
      default:
        return status;
    }
  };

  const handleCheckLink = async () => {
    if (!resource || !token) return;

    try {
      setCheckingLink(true);
      const response = await fetch(`http://localhost:5001/api/resources/${resource._id}/check-link`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('检查链接失败');
      }

      const data = await response.json();

      if (data.message.includes('链接有效')) {
        toast.success('链接检查完成：链接有效');
      } else {
        toast.error('链接检查完成：链接已失效');
        // 刷新资源信息
        const updatedResource = await fetch(`http://localhost:5001/api/resources/${resource._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).then(res => res.json());

        setResource(updatedResource);
      }
    } catch (error) {
      console.error('检查链接出错:', error);
      toast.error('检查链接失败，请稍后再试');
    } finally {
      setCheckingLink(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              资源不存在或已被删除。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">资源详情</h1>
        <div className="flex space-x-3">
          <Link href="/admin/resources" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            返回列表
          </Link>
          {resource.status === 'pending' && (
            <Link href={`/admin/reviews`} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              去审核
            </Link>
          )}
          {resource.status === 'approved' && (
            <button
              onClick={handleCheckLink}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              disabled={checkingLink}
            >
              {checkingLink ? '检查中...' : '检查链接有效性'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                上传者: {resource.uploader.username} ({resource.uploader.email})
              </p>
            </div>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(resource.status)}`}>
              {getStatusText(resource.status)}
            </span>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">资源描述</h3>
            <p className="mt-2 text-gray-600 whitespace-pre-line">{resource.description || '无描述'}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">资源信息</h3>
              <div className="mt-2 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">资源链接:</span>
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 truncate max-w-xs">
                    {resource.link}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">分类:</span>
                  <span>{resource.category || '未分类'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">标签:</span>
                  <div className="flex flex-wrap justify-end">
                    {resource.tags && resource.tags.length > 0 ? (
                      resource.tags.map((tag, index) => (
                        <span key={index} className="ml-1 px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span>无标签</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">下载次数:</span>
                  <span>{resource.downloadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">评分:</span>
                  <span>{resource.ratingCount > 0 ? `${resource.rating.toFixed(1)} (${resource.ratingCount}人评分)` : '暂无评分'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">版本:</span>
                  <span>{resource.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">是否公开:</span>
                  <span>{resource.isPublic ? '是' : '否'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">时间信息</h3>
              <div className="mt-2 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">创建时间:</span>
                  <span>{new Date(resource.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">更新时间:</span>
                  <span>{new Date(resource.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
                {resource.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">审核时间:</span>
                    <span>{new Date(resource.reviewedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                {resource.reviewedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">审核人:</span>
                    <span>{resource.reviewedBy.username}</span>
                  </div>
                )}
              </div>

              {resource.status === 'rejected' && resource.rejectReason && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-red-600">拒绝原因</h3>
                  <p className="mt-2 text-gray-600 bg-red-50 p-3 rounded-md border border-red-100">
                    {resource.rejectReason}
                  </p>
                </div>
              )}

              {resource.status === 'terminated' && resource.rejectReason && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-purple-600">链接失效原因</h3>
                  <p className="mt-2 text-gray-600 bg-purple-50 p-3 rounded-md border border-purple-100">
                    {resource.rejectReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
