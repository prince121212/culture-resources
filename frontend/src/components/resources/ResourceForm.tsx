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

    if (!title.trim()) {
      setTitleError('标题不能为空。');
      isValid = false;
    }

    if (!url.trim()) {
      setUrlError('URL不能为空。');
      isValid = false;
    } else if (!URL_REGEX.test(url.trim())) {
      setUrlError('请输入有效的URL（以http://或https://开头）。');
      isValid = false;
    }

    // 新增：分类选择验证
    if (!category) {
      setCategoryError('请选择一个分类。');
      isValid = false;
    }
    
    // 新增：标签验证
    const tags = tagsString
      .split(/[,\\s]+/) // 按逗号或空格分割
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
    // 在提交前清除客户端错误，以便validateForm可以重新设置它们
    setCategoryError(null);
    setTagsError(null);
    
    if (!validateForm()) {
      return;
    }
    
    const finalTags = tagsString
      .split(/[,\\s]+/) // 按逗号或空格分割
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // 双重检查标签长度，以防万一
    if (finalTags.some(tag => tag.length > 5)) {
        setTagsError('每个标签不能超过5个字。');
        return; 
    }
      
    const resourceData: CreateResourceData = {
      title,
      url,
      link: url,  // 同时提供link字段
      description,
      category,
      tags: finalTags,
    };
    
    try {
      await onSubmit(resourceData);
    } catch (error) {
      console.error('Error in form submission handler:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
      {/* Display other server errors */}
      {otherServerErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">请更正以下错误：</h3>
            <ul className="list-disc list-inside text-sm text-red-700">
              {otherServerErrors.map((errMsg, index) => (
                <li key={`server-other-${index}`}>{errMsg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(titleError || serverTitleError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
        {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
        {serverTitleError && <p className="mt-1 text-xs text-red-600">{serverTitleError}</p>}
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          链接 <span className="text-red-500">*</span>
        </label>
        <input
          type="url" 
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/resource"
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(urlError || serverUrlError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
        {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
        {serverUrlError && <p className="mt-1 text-xs text-red-600">{serverUrlError}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${serverDescriptionError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
        {serverDescriptionError && <p className="mt-1 text-xs text-red-600">{serverDescriptionError}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          分类 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCategoryError(null);
          }}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(categoryError || serverCategoryError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
        >
          <option value="">请选择一个分类</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
        {serverCategoryError && <p className="mt-1 text-xs text-red-600">{serverCategoryError}</p>}
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          标签 (逗号或空格分隔，每个标签最多5个字)
        </label>
        <input
          type="text"
          id="tags"
          value={tagsString}
          onChange={(e) => {
            setTagsString(e.target.value);
            setTagsError(null);
          }}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(tagsError || serverTagsError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
          placeholder="例如：js, react, 教程"
        />
        {tagsError && <p className="mt-1 text-xs text-red-600">{tagsError}</p>}
        {serverTagsError && <p className="mt-1 text-xs text-red-600">{serverTagsError}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? '提交中...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ResourceForm;