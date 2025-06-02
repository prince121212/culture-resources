/**
 * 测试 bio 字段更新功能
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources';

// 用户模型定义（简化版）
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  avatar: { type: String, default: null },
  bio: { type: String, trim: true, maxlength: 500, default: '' },
}, {
  timestamps: true
});

async function testBioUpdate() {
  try {
    console.log('开始连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    const User = mongoose.model('User', UserSchema);

    // 查找 admin 用户
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('未找到 admin 用户');
      return;
    }

    console.log('找到 admin 用户:');
    console.log(`ID: ${adminUser._id}`);
    console.log(`用户名: ${adminUser.username}`);
    console.log(`当前 bio: "${adminUser.bio}"`);

    // 更新 bio 字段
    const testBio = '这是一个测试的个人简介 - ' + new Date().toISOString();
    console.log(`\n准备更新 bio 为: "${testBio}"`);

    const updatedUser = await User.findByIdAndUpdate(
      adminUser._id,
      {
        bio: testBio,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    console.log('\n更新后的用户信息:');
    console.log(`ID: ${updatedUser._id}`);
    console.log(`用户名: ${updatedUser.username}`);
    console.log(`更新后的 bio: "${updatedUser.bio}"`);
    console.log(`更新时间: ${updatedUser.updatedAt}`);

    // 验证更新是否成功
    const verifyUser = await User.findById(adminUser._id).select('-password');
    console.log('\n验证数据库中的数据:');
    console.log(`验证 bio: "${verifyUser.bio}"`);

    if (verifyUser.bio === testBio) {
      console.log('✅ bio 字段更新成功！');
    } else {
      console.log('❌ bio 字段更新失败！');
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行测试
testBioUpdate();
