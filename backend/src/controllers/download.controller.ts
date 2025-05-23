import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import Resource, { IResource } from '../models/resource.model';
import DownloadHistory, { IDownloadHistory } from '../models/downloadHistory.model';

/**
 * @desc    记录资源下载
 * @route   POST /api/resources/:id/download
 * @access  Private
 */
export const recordDownload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      res.status(400).json({ message: '无效的资源ID' });
      return;
    }

    // 检查资源是否存在
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      res.status(404).json({ message: '资源不存在' });
      return;
    }

    // 创建下载记录
    const downloadRecord = new DownloadHistory({
      user: userId,
      resource: resourceId,
      downloadDate: new Date(),
    });

    await downloadRecord.save();

    // 增加资源的下载计数
    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });

    res.status(201).json({ message: '下载记录已保存' });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取用户的下载历史
 * @route   GET /api/downloads
 * @access  Private
 */
export const getDownloadHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalDownloads = await DownloadHistory.countDocuments({ user: userId });
    
    const downloads = await DownloadHistory.find({ user: userId })
      .populate<{
        resource: IResource & { uploader: { username: string; email: string } };
      }>({
        path: 'resource',
        populate: {
          path: 'uploader',
          select: 'username email'
        }
      })
      .sort({ downloadDate: -1 })
      .skip(skip)
      .limit(limit) as (IDownloadHistory & { resource: IResource & { uploader: { username: string; email: string } } })[];

    // 提取资源数据并添加下载日期
    const resources = downloads.map((download: IDownloadHistory & { resource: IResource & { uploader: { username: string; email: string } } }) => {
      if (download.resource && typeof download.resource === 'object' && 'toObject' in download.resource) {
        const resourceObj = (download.resource as any).toObject();
        return {
          ...resourceObj,
          downloadDate: download.downloadDate
        };
      }
      return {
        _id: download.resource,
        downloadDate: download.downloadDate 
      };
    });

    res.status(200).json({
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDownloads / limit),
        totalResources: totalDownloads,
        limit,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  recordDownload,
  getDownloadHistory,
};
