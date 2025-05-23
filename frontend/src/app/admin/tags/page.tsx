'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Tag {
  _id: string;
  name: string;
  description?: string;
  count: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TagManagement() {
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/tags`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取标签列表失败');
      }

      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('获取标签列表出错:', error);
      toast.error('获取标签列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 本地过滤，也可以改为API搜索
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTag),
      });

      if (!response.ok) {
        throw new Error('创建标签失败');
      }

      toast.success('标签创建成功');
      setShowAddModal(false);
      setNewTag({
        name: '',
        description: '',
      });
      fetchTags();
    } catch (error) {
      console.error('创建标签出错:', error);
      toast.error('创建标签失败，请稍后再试');
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTag) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${currentTag._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: currentTag.name,
          description: currentTag.description,
          isActive: currentTag.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('更新标签失败');
      }

      toast.success('标签更新成功');
      setShowEditModal(false);
      setCurrentTag(null);
      fetchTags();
    } catch (error) {
      console.error('更新标签出错:', error);
      toast.error('更新标签失败，请稍后再试');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('更新标签状态失败');
      }

      toast.success('标签状态更新成功');
      fetchTags();
    } catch (error) {
      console.error('更新标签状态出错:', error);
      toast.error('更新标签状态失败，请稍后再试');
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除标签失败');
      }

      toast.success('标签删除成功');
      fetchTags();
    } catch (error: any) {
      console.error('删除标签出错:', error);
      toast.error(error.message || '删除标签失败，请稍后再试');
    }
  };

  // 过滤和排序标签
  const filteredTags = tags
    .filter(tag => 
      (showInactive || tag.isActive) && 
      (searchQuery === '' || 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => b.count - a.count); // 按使用次数降序排序

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">标签管理</h1>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            添加标签
          </button>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
              className="mr-2"
            />
            显示已禁用标签
          </label>
        </div>
        
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标签..."
            className="border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTags.map((tag) => (
                <tr key={tag._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {tag.description || '无描述'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{tag.count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tag.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tag.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setCurrentTag(tag);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggleStatus(tag._id, tag.isActive)}
                      className={`${
                        tag.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } mr-4`}
                    >
                      {tag.isActive ? '禁用' : '启用'}
                    </button>
                    {tag.count === 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`确定要删除标签 "${tag.name}" 吗？`)) {
                            handleDeleteTag(tag._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 添加标签模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">添加标签</h2>
            <form onSubmit={handleAddTag}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">标签名称:</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">描述:</label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag({...newTag, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 编辑标签模态框 */}
      {showEditModal && currentTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">编辑标签</h2>
            <form onSubmit={handleEditTag}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">标签名称:</label>
                <input
                  type="text"
                  value={currentTag.name}
                  onChange={(e) => setCurrentTag({...currentTag, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">描述:</label>
                <textarea
                  value={currentTag.description || ''}
                  onChange={(e) => setCurrentTag({...currentTag, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentTag.isActive}
                    onChange={(e) => setCurrentTag({...currentTag, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  启用标签
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
