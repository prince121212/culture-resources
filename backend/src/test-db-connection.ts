import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources-db';

console.log('尝试连接到MongoDB...');
console.log(`连接字符串: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB连接成功！');
    console.log('数据库连接状态:', mongoose.connection.readyState);
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    // 检查db是否存在
    if (mongoose.connection.db) {
      // 列出所有集合
      mongoose.connection.db.listCollections().toArray()
        .then(collections => {
          console.log('数据库中的集合:');
          collections.forEach(collection => {
            console.log(`- ${collection.name}`);
          });

          // 完成后关闭连接
          mongoose.connection.close()
            .then(() => {
              console.log('数据库连接已关闭');
              process.exit(0);
            })
            .catch(err => {
              console.error('关闭数据库连接时出错:', err);
              process.exit(1);
            });
        })
        .catch(err => {
          console.error('获取集合列表时出错:', err);
          process.exit(1);
        });
    } else {
      console.log('数据库连接成功，但db对象不可用');
      mongoose.connection.close()
        .then(() => {
          console.log('数据库连接已关闭');
          process.exit(0);
        })
        .catch(err => {
          console.error('关闭数据库连接时出错:', err);
          process.exit(1);
        });
    }
  })
  .catch(err => {
    console.error('MongoDB连接错误:', err);
    process.exit(1);
  });
