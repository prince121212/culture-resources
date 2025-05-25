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
  avatar: { type: String, default: null },
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    console.log('\n查找所有用户:');
    const users = await User.find({}, 'username email avatar').limit(10);
    users.forEach(user => {
      console.log(`ID: ${user._id}, 用户名: ${user.username}, 邮箱: ${user.email}, 头像: ${user.avatar}`);
    });

    console.log('\n查找特定用户 682f0d67e89304d6fbb6dca7:');
    try {
      const specificUser = await User.findById('682f0d67e89304d6fbb6dca7');
      console.log('结果:', specificUser);
    } catch (error) {
      console.log('查找特定用户时出错:', error.message);
    }

    console.log('\n检查是否有无效的ObjectId格式:');
    if (!mongoose.Types.ObjectId.isValid('682f0d67e89304d6fbb6dca7')) {
      console.log('ID 682f0d67e89304d6fbb6dca7 不是有效的ObjectId格式');
    } else {
      console.log('ID 682f0d67e89304d6fbb6dca7 是有效的ObjectId格式');
    }

  } catch (error) {
    console.error('操作过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行脚本
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { checkUsers };
