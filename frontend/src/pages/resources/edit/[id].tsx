'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// 模拟数据 - 后续会从API获取
const mockResource = {
  id: 1,
  title: '中国传统文化概论',
  description: '全面介绍中国传统文化的基本概念、历史渊源和主要特点',
  content: '详细内容...',
  category: '传统文化',
  tags: ['文化', '传统', '概论'],
};

const categories = [
  { id: '传统文化', name: '传统文化' },
  { id: '非遗保护', name: '非遗保护' },
  { id: '民间艺术', name: '民间艺术' },
  { id: '民俗文化', name: '民俗文化' },
  { id: '历史文献', name: '历史文献' },
];

export default function EditResource() {
  const router = useRouter();
  const { id } = router.query;
  const [resource, setResource] = useState(mockResource);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: 实现保存功能
      console.log('保存资源:', resource);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟API调用
      router.push(`/resources/${id}`);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          返回
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">基本信息</h2>
            <div className="space-y-6">
              {/* 标题 */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={resource.title}
                  onChange={(e) =>
                    setResource({ ...resource, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 描述 */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  描述
                </label>
                <textarea
                  id="description"
                  value={resource.description}
                  onChange={(e) =>
                    setResource({ ...resource, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 分类 */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  分类
                </label>
                <select
                  id="category"
                  value={resource.category}
                  onChange={(e) =>
                    setResource({ ...resource, category: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setResource({
                            ...resource,
                            tags: resource.tags.filter((t) => t !== tag),
                          });
                        }}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="添加标签..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !resource.tags.includes(value)) {
                          setResource({
                            ...resource,
                            tags: [...resource.tags, value],
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 资源内容 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">资源内容</h2>
            <div>
              <textarea
                value={resource.content}
                onChange={(e) =>
                  setResource({ ...resource, content: e.target.value })
                }
                rows={10}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="请输入资源内容..."
                required
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 