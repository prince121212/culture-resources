import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IResource } from './resource.model';

// 定义DownloadHistory文档的接口
export interface IDownloadHistory extends Document {
  user: IUser['_id']; 
  resource: IResource['_id']; 
  downloadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 创建下载历史模型Schema
const downloadHistorySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    downloadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 使用 IDownloadHistory 接口作为 Mongoose 模型的类型
// 并通过 mongoose.models 检查防止重复编译
const DownloadHistory = mongoose.models.DownloadHistory || mongoose.model<IDownloadHistory>('DownloadHistory', downloadHistorySchema);

export default DownloadHistory; 