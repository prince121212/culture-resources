'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { generateCategoryTemplate, generateCategoryTemplateCSV, downloadStaticTemplate } from '@/utils/excel-template';

interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | null;
  level: number;
  order: number;
  path: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export default function CategoryManagement() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent: '',
    order: 0,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/categories?flat=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取分类列表失败');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类列表出错:', error);
      toast.error('获取分类列表失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 本地过滤，也可以改为API搜索
    // 这里保留原始数据，只在显示时过滤
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error('创建分类失败');
      }

      toast.success('分类创建成功');
      setShowAddModal(false);
      setNewCategory({
        name: '',
        description: '',
        parent: '',
        order: 0,
      });
      fetchCategories();
    } catch (error) {
      console.error('创建分类出错:', error);
      toast.error('创建分类失败，请稍后再试');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5001/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('更新分类状态失败');
      }

      toast.success('分类状态更新成功');
      fetchCategories();
    } catch (error) {
      console.error('更新分类状态出错:', error);
      toast.error('更新分类状态失败，请稍后再试');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/categories/import`, {
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
      fetchCategories();
    } catch (error) {
      console.error('导入分类出错:', error);
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

  // 过滤和排序分类
  const filteredCategories = categories
    .filter(category =>
      (showInactive || category.isActive) &&
      (searchQuery === '' ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      // 先按层级排序
      if (a.level !== b.level) return a.level - b.level;
      // 同层级按排序值排序
      if (a.order !== b.order) return a.order - b.order;
      // 最后按名称排序
      return a.name.localeCompare(b.name);
    });

  // 获取父分类名称
  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return '无';
    const parent = categories.find(cat => cat._id === parentId);
    return parent ? parent.name : '未知';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">分类管理</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            添加分类
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
            显示已禁用分类
          </label>
        </div>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索分类..."
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">父分类</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">层级</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">排序</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {/* 根据层级缩进 */}
                      <span className="inline-block" style={{ marginLeft: `${(category.level - 1) * 20}px` }}>
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {category.description || '无描述'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {getParentName(category.parent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/categories/${category._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      编辑
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(category._id, category.isActive)}
                      className={`${
                        category.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } mr-4`}
                    >
                      {category.isActive ? '禁用' : '启用'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加分类模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">添加分类</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">分类名称:</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">描述:</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">父分类:</label>
                <select
                  value={newCategory.parent}
                  onChange={(e) => setNewCategory({...newCategory, parent: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">无 (顶级分类)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">排序值:</label>
                <input
                  type="number"
                  value={newCategory.order}
                  onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
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

      {/* 批量导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">批量导入分类</h2>

            {!importResult ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-900">Excel文件格式要求：</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadStaticTemplate('excel')}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        下载Excel模板
                      </button>
                      <button
                        onClick={() => downloadStaticTemplate('csv')}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        下载CSV模板
                      </button>
                    </div>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 第一行为表头：分类名称、描述、父分类名称、排序</li>
                    <li>• 分类名称为必填项，长度2-50个字符</li>
                    <li>• 父分类名称为可选项，必须是已存在的分类名称</li>
                    <li>• 排序为可选项，默认为0</li>
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

                {importResult.createdCategories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-green-800 mb-2">成功创建的分类:</h4>
                    <div className="max-h-32 overflow-y-auto bg-green-50 p-3 rounded-lg">
                      {importResult.createdCategories.map((cat: any, index: number) => (
                        <div key={index} className="text-sm text-green-700">
                          {cat.name}
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
