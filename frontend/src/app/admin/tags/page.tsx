'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { downloadStaticTemplate } from '@/utils/excel-template';

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/tags`, {
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
      const response = await fetch('http://localhost:5001/api/tags', {
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
      const response = await fetch(`http://localhost:5001/api/tags/${currentTag._id}`, {
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
      const response = await fetch(`http://localhost:5001/api/tags/${id}`, {
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
      const response = await fetch(`http://localhost:5001/api/tags/${id}`, {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('请选择Excel文件 (.xlsx 或 .xls)');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过5MB');
        return;
      }

      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('请选择要导入的Excel文件');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/tags/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '导入失败');
      }

      setImportResult(result.data);
      toast.success(result.message);
      fetchTags();
    } catch (error) {
      console.error('导入标签出错:', error);
      toast.error(error instanceof Error ? error.message : '导入失败，请稍后再试');
    } finally {
      setImporting(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    setImporting(false);
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

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            批量导入
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

      {/* 批量导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">批量导入标签</h2>

            {!importResult ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-900">Excel文件格式要求：</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadStaticTemplate('excel', 'tag')}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        下载Excel模板
                      </button>
                      <button
                        onClick={() => downloadStaticTemplate('csv', 'tag')}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        下载CSV模板
                      </button>
                    </div>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 第一行为表头：标签名称、描述</li>
                    <li>• 标签名称为必填项，长度1-30个字符</li>
                    <li>• 描述为可选项，不超过200个字符</li>
                    <li>• 支持.xlsx和.xls格式，文件大小不超过5MB</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">选择Excel文件:</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {importFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      已选择文件: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetImportModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    disabled={importing}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {importing ? '导入中...' : '开始导入'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">导入结果</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                      <div className="text-sm text-blue-800">总行数</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                      <div className="text-sm text-green-800">成功</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{importResult.errorCount}</div>
                      <div className="text-sm text-red-800">失败</div>
                    </div>
                  </div>
                </div>

                {importResult.createdTags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-800 mb-2">成功创建的标签:</h4>
                    <div className="max-h-32 overflow-y-auto bg-green-50 p-3 rounded-lg">
                      {importResult.createdTags.map((tag: any, index: number) => (
                        <div key={index} className="text-sm text-green-700">
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-800 mb-2">错误信息:</h4>
                    <div className="max-h-32 overflow-y-auto bg-red-50 p-3 rounded-lg">
                      {importResult.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          第{error.row}行: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={resetImportModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
