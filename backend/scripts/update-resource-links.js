/**
 * 批量更新资源链接脚本
 * 将所有资源的link字段从 http://example.com 改为 http://baidu.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources-db';

// 资源模型定义
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String },
  tags: [{ type: String }],
  downloadCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected', 'terminated'], 
    default: 'pending' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectReason: { type: String },
  version: { type: Number, default: 1 },
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Resource = mongoose.model('Resource', ResourceSchema);

async function updateResourceLinks() {
  try {
    console.log('连接到数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 查找所有包含 http://example.com 的资源
    const oldDomain = 'http://example.com';
    const newDomain = 'http://baidu.com';

    console.log(`查找包含 "${oldDomain}" 的资源...`);
    
    // 使用正则表达式查找所有包含旧域名的资源
    const resourcesToUpdate = await Resource.find({
      link: { $regex: oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    });

    console.log(`找到 ${resourcesToUpdate.length} 个需要更新的资源`);

    if (resourcesToUpdate.length === 0) {
      console.log('没有需要更新的资源');
      return;
    }

    // 显示将要更新的资源信息
    console.log('\n将要更新的资源：');
    resourcesToUpdate.forEach((resource, index) => {
      console.log(`${index + 1}. ID: ${resource._id}`);
      console.log(`   标题: ${resource.title}`);
      console.log(`   当前链接: ${resource.link}`);
      console.log(`   新链接: ${resource.link.replace(new RegExp(oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), newDomain)}`);
      console.log('');
    });

    // 执行批量更新
    console.log('开始批量更新...');
    
    const result = await Resource.updateMany(
      {
        link: { $regex: oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
      },
      [
        {
          $set: {
            link: {
              $replaceAll: {
                input: "$link",
                find: oldDomain,
                replacement: newDomain
              }
            },
            updatedAt: new Date()
          }
        }
      ]
    );

    console.log(`成功更新了 ${result.modifiedCount} 个资源的链接`);

    // 验证更新结果
    console.log('\n验证更新结果...');
    const updatedResources = await Resource.find({
      link: { $regex: newDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    });

    console.log(`现在有 ${updatedResources.length} 个资源使用新域名 "${newDomain}"`);

    // 检查是否还有旧域名的资源
    const remainingOldResources = await Resource.find({
      link: { $regex: oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    });

    if (remainingOldResources.length > 0) {
      console.log(`警告：仍有 ${remainingOldResources.length} 个资源使用旧域名`);
      remainingOldResources.forEach((resource, index) => {
        console.log(`${index + 1}. ID: ${resource._id}, 链接: ${resource.link}`);
      });
    } else {
      console.log('✅ 所有资源链接已成功更新');
    }

    console.log('\n链接更新完成！');

  } catch (error) {
    console.error('更新过程中发生错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 运行脚本
if (require.main === module) {
  updateResourceLinks()
    .then(() => {
      console.log('脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { updateResourceLinks };
