"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResources: number;
  limit: number;
}

export default function AdminReviews() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalResources: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [reviewingResource, setReviewingResource] = useState<Resource | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPendingResources = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/admin/resources/pending?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取待审核资源失败');
      }

      const data = await response.json();
      setResources(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('获取待审核资源出错:', error);
      toast.error('获取待审核资源失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingResources();
    }
  }, [token]);

  const handlePageChange = (page: number) => {
    fetchPendingResources(page);
  };

  const handleApprove = async (resource: Resource) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/resources/${resource._id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('审核资源失败');
      }

      toast.success(`资源"${resource.title}"已通过审核`);
      fetchPendingResources(pagination.currentPage);
    } catch (error) {
      console.error('审核资源出错:', error);
      toast.error('审核资源失败，请稍后再试');
    }
  };

  const openRejectModal = (resource: Resource) => {
    setReviewingResource(resource);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setReviewingResource(null);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!reviewingResource) return;
    if (!rejectReason.trim()) {
      toast.error('请填写拒绝原因');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/resources/${reviewingResource._id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectReason: rejectReason,
        }),
      });

      if (!response.ok) {
        throw new Error('拒绝资源失败');
      }

      toast.success(`资源"${reviewingResource.title}"已被拒绝`);
      closeRejectModal();
      fetchPendingResources(pagination.currentPage);
    } catch (error) {
      console.error('拒绝资源出错:', error);
      toast.error('拒绝资源失败，请稍后再试');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">资源审核</h1>

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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    资源标题
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    上传者
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    上传时间
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{resource.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{resource.uploader.username}</div>
                      <div className="text-sm text-gray-500">{resource.uploader.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {(() => {
                          if (!resource.category) return '未分类';
                          if (typeof resource.category === 'string') return resource.category;
                          if (typeof resource.category === 'object' && resource.category.name) return resource.category.name;
                          return '未分类';
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(resource.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprove(resource)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => openRejectModal(resource)}
                        className="text-red-600 hover:text-red-900"
                      >
                        拒绝
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              显示 <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> 到 <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalResources)}</span> 条，共 <span className="font-medium">{pagination.totalResources}</span> 条
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">没有待审核的资源</h3>
          <p className="mt-2 text-sm text-gray-500">
            当前没有需要审核的资源，所有资源都已经审核完毕。
          </p>
        </div>
      )}

      {/* 拒绝原因模态框 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">拒绝资源</h3>
            <p className="text-sm text-gray-500 mb-4">
              您正在拒绝资源 "{reviewingResource?.title}"，请填写拒绝原因：
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="请填写拒绝原因，该原因将发送给资源上传者"
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
