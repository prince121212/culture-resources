import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IResource extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  link: string;
  uploader: Types.ObjectId; // Reference to the User who uploaded the resource
  category?: string | Types.ObjectId; // Can be string or ObjectId
  tags?: string[]; // Initially an array of strings, can be array of ObjectIds later
  downloadCount: number;
  rating: number; // 平均评分
  ratingCount: number; // 评分数量
  status: string; // 资源状态：draft(草稿), pending(待审核), approved(已发布), rejected(已拒绝), terminated(已终止)
  reviewedBy?: Types.ObjectId; // 审核人
  reviewedAt?: Date; // 审核时间
  rejectReason?: string; // 拒绝原因
  version: number; // 资源版本号
  isPublic: boolean; // 是否公开
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema<IResource> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      unique: true, // Assuming resource links should be unique
      trim: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    category: {
      type: Schema.Types.Mixed, // Can be String or ObjectId
      trim: true,
    },
    tags: {
      type: [String], // For now, array of simple strings. Later, can be [Schema.Types.ObjectId], ref: 'Tag'
      default: [],
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'terminated'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectReason: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Indexing for potentially frequently queried fields
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });
ResourceSchema.index({ status: 1 }); // 索引资源状态字段，便于快速查询不同状态的资源
ResourceSchema.index({ uploader: 1, status: 1 }); // 索引上传者和状态，便于查询用户的不同状态资源

const Resource: Model<IResource> = mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;