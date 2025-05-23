import mongoose, { Schema, Document, Model } from 'mongoose';

// 定义设置类型枚举
export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
}

// 定义设置分组枚举
export enum SettingGroup {
  GENERAL = 'general',         // 一般设置
  CONTENT = 'content',         // 内容设置
  USER = 'user',               // 用户设置
  NOTIFICATION = 'notification', // 通知设置
  SECURITY = 'security',       // 安全设置
  ADVANCED = 'advanced',       // 高级设置
}

// 定义设置接口
export interface ISetting extends Document {
  key: string;                 // 设置键名，唯一
  value: any;                  // 设置值
  type: SettingType;           // 设置类型
  group: SettingGroup;         // 设置分组
  label: string;               // 设置标签（显示名称）
  description?: string;        // 设置描述
  options?: any[];             // 可选值（用于下拉选择等）
  defaultValue: any;           // 默认值
  isPublic: boolean;           // 是否公开（可以被前端非管理员访问）
  isRequired: boolean;         // 是否必填
  order: number;               // 排序值
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema<ISetting> = new Schema(
  {
    key: {
      type: String,
      required: [true, '设置键名是必填项'],
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, '设置值是必填项'],
    },
    type: {
      type: String,
      enum: Object.values(SettingType),
      required: [true, '设置类型是必填项'],
    },
    group: {
      type: String,
      enum: Object.values(SettingGroup),
      required: [true, '设置分组是必填项'],
    },
    label: {
      type: String,
      required: [true, '设置标签是必填项'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    options: {
      type: [Schema.Types.Mixed],
    },
    defaultValue: {
      type: Schema.Types.Mixed,
      required: [true, '默认值是必填项'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
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
// key字段已经通过unique: true自动创建了索引，不需要再次添加
SettingSchema.index({ group: 1 });
SettingSchema.index({ isPublic: 1 });

// 保存前验证值类型
SettingSchema.pre('save', function (next) {
  try {
    const setting = this;

    // 根据设置类型验证值
    switch (setting.type) {
      case SettingType.STRING:
        if (typeof setting.value !== 'string') {
          throw new Error(`设置 ${setting.key} 的值必须是字符串类型`);
        }
        break;
      case SettingType.NUMBER:
        if (typeof setting.value !== 'number') {
          throw new Error(`设置 ${setting.key} 的值必须是数字类型`);
        }
        break;
      case SettingType.BOOLEAN:
        if (typeof setting.value !== 'boolean') {
          throw new Error(`设置 ${setting.key} 的值必须是布尔类型`);
        }
        break;
      case SettingType.JSON:
        try {
          if (typeof setting.value === 'string') {
            JSON.parse(setting.value);
          } else if (typeof setting.value !== 'object') {
            throw new Error(`设置 ${setting.key} 的值必须是有效的JSON对象或字符串`);
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`设置 ${setting.key} 的值必须是有效的JSON: ${error.message}`);
          }
          throw new Error(`设置 ${setting.key} 的值必须是有效的JSON`);
        }
        break;
      case SettingType.ARRAY:
        if (!Array.isArray(setting.value)) {
          throw new Error(`设置 ${setting.key} 的值必须是数组类型`);
        }
        break;
    }

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('设置验证失败'));
    }
  }
});

const Setting: Model<ISetting> = mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
