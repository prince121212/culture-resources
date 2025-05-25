const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

/**
 * 下载资源
 */
export const downloadResource = async (
  resourceId: string,
  token: string | null
): Promise<void> => {
  try {
    // 增加资源的下载计数
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/resources/${resourceId}/increment-download`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('增加下载计数失败', error);
        // 即使记录失败，也继续下载
      }
    }

    // 打开资源链接
    window.open(`${API_BASE_URL}/resources/${resourceId}/download`, '_blank');
  } catch (error) {
    console.error('下载资源失败', error);
    throw new Error('下载资源失败');
  }
};
