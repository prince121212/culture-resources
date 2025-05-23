'use client';

import React, { useState } from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface RatingStarsProps {
  initialRating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  showRatingText?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  initialRating = 0,
  maxRating = 5,
  size = 'md',
  readOnly = false,
  onRatingChange,
  showRatingText = false,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // 根据size确定星星大小
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  // 处理点击事件
  const handleClick = (selectedRating: number) => {
    if (readOnly) return;
    
    // 如果点击当前已选中的星星，则取消选择（评分为0）
    const newRating = selectedRating === rating ? 0 : selectedRating;
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  // 处理鼠标悬停事件
  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return;
    setHoverRating(hoveredRating);
  };

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  // 获取评分文本
  const getRatingText = () => {
    const displayRating = hoverRating || rating;
    if (displayRating === 0) return '未评分';
    
    const ratingTexts = ['很差', '较差', '一般', '不错', '很好'];
    return ratingTexts[Math.min(displayRating - 1, ratingTexts.length - 1)];
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverRating || rating);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none transition-colors duration-150`}
              disabled={readOnly}
              aria-label={`${starValue} 星`}
            >
              {isFilled ? (
                <StarSolid className={`${getStarSize()} text-yellow-400`} />
              ) : (
                <StarOutline className={`${getStarSize()} text-gray-300 dark:text-gray-600`} />
              )}
            </button>
          );
        })}
      </div>
      
      {showRatingText && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {getRatingText()}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
