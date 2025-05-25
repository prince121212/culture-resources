/**
 * 数据库迁移脚本：更新现有用户的头像字段
 * 将所有 avatar 字段为 null 的用户更新为 'default'
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources-db';

// 用户模型定义
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  avatar: { type: String, default: 'default' },
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function migrateUserAvatars() {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 查找所有 avatar 字段为 null 或不存在的用户
    const usersToUpdate = await User.find({
      $or: [
        { avatar: null },
        { avatar: { $exists: false } }
      ]
    });

    console.log(`找到 ${usersToUpdate.length} 个需要更新的用户`);

    if (usersToUpdate.length === 0) {
      console.log('没有需要更新的用户');
      return;
    }

    // 批量更新用户的头像字段
    const result = await User.updateMany(
      {
        $or: [
          { avatar: null },
          { avatar: { $exists: false } }
        ]
      },
      {
        $set: { avatar: 'default' }
      }
    );

    console.log(`成功更新了 ${result.modifiedCount} 个用户的头像字段`);

    // 验证更新结果
    const updatedUsers = await User.find({ avatar: 'default' });
    console.log(`现在有 ${updatedUsers.length} 个用户使用默认头像`);

    console.log('迁移完成！');

  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行迁移
if (require.main === module) {
  migrateUserAvatars()
    .then(() => {
      console.log('迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { migrateUserAvatars };
