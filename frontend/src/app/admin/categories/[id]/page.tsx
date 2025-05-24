'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
}

export default function CategoryEdit() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    order: 0,
    isActive: true,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取当前分类
        const categoryResponse = await fetch(`http://localhost:5001/api/categories/${categoryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!categoryResponse.ok) {
          throw new Error('获取分类信息失败');
        }

        const categoryData = await categoryResponse.json();
        setCategory(categoryData);
        setFormData({
          name: categoryData.name,
          description: categoryData.description || '',
          parent: categoryData.parent || '',
          order: categoryData.order,
          isActive: categoryData.isActive,
        });
        
        // 获取所有分类（用于选择父分类）
        const categoriesResponse = await fetch(`http://localhost:5001/api/categories?flat=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!categoriesResponse.ok) {
          throw new Error('获取分类列表失败');
        }

        const categoriesData = await categoriesResponse.json();
        // 过滤掉当前分类及其子分类（避免循环引用）
        const filteredCategories = categoriesData.filter((cat: Category) => 
          cat._id !== categoryId && !cat.path.includes(`${categoryData.path}/`)
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error('获取数据出错:', error);
        toast.error('获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    if (token && categoryId) {
      fetchData();
    }
  }, [token, categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (name === 'order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5001/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('更新分类失败');
      }

      toast.success('分类更新成功');
      router.push('/admin/categories');
    } catch (error) {
      console.error('更新分类出错:', error);
      toast.error('更新分类失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除分类失败');
      }

      toast.success('分类删除成功');
      router.push('/admin/categories');
    } catch (error: unknown) {
      console.error('删除分类出错:', error);
      toast.error(error instanceof Error ? error.message : '删除分类失败，请稍后再试');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">分类不存在</h2>
        <p className="mt-2 text-gray-500">找不到该分类信息</p>
        <Link href="/admin/categories" className="mt-6 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          返回分类列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">编辑分类</h1>
        <Link href="/admin/categories" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
          返回分类列表
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                分类名称
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                父分类
              </label>
              <select
                name="parent"
                id="parent"
                value={formData.parent}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">无 (顶级分类)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                描述
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                排序值
              </label>
              <input
                type="number"
                name="order"
                id="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center h-full">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">启用分类</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              删除分类
            </button>
            
            <div className="flex space-x-3">
              <Link
                href="/admin/categories"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* 删除确认模态框 */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">确认删除</h2>
            <p className="mb-4">
              您确定要删除分类 <span className="font-semibold">{category.name}</span> 吗？此操作不可撤销。
            </p>
            <p className="mb-4 text-red-600">
              注意：如果该分类下有子分类或资源，将无法删除。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
