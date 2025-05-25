import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User, { IUser } from './models/user.model';
import Resource, { IResource } from './models/resource.model';
import Category, { ICategory } from './models/category.model';
import Tag, { ITag } from './models/tag.model';
import Rating from './models/rating.model';
import Favorite from './models/favorite.model';
import Notification from './models/notification.model';

dotenv.config();

const seedData = async () => {
  await connectDB();

  try {
    // 首先尝试删除现有索引，以避免冲突
    console.log('Attempting to drop existing indexes...');
    try {
      // 确保集合存在再尝试删除索引
      if (mongoose.connection.collections.users) {
        await User.collection.dropIndexes();
        console.log('Indexes dropped for Users collection.');
      }
      if (mongoose.connection.collections.resources) {
        await Resource.collection.dropIndexes();
        console.log('Indexes dropped for Resources collection.');
      }
      if (mongoose.connection.collections.categories) {
        await Category.collection.dropIndexes();
        console.log('Indexes dropped for Categories collection.');
      }
      if (mongoose.connection.collections.tags) {
        await Tag.collection.dropIndexes();
        console.log('Indexes dropped for Tags collection.');
      }
      if (mongoose.connection.collections.ratings) {
        await Rating.collection.dropIndexes();
        console.log('Indexes dropped for Ratings collection.');
      }
      if (mongoose.connection.collections.favorites) {
        await Favorite.collection.dropIndexes();
        console.log('Indexes dropped for Favorites collection.');
      }
      if (mongoose.connection.collections.notifications) {
        await Notification.collection.dropIndexes();
        console.log('Indexes dropped for Notifications collection.');
      }
      console.log('Existing indexes dropped successfully where collections existed.');
    } catch (indexError) {
      // 如果集合或索引不存在，dropIndexes可能会抛出错误，这里可以安全地忽略或记录警告
      console.warn('Warning: Could not drop all indexes (some collections/indexes might not exist or another error occurred):', indexError);
    }

    // 清除现有数据
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});
    await Rating.deleteMany({});
    await Favorite.deleteMany({});
    await Notification.deleteMany({});

    console.log('Data cleared...');

    // 创建用户 - 使用明文密码，让 pre-save 中间件处理加密
    console.log('Creating users...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      points: 100,
      status: 'active'
    });

    const regularUser1 = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      points: 50,
      status: 'active'
    });
    
    const regularUser2 = await User.create({
      username: 'zhang_scholar',
      email: 'zhang@example.com',
      password: 'zhang123',
      role: 'user',
      points: 75,
      status: 'active'
    });
    
    const regularUser3 = await User.create({
      username: 'li_researcher',
      email: 'li@example.com',
      password: 'li123',
      role: 'user',
      points: 60,
      status: 'active'
    });
    
    const moderatorUser = await User.create({
      username: 'moderator',
      email: 'mod@example.com',
      password: 'mod123',
      role: 'moderator',
      points: 120,
      status: 'active'
    });

    console.log('Users created...');

    // 创建分类
    console.log('Creating categories...');
    const categoryHistory = await Category.create({
      name: '历史文献',
      description: '关于历史事件和时期的文献资料',
      isActive: true,
    });

    const categoryArt = await Category.create({
      name: '艺术作品',
      description: '绘画、雕塑、摄影等艺术形式的作品',
      parent: categoryHistory._id, // 艺术作品是历史文献的一个子分类
      isActive: true,
    });
    
    const categoryMusic = await Category.create({
      name: '音乐',
      description: '各种类型的音乐作品和乐谱',
      isActive: true,
    });
    
    const categoryLiterature = await Category.create({
      name: '文学作品',
      description: '小说、诗歌、散文等文学形式的作品',
      isActive: true,
    });
    
    const categoryPhilosophy = await Category.create({
      name: '哲学',
      description: '哲学著作和思想研究资料',
      isActive: true,
    });
    
    const categoryScience = await Category.create({
      name: '科学研究',
      description: '科学研究论文和实验资料',
      isActive: true,
    });

    console.log('Categories created...');

    // 创建标签
    console.log('Creating tags...');
    const tagAncient = await Tag.create({
      name: '古代',
      description: '与古代文明和历史相关的标签',
      isActive: true,
    });

    const tagModern = await Tag.create({
      name: '现代',
      description: '与现代社会和文化相关的标签',
      isActive: true,
    });
    
    const tagPainting = await Tag.create({
      name: '绘画',
      description: '绘画作品',
      isActive: true,
    });
    
    const tagPoetry = await Tag.create({
      name: '诗歌',
      description: '诗歌作品',
      isActive: true,
    });
    
    const tagClassical = await Tag.create({
      name: '古典',
      description: '古典风格的作品',
      isActive: true,
    });
    
    const tagAcademic = await Tag.create({
      name: '学术',
      description: '学术研究内容',
      isActive: true,
    });
    
    const tagPopular = await Tag.create({
      name: '流行',
      description: '流行文化内容',
      isActive: true,
    });

    console.log('Tags created...');

    // 创建资源
    console.log('Creating resources...');
    const resource1 = await Resource.create({
      title: '清明上河图解析',
      description: '详细解析中国古代名画《清明上河图》的各个场景和历史背景。',
      link: 'http://example.com/resource/qingming-shanghe-tu',
      uploader: adminUser._id,
      category: categoryArt._id, // 使用分类ID
      tags: [tagAncient._id, tagPainting._id], // 使用标签ID
      downloadCount: 150,
      rating: 4.8,
      ratingCount: 30,
      status: 'approved',
      isPublic: true,
    });

    const resource2 = await Resource.create({
      title: '中国近代史纲要',
      description: '一本关于中国近代历史发展的重要纲要性著作。',
      link: 'http://example.com/resource/modern-chinese-history',
      uploader: regularUser1._id,
      category: categoryHistory._id, // 使用分类ID
      tags: [tagModern._id, tagAcademic._id], // 使用标签ID
      downloadCount: 200,
      rating: 4.5,
      ratingCount: 50,
      status: 'approved',
      isPublic: true,
    });
    
    const resource3 = await Resource.create({
      title: '贝多芬第五交响曲乐谱',
      description: '贝多芬C小调第五交响曲（命运交响曲）的完整乐谱。',
      link: 'http://example.com/resource/beethoven-5th-symphony',
      uploader: adminUser._id,
      category: categoryMusic._id,
      tags: [tagClassical._id],
      downloadCount: 300,
      rating: 4.9,
      ratingCount: 100,
      status: 'approved',
      isPublic: true,
    });
    
    const resource4 = await Resource.create({
      title: '唐诗三百首精选',
      description: '中国古代唐朝诗歌精选集，包含三百首经典诗作。',
      link: 'http://example.com/resource/tang-poetry-300',
      uploader: regularUser2._id,
      category: categoryLiterature._id,
      tags: [tagAncient._id, tagPoetry._id],
      downloadCount: 250,
      rating: 4.7,
      ratingCount: 80,
      status: 'approved',
      isPublic: true,
    });
    
    const resource5 = await Resource.create({
      title: '论语译注',
      description: '孔子《论语》的现代汉语译文和详细注解。',
      link: 'http://example.com/resource/lunyu-translation',
      uploader: regularUser3._id,
      category: categoryPhilosophy._id,
      tags: [tagAncient._id, tagAcademic._id],
      downloadCount: 180,
      rating: 4.6,
      ratingCount: 60,
      status: 'approved',
      isPublic: true,
    });
    
    const resource6 = await Resource.create({
      title: '量子力学导论',
      description: '现代量子力学理论的基础导论，适合大学物理专业学生。',
      link: 'http://example.com/resource/quantum-mechanics-intro',
      uploader: moderatorUser._id,
      category: categoryScience._id,
      tags: [tagModern._id, tagAcademic._id],
      downloadCount: 120,
      rating: 4.8,
      ratingCount: 35,
      status: 'approved',
      isPublic: true,
    });

    console.log('Resources created...');
    
    // 创建评分数据
    console.log('Creating ratings...');
    await Rating.create({
      user: regularUser1._id,
      resource: resource1._id,
      rating: 5,
      comment: '非常详尽的解析，对理解清明上河图有很大帮助。'
    });
    
    await Rating.create({
      user: regularUser2._id,
      resource: resource1._id,
      rating: 4,
      comment: '内容丰富，但有些部分可以更加深入。'
    });
    
    await Rating.create({
      user: adminUser._id,
      resource: resource2._id,
      rating: 5,
      comment: '对中国近代史的梳理非常清晰明了。'
    });
    
    await Rating.create({
      user: regularUser3._id,
      resource: resource3._id,
      rating: 5,
      comment: '乐谱清晰完整，非常有助于学习贝多芬的作品。'
    });
    
    await Rating.create({
      user: moderatorUser._id,
      resource: resource4._id,
      rating: 4,
      comment: '精选的唐诗很经典，但希望能有更多注释。'
    });
    
    console.log('Ratings created...');
    
    // 创建收藏记录
    console.log('Creating favorites...');
    await Favorite.create({
      user: regularUser1._id,
      resource: resource1._id
    });
    
    await Favorite.create({
      user: regularUser2._id,
      resource: resource3._id
    });
    
    await Favorite.create({
      user: regularUser3._id,
      resource: resource4._id
    });
    
    console.log('Favorites created...');
    
    // 创建通知
    console.log('Creating notifications...');
    await Notification.create({
      recipient: regularUser1._id,
      type: 'system',
      title: '欢迎加入文化资源平台',
      message: '感谢您注册我们的平台，开始探索丰富的文化资源吧！',
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10天前
    });
    
    await Notification.create({
      recipient: regularUser2._id,
      type: 'resource',
      title: '新资源推荐',
      message: '我们推荐您查看"清明上河图解析"这一精彩资源',
      relatedResource: resource1._id,
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
    });
    
    await Notification.create({
      recipient: adminUser._id,
      type: 'admin',
      title: '新用户注册通知',
      message: '有5位新用户在过去一周内注册了平台',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
    });
    
    console.log('Notifications created...');

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedData(); 