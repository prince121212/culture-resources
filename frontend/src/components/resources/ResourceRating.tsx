'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RatingStars from './RatingStars';
import { rateResource, getUserRating, getResourceRatingStats, ResourceRatingStats } from '@/services/rating.service';
import { ApiError } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ResourceRatingProps {
  resourceId: string;
  onRatingChange?: (newAverageRating: number) => void;
}

const ResourceRating: React.FC<ResourceRatingProps> = ({ resourceId, onRatingChange }) => {
  const { isAuthenticated, token } = useAuth();
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
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-amber-700">加载评分数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-50 rounded-xl p-6 border border-red-100">
        <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* 评分统计 */}
      {ratingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧评分概览 */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div className="sm:mr-4">
                <div className="text-5xl font-bold text-amber-600">
                  {ratingStats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {ratingStats.totalRatings} 人评分
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <RatingStars
                  initialRating={ratingStats.averageRating}
                  readOnly
                  size="md"
                />
              </div>
            </div>
            
            {/* 用户评分 */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h4 className="text-lg font-medium text-gray-800 mb-3">
                {userRating > 0 ? '您的评分' : '为此资源评分'}
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <RatingStars
                  initialRating={userRating}
                  onRatingChange={handleRatingChange}
                  size="lg"
                  showRatingText
                  readOnly={isSubmitting}
                />
                {isSubmitting && (
                  <div className="sm:ml-3 flex items-center">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-amber-600">提交中...</span>
                  </div>
                )}
              </div>
              {!isAuthenticated && (
                <div className="mt-3 p-2 bg-amber-100/50 rounded text-sm text-amber-700">
                  请<Link href="/auth/login" className="text-orange-600 font-medium mx-1 hover:text-orange-700">登录</Link>后再评分
                </div>
              )}
            </div>
          </div>
          
          {/* 右侧评分分布 */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-4">评分分布</h4>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.ratingDistribution[star as keyof typeof ratingStats.ratingDistribution];
                const percentage = ratingStats.totalRatings > 0 
                  ? Math.round((count / ratingStats.totalRatings) * 100) 
                  : 0;
                
                return (
                  <div key={star} className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-8">{star} 星</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-orange-400 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-14">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceRating;
