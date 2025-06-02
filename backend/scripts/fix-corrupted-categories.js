const mongoose = require('mongoose');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/culture-resources', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 资源模型
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.Mixed },
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

// 分类模型
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
  path: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Resource = mongoose.model('Resource', ResourceSchema);
const Category = mongoose.model('Category', CategorySchema);

// 修复损坏的分类数据
const fixCorruptedCategories = async () => {
  try {
    console.log('开始修复损坏的分类数据...');
    
    // 查找所有资源
    const resources = await Resource.find({});
    console.log(`找到 ${resources.length} 个资源`);
    
    let fixedCount = 0;
    let corruptedCount = 0;
    
    for (const resource of resources) {
      let needsUpdate = false;
      let newCategory = resource.category;
      
      // 检查分类是否损坏
      if (resource.category && typeof resource.category === 'object') {
        if (resource.category.name === '[object Object]' || 
            (resource.category.name && resource.category.name.toString() === '[object Object]')) {
          corruptedCount++;
          console.log(`发现损坏的分类数据 - 资源ID: ${resource._id}, 标题: ${resource.title}`);
          
          // 尝试从_id恢复
          if (resource.category._id && mongoose.Types.ObjectId.isValid(resource.category._id)) {
            try {
              const categoryDoc = await Category.findById(resource.category._id);
              if (categoryDoc) {
                newCategory = {
                  _id: categoryDoc._id.toString(),
                  name: categoryDoc.name,
                  description: categoryDoc.description
                };
                needsUpdate = true;
                console.log(`  -> 成功恢复分类: ${categoryDoc.name}`);
              } else {
                // 分类不存在，设置为null
                newCategory = null;
                needsUpdate = true;
                console.log(`  -> 分类不存在，设置为未分类`);
              }
            } catch (error) {
              console.log(`  -> 恢复失败: ${error.message}`);
              newCategory = null;
              needsUpdate = true;
            }
          } else {
            // 无法恢复，设置为null
            newCategory = null;
            needsUpdate = true;
            console.log(`  -> 无法恢复，设置为未分类`);
          }
        }
      }
      
      // 更新资源
      if (needsUpdate) {
        await Resource.findByIdAndUpdate(resource._id, { category: newCategory });
        fixedCount++;
        console.log(`  -> 已更新资源: ${resource.title}`);
      }
    }
    
    console.log(`\n修复完成:`);
    console.log(`- 发现损坏的分类数据: ${corruptedCount} 个`);
    console.log(`- 成功修复: ${fixedCount} 个`);
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await fixCorruptedCategories();
  await mongoose.connection.close();
  console.log('数据库连接已关闭');
  process.exit(0);
};

// 运行脚本
main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
