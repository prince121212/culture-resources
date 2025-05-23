import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId; // 通知接收者
  type: string; // 通知类型：resource_approved, resource_rejected, comment_received 等
  title: string; // 通知标题
  content: string; // 通知内容
  resourceId?: Types.ObjectId; // 相关资源ID（如果有）
  commentId?: Types.ObjectId; // 相关评论ID（如果有）
  isRead: boolean; // 是否已读
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'resource_approved', // 资源审核通过
        'resource_rejected', // 资源审核拒绝
        'resource_terminated', // 资源链接失效
        'comment_received', // 收到评论
        'rating_received', // 收到评分
        'system_notice', // 系统通知
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// 索引用户ID，便于快速查询用户的通知
NotificationSchema.index({ user: 1 });
// 索引用户ID和已读状态，便于查询用户的未读通知
NotificationSchema.index({ user: 1, isRead: 1 });
// 索引创建时间，便于按时间排序
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
