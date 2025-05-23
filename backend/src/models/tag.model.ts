import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  description?: string;
  count: number; // 使用该标签的资源数量
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema<ITag> = new Schema(
  {
    name: {
      type: String,
      required: [true, '标签名称是必填项'],
      trim: true,
      maxlength: [30, '标签名称不能超过30个字符'],
      unique: true, // 标签名称必须唯一
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, '标签描述不能超过200个字符'],
    },
    count: {
      type: Number,
      default: 0, // 初始使用次数为0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // 自动管理createdAt和updatedAt字段
  }
);

// 添加索引以提高查询性能
// name字段已经通过unique: true自动创建了索引，不需要再次添加
TagSchema.index({ count: -1 }); // 按使用次数降序索引，用于查询热门标签
TagSchema.index({ isActive: 1 });

const Tag: Model<ITag> = mongoose.model<ITag>('Tag', TagSchema);

export default Tag;
