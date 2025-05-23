import mongoose, { Document, Schema } from 'mongoose';

// 定义Favorite文档的接口
export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 创建收藏模型Schema
const favoriteSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

// 创建复合索引，确保用户不能重复收藏同一资源
favoriteSchema.index({ user: 1, resource: 1 }, { unique: true });

// 使用 IFavorite 接口作为 Mongoose 模型的类型
// 并通过 mongoose.models 检查防止重复编译
const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);

export default Favorite; 