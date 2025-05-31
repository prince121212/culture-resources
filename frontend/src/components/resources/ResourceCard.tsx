import React from 'react';
import Link from 'next/link';
import { Resource, deleteResource } from '@/services/resource.service';
import { ApiError } from '@/services/auth.service';
import FavoriteButton from './FavoriteButton';
import toast from 'react-hot-toast';

interface ResourceCardProps {
  resource: Resource & { status?: string };
  currentUserId?: string | null;
  token?: string | null;
  onResourceDeleted?: () => void;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  currentUserId,
  token,
  onResourceDeleted,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const isUploader = typeof resource.uploader === 'object'
    ? resource.uploader._id === currentUserId
    : resource.uploader === currentUserId;

  // 辅助函数：获取分类名称
  const getCategoryName = (category: {name?: string} | string | null): string => {
    if (!category) return '未分类';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '未分类';
  };

  // 获取状态样式类
  const getStatusBadgeClass = (status?: string) => {
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
  const getStatusText = (status?: string) => {
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
        return status || '未知';
    }
  };

  return (
    <div className="card p-6">
      {/* 标题和收藏按钮区域 */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{resource.title}</h3>
        {showFavoriteButton && (
          <FavoriteButton
            resourceId={resource._id}
            initialIsFavorite={isFavorite || resource.isFavorite}
            onToggle={onFavoriteToggle}
            className="p-1"
          />
        )}
      </div>

      {/* 描述区域 */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{resource.description || '暂无描述'}</p>

      {/* 评分和访问量区域 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="rating-stars">★★★★★</div>
          <span className="text-sm text-gray-500">
            {resource.rating ? resource.rating.toFixed(1) : '0'}
          </span>
        </div>
        <span className="text-sm text-gray-500">访问 {resource.downloadCount || 0}</span>
      </div>

      {/* 标签区域 */}
      <div className="flex flex-wrap gap-1 mb-4">
        {resource.status && (
          <span className="tag">{getStatusText(resource.status)}</span>
        )}
        {resource.category && (
          <span className="tag">{getCategoryName(resource.category)}</span>
        )}
        {resource.tags && resource.tags.slice(0, 2).map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>

      {/* 上传者和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {typeof resource.uploader === 'object' ? (
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
              {resource.uploader.username ? resource.uploader.username.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-medium">
              U
            </div>
          )}
          <span className="text-sm text-gray-600">
            {typeof resource.uploader === 'object' ? resource.uploader.username : '未知用户'}
          </span>
        </div>
        <Link href={`/resources/${resource._id}`} className="btn-primary text-sm px-4 py-2">
          访问资源
        </Link>
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