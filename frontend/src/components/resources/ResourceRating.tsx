'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RatingStars from './RatingStars';
import { rateResource, getUserRating, getResourceRatingStats, ResourceRatingStats } from '@/services/rating.service';
import { ApiError } from '@/services/auth.service';
import toast from 'react-hot-toast';

interface ResourceRatingProps {
  resourceId: string;
  onRatingChange?: (newAverageRating: number) => void;
}

const ResourceRating: React.FC<ResourceRatingProps> = ({ resourceId, onRatingChange }) => {
  const { isAuthenticated, token, user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingStats, setRatingStats] = useState<ResourceRatingStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取用户评分和资源评分统计
  useEffect(() => {
    const fetchRatingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 获取资源评分统计
        const stats = await getResourceRatingStats(resourceId);
        setRatingStats(stats);
        
        // 如果用户已登录，获取用户对该资源的评分
        if (isAuthenticated && token) {
          try {
            const userRatingData = await getUserRating(resourceId, token);
            if (userRatingData) {
              setUserRating(userRatingData.rating);
            }
          } catch (err) {
            // 如果是404错误，表示用户尚未评分，不需要显示错误
            if (!(err instanceof ApiError && err.status === 404)) {
              console.error('获取用户评分失败:', err);
            }
          }
        }
      } catch (err) {
        console.error('获取评分数据失败:', err);
        setError(err instanceof ApiError ? err.message : '获取评分数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (resourceId) {
      fetchRatingData();
    }
  }, [resourceId, isAuthenticated, token]);

  // 处理评分提交
  const handleRatingChange = async (rating: number) => {
    if (!isAuthenticated || !token) {
      toast.error('请先登录后再评分');
      return;
    }

    setIsSubmitting(true);
    try {
      await rateResource(resourceId, rating, token);
      setUserRating(rating);
      
      // 重新获取评分统计
      const updatedStats = await getResourceRatingStats(resourceId);
      setRatingStats(updatedStats);
      
      // 通知父组件评分已更新
      if (onRatingChange) {
        onRatingChange(updatedStats.averageRating);
      }
      
      toast.success('评分成功！');
    } catch (err) {
      console.error('评分失败:', err);
      toast.error(err instanceof ApiError ? err.message : '评分失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">加载评分数据中...</div>;
  }

  if (error) {
    return <div className="text-red-500">加载评分数据失败: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">资源评分</h3>
      
      {/* 评分统计 */}
      {ratingStats && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
              {ratingStats.averageRating.toFixed(1)}
            </span>
            <RatingStars 
              initialRating={ratingStats.averageRating} 
              readOnly 
              size="md" 
            />
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({ratingStats.totalRatings} 人评分)
            </span>
          </div>
          
          {/* 评分分布 */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.ratingDistribution[star as keyof typeof ratingStats.ratingDistribution];
              const percentage = ratingStats.totalRatings > 0 
                ? Math.round((count / ratingStats.totalRatings) * 100) 
                : 0;
              
              return (
                <div key={star} className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{star} 星</span>
                  <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 用户评分 */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
          {userRating > 0 ? '您的评分' : '为此资源评分'}
        </h4>
        <div className="flex items-center">
          <RatingStars 
            initialRating={userRating} 
            onRatingChange={handleRatingChange} 
            size="lg" 
            showRatingText
            readOnly={isSubmitting}
          />
          {isSubmitting && (
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              提交中...
            </span>
          )}
        </div>
        {!isAuthenticated && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            请先登录后再评分
          </p>
        )}
      </div>
    </div>
  );
};

export default ResourceRating;
