const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culture-resources-db';

async function checkUserStructure() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // 查看用户集合的一个文档结构
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({});
    console.log('Current user document structure:');
    console.log(JSON.stringify(user, null, 2));
    
    // 检查特定用户
    const adminUser = await db.collection('users').findOne({ email: 'admin@example.com' });
    console.log('\nAdmin user:');
    console.log(JSON.stringify(adminUser, null, 2));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUserStructure();
