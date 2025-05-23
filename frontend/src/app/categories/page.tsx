'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, Category } from '@/services/category.service';
import { ApiError } from '@/services/auth.service';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        let errorMessage = '获取分类失败';
        if (err instanceof ApiError) {
          errorMessage = err.response?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">资源分类</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category._id} 
              href={`/resources?category=${encodeURIComponent(category.name)}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-4">
                    <DocumentIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                </div>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {category.resourceCount || 0} 个资源
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-1">暂无分类</h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              还没有任何资源分类，请稍后再查看。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
