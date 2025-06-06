'use client';

import React, { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toggleFavorite } from '@/services/favorite.service';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoriteContext';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  resourceId: string;
  initialIsFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  resourceId,
  initialIsFavorite = false,
  onToggle,
  className = '',
}) => {
  const { token, isAuthenticated } = useAuth();
  const { isFavorite: isGloballyFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  // 使用全局收藏状态，如果全局状态还在加载中则使用初始值
  const isFavorite = isGloballyFavorite(resourceId);

  // 处理收藏/取消收藏
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (!token) {
      toast.error('登录状态已过期，请重新登录');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // 乐观更新：立即更新UI状态
    const newFavoriteState = !isFavorite;
    if (newFavoriteState) {
      addFavorite(resourceId);
    } else {
      removeFavorite(resourceId);
    }

    try {
      const result = await toggleFavorite(resourceId, isFavorite, token);
      toast.success(result.message);

      // 通知父组件状态变化
      if (onToggle) {
        onToggle(result.isFavorite);
      }
    } catch (error) {
      // 如果请求失败，回滚状态
      if (newFavoriteState) {
        removeFavorite(resourceId);
      } else {
        addFavorite(resourceId);
      }

      console.error('切换收藏状态失败', error);
      if (error instanceof Error) {
        toast.error(`操作失败: ${error.message}`);
      } else {
        toast.error('操作失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`focus:outline-none transition-all duration-200 hover:scale-110 border-0 ${className}`}
      aria-label={isFavorite ? '取消收藏' : '收藏'}
      title={isFavorite ? '取消收藏' : '收藏'}
      style={{ zIndex: 1000, position: 'relative' }}
    >
      {isFavorite ? (
        <HeartSolid className="h-8 w-8 text-red-500 drop-shadow-sm" />
      ) : (
        <HeartOutline className="h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200" />
      )}
    </button>
  );
};

export default FavoriteButton;
