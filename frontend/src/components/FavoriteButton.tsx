import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface FavoriteButtonProps {
  resourceId: string;
  initialIsFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

const FavoriteButton = ({ resourceId, initialIsFavorited = false, onFavoriteChange }: FavoriteButtonProps) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, resourceId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/favorite/status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsFavorited(response.data.isFavorited);
    } catch (err) {
      console.error('获取收藏状态失败:', err);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      // 如果用户未登录,可以在这里添加提示或跳转到登录页面
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/favorite`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/resources/${resourceId}/favorite`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      setIsFavorited(!isFavorited);
      onFavoriteChange?.(!isFavorited);
    } catch (err) {
      console.error('收藏操作失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavorite}
      disabled={isLoading}
      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
        isFavorited
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          className={`-ml-1 mr-2 h-4 w-4 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={isFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {isFavorited ? '已收藏' : '收藏'}
    </button>
  );
};

export default FavoriteButton; 