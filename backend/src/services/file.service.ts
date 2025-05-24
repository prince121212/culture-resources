import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { Readable } from 'stream';

// 获取当前的MongoDB连接
const getMongoConnection = async () => {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources';
  
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }
  
  const client = await MongoClient.connect(mongoUrl);
  return client.db();
};

// 创建GridFS Bucket
const getBucket = async (bucketName = 'avatars') => {
  const db = await getMongoConnection();
  return new GridFSBucket(db, { bucketName });
};

// 上传文件到GridFS
export const uploadFileToGridFS = async (
  file: Buffer | Readable,
  filename: string,
  metadata: any = {},
  bucketName = 'avatars'
): Promise<ObjectId> => {
  const bucket = await getBucket(bucketName);
  
  let fileStream: Readable;
  if (Buffer.isBuffer(file)) {
    fileStream = new Readable();
    fileStream.push(file);
    fileStream.push(null);
  } else {
    fileStream = file;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata
    });
    
    fileStream.pipe(uploadStream);
    
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });
  });
};

// 从GridFS获取文件
export const getFileFromGridFS = async (
  fileId: string,
  bucketName = 'avatars'
): Promise<{ file: Readable; metadata: any; contentType: string }> => {
  try {
    const bucket = await getBucket(bucketName);
    const id = new ObjectId(fileId);
    
    // 获取文件元数据
    const cursor = bucket.find({ _id: id });
    const files = await cursor.toArray();
    
    if (!files || files.length === 0) {
      throw new Error('找不到文件');
    }
    
    const metadata = files[0].metadata || {};
    const contentType = files[0].contentType || 'application/octet-stream';
    
    // 获取文件流
    const downloadStream = bucket.openDownloadStream(id);
    
    return {
      file: downloadStream,
      metadata,
      contentType
    };
  } catch (error) {
    throw new Error(`获取文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 删除GridFS中的文件
export const deleteFileFromGridFS = async (
  fileId: string,
  bucketName = 'avatars'
): Promise<void> => {
  try {
    const bucket = await getBucket(bucketName);
    const id = new ObjectId(fileId);
    await bucket.delete(id);
  } catch (error) {
    throw new Error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}; 