import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// 之前定义的IUser接口可以保留作为类型参考，或者直接在Schema中定义
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id for better type safety
  username: string;
  email: string;
  password?: string; // Optional on interface because it's selected out or handled by model logic
  role: string;
  points: number;
  status: string;
  avatar?: string; // 添加头像字段
  createdAt?: Date;
  updatedAt?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>; // Add method to interface
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Password field will not be returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    points: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: null, // 将通过脚本设置默认头像的GridFS ID
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Mongoose pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // If error is already an instance of Error, just pass it.
    // Otherwise, create a new Error object.
    // This helps in better error handling down the line.
    if (error instanceof Error) {
        return next(error);
    }
    next(new Error('Error hashing password'));
  }
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // this.password will be available here because we will .select('+password') in login controller
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// 修改模型创建方式，防止重复编译错误
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;