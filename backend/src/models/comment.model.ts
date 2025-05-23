import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  resource: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId | null;
  replyTo?: {
    _id?: Types.ObjectId;
    username?: string;
  } | null;
  likes: number;
  likedBy: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replyTo: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      username: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 创建索引以提高查询性能
CommentSchema.index({ resource: 1, parentId: 1 });
CommentSchema.index({ author: 1 });

const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment; 