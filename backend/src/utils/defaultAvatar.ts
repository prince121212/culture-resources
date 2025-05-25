/**
 * 默认头像工具函数
 */

import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/gridfs';

let defaultAvatarId: string | null = null;

/**
 * 获取默认头像的GridFS ID
 * 如果缓存中没有，则从数据库查询
 */
export async function getDefaultAvatarId(): Promise<string | null> {
  try {
    // 如果已经缓存了默认头像ID，直接返回
    if (defaultAvatarId) {
      return defaultAvatarId;
    }

    // 从GridFS查询默认头像
    const gfs = getGridFSBucket();
    const files = await gfs.find({
      'metadata.isDefaultAvatar': true
    }).toArray();

    if (files.length > 0) {
      defaultAvatarId = files[0]._id.toString();
      console.log(`[getDefaultAvatarId] Found default avatar with ID: ${defaultAvatarId}`);
      return defaultAvatarId;
    }

    console.log('[getDefaultAvatarId] No default avatar found in database');
    return null;
  } catch (error) {
    console.error('[getDefaultAvatarId] Error getting default avatar ID:', error);
    return null;
  }
}

/**
 * 清除默认头像ID缓存
 * 当默认头像被重新上传时调用
 */
export function clearDefaultAvatarCache(): void {
  defaultAvatarId = null;
  console.log('[clearDefaultAvatarCache] Default avatar cache cleared');
}

/**
 * 设置默认头像ID缓存
 * 当上传新的默认头像时调用
 */
export function setDefaultAvatarId(id: string): void {
  defaultAvatarId = id;
  console.log(`[setDefaultAvatarId] Default avatar ID set to: ${id}`);
}
