import { ApiError } from './auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// 设置类型枚举
export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
}

// 设置分组枚举
export enum SettingGroup {
  GENERAL = 'general',         // 一般设置
  CONTENT = 'content',         // 内容设置
  USER = 'user',               // 用户设置
  NOTIFICATION = 'notification', // 通知设置
  SECURITY = 'security',       // 安全设置
  ADVANCED = 'advanced',       // 高级设置
}

// 设置选项接口
export interface SettingOption {
  label: string;
  value: any;
}

// 设置接口
export interface Setting {
  _id: string;
  key: string;
  value: any;
  type: SettingType;
  group: SettingGroup;
  label: string;
  description?: string;
  options?: SettingOption[];
  defaultValue: any;
  isPublic: boolean;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// 分组后的设置接口
export interface GroupedSettings {
  [key: string]: Setting[];
}

/**
 * 获取所有设置
 * @param token JWT令牌
 * @param group 可选的设置分组
 * @returns 分组后的设置
 */
export const getSettings = async (token?: string, group?: string): Promise<GroupedSettings> => {
  try {
    const url = new URL(`${API_BASE_URL}/settings`);
    
    if (group) {
      url.searchParams.append('group', group);
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || '获取设置失败');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '获取设置时发生错误');
  }
};

/**
 * 获取单个设置
 * @param key 设置键名
 * @param token JWT令牌
 * @returns 设置对象
 */
export const getSettingByKey = async (key: string, token?: string): Promise<Setting> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || '获取设置失败');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '获取设置时发生错误');
  }
};

/**
 * 更新单个设置
 * @param key 设置键名
 * @param value 设置值
 * @param token JWT令牌
 * @returns 更新后的设置
 */
export const updateSetting = async (key: string, value: any, token: string): Promise<Setting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || '更新设置失败');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '更新设置时发生错误');
  }
};

/**
 * 批量更新设置
 * @param settings 要更新的设置数组，每项包含key和value
 * @param token JWT令牌
 * @returns 更新结果
 */
export const updateSettings = async (settings: { key: string; value: any }[], token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ settings }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || '批量更新设置失败');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '批量更新设置时发生错误');
  }
};

/**
 * 初始化默认设置
 * @param token JWT令牌
 * @returns 初始化结果
 */
export const initializeSettings = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.message || '初始化设置失败');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '初始化设置时发生错误');
  }
};
