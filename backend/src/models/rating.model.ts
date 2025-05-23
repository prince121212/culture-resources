import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRating extends Document {
  resource: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema<IRating> = new Schema(
  {
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// 创建复合索引，确保每个用户对每个资源只能有一个评分
RatingSchema.index({ resource: 1, user: 1 }, { unique: true });

const Rating = mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;
