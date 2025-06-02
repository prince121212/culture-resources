/**
 * 数据库迁移脚本：为现有用户添加 bio 字段
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources';

async function migrateBioField() {
  try {
    console.log('开始连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 检查现有用户数量
    const totalUsers = await usersCollection.countDocuments();
    console.log(`发现 ${totalUsers} 个用户`);

    // 查找没有 bio 字段的用户
    const usersWithoutBio = await usersCollection.countDocuments({ bio: { $exists: false } });
    console.log(`其中 ${usersWithoutBio} 个用户没有 bio 字段`);

    if (usersWithoutBio === 0) {
      console.log('所有用户都已经有 bio 字段，无需迁移');
      return;
    }

    // 为没有 bio 字段的用户添加空的 bio 字段
    const result = await usersCollection.updateMany(
      { bio: { $exists: false } },
      { $set: { bio: '' } }
    );

    console.log(`成功为 ${result.modifiedCount} 个用户添加了 bio 字段`);

    // 验证迁移结果
    const usersWithBio = await usersCollection.countDocuments({ bio: { $exists: true } });
    console.log(`现在有 ${usersWithBio} 个用户拥有 bio 字段`);

    // 显示一个示例用户的结构
    const sampleUser = await usersCollection.findOne({}, { password: 0 });
    console.log('\n示例用户结构:');
    console.log(JSON.stringify(sampleUser, null, 2));

  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行迁移
migrateBioField();
