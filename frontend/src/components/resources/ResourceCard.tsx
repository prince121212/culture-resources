import React from 'react';
import Link from 'next/link';
import { Resource, deleteResource } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import { downloadResource } from '@/services/download.service';
import FavoriteButton from './FavoriteButton';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ResourceCardProps {
  resource: Resource;
  currentUserId?: string | null;
  token?: string | null;
  onResourceDeleted?: () => void;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  showDownloadDate?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  currentUserId,
  token,
  onResourceDeleted,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle,
  showDownloadDate = false
}) => {
  const isUploader = typeof resource.uploader === 'object'
    ? resource.uploader._id === currentUserId
    : resource.uploader === currentUserId;

  // 格式化日期
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };

  // 辅助函数：获取分类名称
  const getCategoryName = (category: any): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  // 获取状态样式类
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'terminated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // 获取状态文本
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

  // 处理下载资源
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await downloadResource(resource._id, token);
    } catch (error) {
      console.error('下载资源失败', error);
      toast.error('下载失败，请稍后重试');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Link href={`/resources/${resource._id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
              {resource.title}
            </h3>
          </Link>
          {showFavoriteButton && (
            <FavoriteButton
              resourceId={resource._id}
              initialIsFavorite={isFavorite || resource.isFavorite}
              onToggle={onFavoriteToggle}
            />
          )}
        </div>

        {resource.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{resource.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {/* 状态标签 */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(resource.status)}`}>
            {getStatusText(resource.status)}
          </span>
          {resource.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {getCategoryName(resource.category)}
            </span>
          )}
          {resource.tags && resource.tags.length > 0 && resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          <p>
            上传者: {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
          </p>
          <p>
            上传时间: {formatDate(resource.createdAt)}
          </p>
          <p>
            下载次数: {resource.downloadCount}
          </p>
          {showDownloadDate && resource.downloadDate && (
            <p>
              下载时间: {formatDate(resource.downloadDate)}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {/* 隐藏下载资源按钮 */}
            {/* <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              下载资源
            </a> */}
            <Link
              href={`/resources/${resource._id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              查看详情
            </Link>
          </div>

          {isUploader && (
            <div className="flex space-x-2">
              <Link
                href={`/resources/${resource._id}/edit`}
                className="text-xs text-yellow-600 dark:text-yellow-500 hover:text-yellow-800 dark:hover:text-yellow-400"
              >
                编辑
              </Link>
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  async function handleDelete() {
    if (!token) {
      toast.error('请先登录');
      return;
    }
    if (window.confirm('确定要删除这个资源吗？此操作无法撤销。')) {
      try {
        await deleteResource(resource._id, token);
        toast.success('资源删除成功！');
        if (onResourceDeleted) {
          onResourceDeleted(); // 调用回调函数刷新列表
        }
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.message + (err.response?.message ? `: ${err.response.message}` : ''));
        } else if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('删除资源时发生未知错误');
        }
      }
    }
  }
};

export default ResourceCard;