import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { Request } from 'express';

let gridFSBucket: GridFSBucket;

// 初始化GridFS
export const initGridFS = (connection: mongoose.Connection) => {
  if (!connection.db) {
    throw new Error('Database connection not established');
  }
  
  gridFSBucket = new GridFSBucket(connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS initialized');
  return gridFSBucket;
};

// 获取GridFS实例
export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS is not initialized');
  }
  return gridFSBucket;
};

// 内存存储Multer配置
export const storage = multer.memoryStorage();

// 文件过滤器
export const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)') as any);
  }
};

// 配置Multer中间件
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter
});

// 通过ID获取文件
export const getFileById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid file ID');
  }

  return new Promise((resolve, reject) => {
    try {
      const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(id));
      
      downloadStream.on('error', (error) => {
        reject(error);
      });

      resolve(downloadStream);
    } catch (error) {
      reject(error);
    }
  });
};

// 保存文件到GridFS并返回文件ID
export const saveFileToGridFS = async (
  file: Express.Multer.File, 
  metadata: object = {}
): Promise<mongoose.Types.ObjectId> => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata
      });

      // 写入文件数据到GridFS
      uploadStream.write(file.buffer);
      uploadStream.end();

      uploadStream.on('finish', function() {
        resolve(uploadStream.id);
      });

      uploadStream.on('error', function(error) {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}; 