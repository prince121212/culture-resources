/**
 * 将默认头像上传到GridFS数据库中
 * 并更新所有使用默认头像的用户记录
 */

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
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

let gridFSBucket;

// 初始化GridFS
function initGridFS(connection) {
  if (!connection.db) {
    throw new Error('Database connection not established');
  }

  gridFSBucket = new GridFSBucket(connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS initialized');
  return gridFSBucket;
}

// 上传文件到GridFS
function uploadFileToGridFS(filePath, filename) {
  return new Promise((resolve, reject) => {
    try {
      const readStream = fs.createReadStream(filePath);
      const uploadStream = gridFSBucket.openUploadStream(filename, {
        contentType: 'image/png',
        metadata: {
          isDefaultAvatar: true,
          uploadedAt: new Date()
        }
      });

      readStream.pipe(uploadStream);

      uploadStream.on('finish', function() {
        console.log(`文件上传成功，GridFS ID: ${uploadStream.id}`);
        resolve(uploadStream.id);
      });

      uploadStream.on('error', function(error) {
        console.error('文件上传失败:', error);
        reject(error);
      });

      readStream.on('error', function(error) {
        console.error('文件读取失败:', error);
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function uploadDefaultAvatarToDatabase() {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 初始化GridFS
    initGridFS(mongoose.connection);

    // 默认头像文件路径
    const defaultAvatarPath = path.join(__dirname, '../../frontend/public/images/default-avatar.png');
    console.log(`默认头像文件路径: ${defaultAvatarPath}`);

    // 检查文件是否存在
    if (!fs.existsSync(defaultAvatarPath)) {
      throw new Error(`默认头像文件不存在: ${defaultAvatarPath}`);
    }

    // 获取文件信息
    const stats = fs.statSync(defaultAvatarPath);
    console.log(`文件大小: ${Math.round(stats.size / 1024)}KB`);

    // 检查是否已经存在默认头像
    const existingFiles = await gridFSBucket.find({
      'metadata.isDefaultAvatar': true
    }).toArray();

    let defaultAvatarId;

    if (existingFiles.length > 0) {
      console.log(`找到 ${existingFiles.length} 个现有的默认头像文件`);
      defaultAvatarId = existingFiles[0]._id;
      console.log(`使用现有的默认头像 ID: ${defaultAvatarId}`);
    } else {
      // 上传默认头像到GridFS
      console.log('上传默认头像到GridFS...');
      defaultAvatarId = await uploadFileToGridFS(defaultAvatarPath, 'default-avatar.png');
      console.log(`默认头像上传成功，ID: ${defaultAvatarId}`);
    }

    // 查找所有没有头像或使用默认头像标识的用户
    const usersWithoutAvatar = await User.find({
      $or: [
        { avatar: null },
        { avatar: { $exists: false } },
        { avatar: 'default' }
      ]
    });

    console.log(`找到 ${usersWithoutAvatar.length} 个需要设置默认头像的用户`);

    if (usersWithoutAvatar.length > 0) {
      // 更新所有没有头像的用户
      const result = await User.updateMany(
        {
          $or: [
            { avatar: null },
            { avatar: { $exists: false } },
            { avatar: 'default' }
          ]
        },
        { $set: { avatar: defaultAvatarId.toString() } }
      );

      console.log(`成功更新了 ${result.modifiedCount} 个用户的头像字段`);
    }

    // 验证更新结果
    const updatedUsers = await User.find({
      avatar: defaultAvatarId.toString()
    });
    console.log(`现在有 ${updatedUsers.length} 个用户使用数据库中的默认头像`);

    console.log('默认头像上传和用户更新完成！');

  } catch (error) {
    console.error('操作过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行脚本
if (require.main === module) {
  uploadDefaultAvatarToDatabase()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { uploadDefaultAvatarToDatabase };
