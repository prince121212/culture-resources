import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | null;
  level: number;
  order: number;
  path: string; // 存储分类路径，例如 "根分类/子分类/孙分类"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, '分类名称是必填项'],
      trim: true,
      maxlength: [50, '分类名称不能超过50个字符'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '分类描述不能超过500个字符'],
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 1, // 1表示顶级分类，2表示二级分类，以此类推
    },
    order: {
      type: Number,
      default: 0, // 用于同级分类的排序
    },
    path: {
      type: String,
      default: '', // 存储分类路径，例如 "根分类/子分类/孙分类"
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
// 移除name索引以解决重复索引警告
CategorySchema.index({ parent: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ isActive: 1 });

// 保存前更新path字段
CategorySchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('parent') || this.isModified('name')) {
      // 如果是顶级分类
      if (!this.parent) {
        this.level = 1;
        this.path = this.name;
      } else {
        // 如果是子分类，查找父分类并构建路径
        const parentCategory = await mongoose.model('Category').findById(this.parent);
        if (!parentCategory) {
          throw new Error('父分类不存在');
        }
        this.level = parentCategory.level + 1;
        this.path = `${parentCategory.path}/${this.name}`;
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
