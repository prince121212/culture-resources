'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getFavoriteResourceIds } from '@/services/favorite.service';

interface FavoriteContextType {
  favoriteResourceIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  isFavorite: (resourceId: string) => boolean;
  addFavorite: (resourceId: string) => void;
  removeFavorite: (resourceId: string) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

interface FavoriteProviderProps {
  children: ReactNode;
}

export const FavoriteProvider: React.FC<FavoriteProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [favoriteResourceIds, setFavoriteResourceIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取所有收藏的资源ID
  const fetchAllFavorites = async () => {
    if (!isAuthenticated || !token) {
      setFavoriteResourceIds(new Set());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 使用新的高效API一次性获取所有收藏的资源ID
      const favoriteIds = await getFavoriteResourceIds(token);
      setFavoriteResourceIds(new Set(favoriteIds));
    } catch (err) {
      console.error('获取收藏列表失败:', err);
      setError('获取收藏列表失败');
      setFavoriteResourceIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时获取收藏列表
  useEffect(() => {
    fetchAllFavorites();
  }, [token, isAuthenticated]);

  // 检查资源是否被收藏
  const isFavorite = (resourceId: string): boolean => {
    return favoriteResourceIds.has(resourceId);
  };

  // 添加收藏
  const addFavorite = (resourceId: string) => {
    setFavoriteResourceIds(prev => new Set([...prev, resourceId]));
  };

  // 移除收藏
  const removeFavorite = (resourceId: string) => {
    setFavoriteResourceIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(resourceId);
      return newSet;
    });
  };

  // 刷新收藏列表
  const refreshFavorites = async () => {
    await fetchAllFavorites();
  };

  const value: FavoriteContextType = {
    favoriteResourceIds,
    isLoading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    refreshFavorites,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = (): FavoriteContextType => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
