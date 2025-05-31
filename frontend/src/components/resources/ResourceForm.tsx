'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { CreateResourceData } from '@/services/resource.service';
import type { ValidationError } from '@/services/auth.service';
import { getCategories, Category } from '@/services/category.service';

interface ResourceFormProps {
  onSubmit: (data: CreateResourceData) => Promise<void>;
  initialData?: Partial<CreateResourceData>;
  isLoading?: boolean;
  submitButtonText?: string;
  serverErrors?: ValidationError[];
}

// Basic URL validation regex
const URL_REGEX = /^(https?):\/\//;

const ResourceForm: React.FC<ResourceFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  submitButtonText = '提交资源',
  serverErrors = [],
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagsString, setTagsString] = useState('');

  // 新增：存储分类列表
  const [categories, setCategories] = useState<Category[]>([]);

  // Error states
  const [titleError, setTitleError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // State for server-side field-specific errors
  const [serverTitleError, setServerTitleError] = useState<string | null>(null);
  const [serverUrlError, setServerUrlError] = useState<string | null>(null);
  const [serverDescriptionError, setServerDescriptionError] = useState<string | null>(null);
  const [serverCategoryError, setServerCategoryError] = useState<string | null>(null);
  const [serverTagsError, setServerTagsError] = useState<string | null>(null);
  const [otherServerErrors, setOtherServerErrors] = useState<string[]>([]);

  // 修复点1: 正确初始化 useRef，添加初始值 undefined
  const prevServerErrorsRef = useRef<ValidationError[] | undefined>(undefined);
  // 新增：用于存储上一次 initialData 的字符串化版本
  const prevInitialDataRef = useRef<string | undefined>(undefined);

  // 修复点2: 使用一个 ref 跟踪是否是首次渲染
  const isFirstRender = useRef<boolean>(true);

  // 新增：获取分类列表
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        // 如果initialData中有category，并且该category存在于获取到的列表中，则设置为初始值
        if (initialData.category && fetchedCategories.some(c => c._id === initialData.category)) {
          setCategory(initialData.category);
        } else if (fetchedCategories.length > 0 && !initialData.category && !category) {
          // 如果没有初始分类且当前未选择分类，可以考虑默认选择第一个，或者不选
          // setCategory(fetchedCategories[0]._id); // 例如默认选第一个
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setServerCategoryError("无法加载分类列表。");
      }
    };
    fetchCategoriesData();
  }, []); // 依赖项为空，仅在组件挂载时执行

  useEffect(() => {
    const currentInitialDataString = JSON.stringify(initialData);
    // 仅当 initialData 的内容实际发生变化时才更新
    if (initialData && currentInitialDataString !== prevInitialDataRef.current) {
      setTitle(initialData.title || '');

      // 处理 url 字段，确保表单能够正确显示链接
      setUrl(initialData.url || '');

      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setTagsString(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));

      setTitleError(null);
      setUrlError(null);
      setCategoryError(null);
      setTagsError(null);
      setServerTitleError(null);
      setServerUrlError(null);
      setServerDescriptionError(null);
      setServerCategoryError(null);
      setServerTagsError(null);
      setOtherServerErrors([]);
      // 更新 prevInitialDataRef
      prevInitialDataRef.current = currentInitialDataString;
    }
  }, [initialData]);

  // 修复点3: 完全重写 serverErrors 处理的 useEffect
  useEffect(() => {
    // 跳过首次渲染，避免无限循环
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 比较新旧 serverErrors，如果相同则不做任何操作
    const prevErrorsJson = JSON.stringify(prevServerErrorsRef.current);
    const currentErrorsJson = JSON.stringify(serverErrors);

    if (prevErrorsJson === currentErrorsJson) {
      return;
    }

    // 保存当前 serverErrors 以便下次比较
    prevServerErrorsRef.current = [...serverErrors];

    // 一次性收集所有错误
    const newErrors = {
      title: null as string | null,
      url: null as string | null,
      description: null as string | null,
      category: null as string | null,
      tags: null as string | null,
      others: [] as string[]
    };

    // 处理每个错误
    serverErrors.forEach(err => {
      if (!err || !err.path) {
        if (err && err.msg) newErrors.others.push(err.msg);
        return;
      }

      switch (err.path) {
        case 'title':
          newErrors.title = err.msg;
          break;
        case 'url':
          newErrors.url = err.msg;
          break;
        case 'description':
          newErrors.description = err.msg;
          break;
        case 'category':
          newErrors.category = err.msg;
          break;
        case 'tags':
          newErrors.tags = err.msg;
          break;
        default:
          if (err.msg) newErrors.others.push(err.msg);
          break;
      }
    });

    // 批量更新状态
    setServerTitleError(newErrors.title);
    setServerUrlError(newErrors.url);
    setServerDescriptionError(newErrors.description);
    setServerCategoryError(newErrors.category);
    setServerTagsError(newErrors.tags);
    setOtherServerErrors(newErrors.others);
  }, [serverErrors]);

  const validateForm = (): boolean => {
    let isValid = true;
    setTitleError(null);
    setUrlError(null);
    setCategoryError(null);
    setTagsError(null);
    setServerDescriptionError(null);

    if (!title.trim()) {
      setTitleError('标题不能为空。');
      isValid = false;
    } else if (title.trim().length < 3) {
      setTitleError('标题至少需要3个字符。');
      isValid = false;
    } else if (title.trim().length > 200) {
      setTitleError('标题不能超过200个字符。');
      isValid = false;
    }

    if (!url.trim()) {
      setUrlError('URL不能为空。');
      isValid = false;
    } else if (!URL_REGEX.test(url.trim())) {
      setUrlError('请输入有效的URL（以http://或https://开头）。');
      isValid = false;
    }

    // 分类选择验证
    if (!category) {
      setCategoryError('请选择一个分类。');
      isValid = false;
    }

    // 描述验证
    if (!description.trim()) {
      setServerDescriptionError('资源描述不能为空。');
      isValid = false;
    }

    // 标签验证
    const tags = tagsString
      .split(/[,\s]+/) // 按逗号或空格分割
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    if (tags.some(tag => tag.length > 5)) {
      setTagsError('每个标签不能超过5个字。');
      isValid = false;
    }
    
    // 如果输入框不为空，但解析后没有有效标签 (例如只有逗号或空格)
    if (tagsString.trim() !== '' && tags.length === 0) {
        setTagsError('请输入有效的标签。');
        isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 在提交前清除所有客户端错误
    setTitleError(null);
    setUrlError(null);
    setCategoryError(null);
    setTagsError(null);
    setServerDescriptionError(null);

    if (!validateForm()) {
      return;
    }

    const finalTags = tagsString
      .split(/[,\s]+/) // 按逗号或空格分割
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // 双重检查标签长度，以防万一
    if (finalTags.some(tag => tag.length > 5)) {
        setTagsError('每个标签不能超过5个字。');
        return;
    }

    const resourceData: CreateResourceData = {
      title: title.trim(),
      url: url.trim(),
      link: url.trim(),
      description: description.trim(),
      category,
      tags: finalTags,
    };

    try {
      console.log('提交资源数据:', resourceData);
      await onSubmit(resourceData);
    } catch (error) {
      console.error('表单提交处理器中的错误:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 显示服务器返回的其他错误 */}
      {otherServerErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
          <p className="text-red-600 dark:text-red-400 font-medium">请修正以下错误：</p>
          <ul className="list-disc list-inside mt-1 text-red-500">
            {otherServerErrors.map((err, idx) => (
              <li key={`other-error-${idx}`} className="text-sm">{err}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 基本信息 */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">资源标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-field w-full ${titleError || serverTitleError ? 'border-red-500' : ''}`}
              placeholder="请输入资源标题"
            />
            {(titleError || serverTitleError) && (
              <p className="text-red-500 text-sm mt-1">{titleError || serverTitleError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">资源分类 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`input-field w-full ${categoryError || serverCategoryError ? 'border-red-500' : ''}`}
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {(categoryError || serverCategoryError) && (
              <p className="text-red-500 text-sm mt-1">{categoryError || serverCategoryError}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">资源描述 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`input-field w-full h-32 ${serverDescriptionError ? 'border-red-500' : ''}`}
            placeholder="请详细描述资源内容、用途和特点"
          />
          {serverDescriptionError && (
            <p className="text-red-500 text-sm mt-1">{serverDescriptionError}</p>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">标签 (用空格分隔多个标签)</label>
          <input
            type="text"
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            className={`input-field w-full ${tagsError || serverTagsError ? 'border-red-500' : ''}`}
            placeholder="例如: 文学 古典 教育 诗歌"
          />
          <p className="text-sm text-gray-500 mt-1">输入相关标签，用空格分隔，有助于其他用户找到您的资源</p>
          {(tagsError || serverTagsError) && (
            <p className="text-red-500 text-sm mt-1">{tagsError || serverTagsError}</p>
          )}
        </div>
      </div>

      {/* 资源链接 */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">资源链接</h2>
        <div>
          <label className="block text-sm font-medium mb-2">资源链接 *</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`input-field w-full ${urlError || serverUrlError ? 'border-red-500' : ''}`}
            placeholder="请输入资源的访问链接，如：https://example.com/resource"
          />
          <p className="text-sm text-gray-500 mt-1">请确保链接有效且可以正常访问</p>
          {(urlError || serverUrlError) && (
            <p className="text-red-500 text-sm mt-1">{urlError || serverUrlError}</p>
          )}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? '提交中...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ResourceForm;