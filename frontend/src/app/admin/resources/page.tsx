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
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  limit: number;
}

export default function AdminResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchResources = async (page = 1) => {
    try {
      setLoading(true);
      let url = `http://localhost:5001/api/resources?page=${page}&limit=10`;

      if (searchQuery) {
        url += `&keyword=${encodeURIComponent(searchQuery)}`;
      }

      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取资源列表失败');
      }

      const data = await response.json();
      setResources(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('获取资源列表出错:', error);
      toast.error('获取资源列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResources();
    }
  }, [token, statusFilter]);

  const handlePageChange = (page: number) => {
    fetchResources(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">资源管理</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">所有状态</option>
            <option value="approved">已通过</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
            <option value="draft">草稿</option>
            <option value="terminated">已终止</option>
          </select>

          <Link href="/admin/reviews" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            待审核资源
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索资源..."
            className="border border-gray-300 rounded-l-md px-4 py-2 text-gray-900 font-medium bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
          >
            搜索
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : resources.length > 0 ? (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    资源标题
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    上传者
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    下载/评分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{resource.title}</div>
                      <div className="text-sm text-gray-700 truncate max-w-xs">{resource.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{resource.uploader.username}</div>
                      <div className="text-sm text-gray-700">{resource.uploader.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(resource.status)}`}>
                        {getStatusText(resource.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                      <div>下载: {resource.downloadCount}</div>
                      <div>评分: {resource.ratingCount > 0 ? `${resource.rating.toFixed(1)} (${resource.ratingCount})` : '暂无'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/resources/${resource._id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-800 font-medium">
              显示 <span className="font-bold text-gray-900">{(pagination.currentPage - 1) * pagination.limit + 1}</span> 到 <span className="font-bold text-gray-900">{Math.min(pagination.currentPage * pagination.limit, pagination.totalResources)}</span> 条，共 <span className="font-bold text-gray-900">{pagination.totalResources}</span> 条
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-md ${pagination.currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-md ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                下一页
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-bold text-gray-900">没有找到资源</h3>
          <p className="mt-2 text-sm text-gray-700 font-medium">
            没有符合条件的资源，请尝试调整搜索条件。
          </p>
        </div>
      )}
    </div>
  );
}
