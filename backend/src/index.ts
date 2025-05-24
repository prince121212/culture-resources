import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // 添加 cors 导入
import path from 'path'; // 添加 path 导入
import authRoutes from './routes/auth.routes'; // 导入认证路由
import resourceRoutes from './routes/resource.routes'; // 导入资源路由
import userRoutes from './routes/user.routes'; // 导入用户相关路由
import commentRoutes from './routes/comment.routes'; // 导入评论相关路由
import favoriteRoutes from './routes/favorite.routes'; // 导入收藏相关路由
import downloadRoutes from './routes/download.routes'; // 导入下载相关路由
import ratingRoutes from './routes/rating.routes'; // 导入评分相关路由
import adminRoutes from './routes/admin.routes'; // 导入管理员路由
import notificationRoutes from './routes/notification.routes'; // 导入通知路由
import categoryRoutes from './routes/category.routes'; // 导入分类路由
import tagRoutes from './routes/tag.routes'; // 导入标签路由
import settingRoutes from './routes/setting.routes'; // 导入设置路由
import connectDB from './config/db'; // 导入数据库连接函数
import { errorHandler } from './middleware/error.middleware'; // 导入错误处理中间件
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './models/user.model'; // 导入 User 模型

// For env File
dotenv.config();

// Connect to Database
connectDB();

const app: Application = express();
const port = process.env.PORT || 5001;

// 添加 CORS 中间件
app.use(cors({
  origin: 'http://localhost:3000', // 允许前端开发服务器的域名
  credentials: true, // 允许携带凭证（cookies等）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 允许的 HTTP 方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

// Middleware to parse JSON bodies
app.use(express.json());

// 添加静态文件服务
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 添加请求日志中间件
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.url.includes('/avatar')) {
    console.log(`[AVATAR REQUEST] ${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`);
  }
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server for Resource Sharing Platform');
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// 先挂载特定路由，如评论相关的完整路径
// 为了支持 /api/resources/:id/comments 路径
app.use('/api', commentRoutes);
app.use('/api', ratingRoutes); // 挂载评分路由

// 再挂载其他常规路由
// Mount resource routes
app.use('/api/resources', resourceRoutes); // 挂载资源路由

// Mount user routes
app.use('/api/users', userRoutes); // 挂载用户路由

// Mount favorite routes
app.use('/api/favorites', favoriteRoutes); // 挂载收藏路由

// Mount download routes
app.use('/api/downloads', downloadRoutes); // 挂载下载路由

// Mount admin routes
app.use('/api/admin', adminRoutes); // 挂载管理员路由

// Mount notification routes
app.use('/api/notifications', notificationRoutes); // 挂载通知路由

// Mount category routes
app.use('/api/categories', categoryRoutes); // 挂载分类路由

// Mount tag routes
app.use('/api/tags', tagRoutes); // 挂载标签路由

// Mount setting routes
app.use('/api/settings', settingRoutes); // 挂载设置路由

// Error Handling Middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 API available at: http://localhost:${port}/api`);
  console.log(`👤 Avatar upload endpoint: http://localhost:${port}/api/users/:id/avatar`);
});