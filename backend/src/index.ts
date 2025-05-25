import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/auth.routes'; // 导入认证路由
import resourceRoutes from './routes/resource.routes'; // 导入资源路由
import userRoutes from './routes/user.routes'; // 导入用户路由
import ratingRoutes from './routes/rating.routes'; // 导入评分路由
import favoriteRoutes from './routes/favorite.routes'; // 导入收藏路由
import notificationRoutes from './routes/notification.routes'; // 导入通知
import categoryRoutes from './routes/category.routes'; // 导入分类路由
import tagRoutes from './routes/tag.routes'; // 导入标签路由
import settingRoutes from './routes/setting.routes'; // 导入设置路由
import adminRoutes from './routes/admin.routes'; // 导入管理员路由
import connectDB from './config/db'; // 导入数据库连接函数
import { errorHandler } from './middleware/error.middleware'; // 导入错误处理中间件
import { protect, AuthenticatedRequest } from './middleware/auth.middleware'; // 导入认证中间件
import { deleteComment } from './controllers/comment.controller'; // 导入评论控制器

// For env File
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 连接数据库
connectDB();

// 中间件
// CORS配置 - 允许所有来源访问头像等静态资源
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);

    // 允许localhost的所有端口
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // 在生产环境中，这里应该检查具体的域名
    return callback(null, true);
  },
  credentials: true, // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], // 允许的HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // 允许的请求头
  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition', 'Cache-Control'] // 暴露给前端的响应头
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 安全中间件配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许跨域资源
  crossOriginEmbedderPolicy: false // 禁用COEP以避免图片加载问题
}));

app.use(compression());

// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 请求日志已由morgan处理

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server for Resource Sharing Platform');
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// 分别挂载评论路由的不同部分
// 资源评论相关路由
app.use('/api/resources', resourceRoutes); // 挂载资源路由

// 评论操作相关路由（删除、更新、点赞等）
app.delete('/api/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return deleteComment(req, res, next);
});

// 评分相关路由
app.use('/api', ratingRoutes); // 挂载评分路由

// 再挂载其他常规路由
// Mount user routes
app.use('/api/users', userRoutes); // 挂载用户路由

// 挂载其他路由
app.use('/api/categories', categoryRoutes); // 挂载分类路由
app.use('/api/tags', tagRoutes); // 挂载标签路由
app.use('/api/notifications', notificationRoutes); // 挂载通知路由
app.use('/api/settings', settingRoutes); // 挂载设置路由
app.use('/api/favorites', favoriteRoutes); // 挂载收藏路由
app.use('/api/admin', adminRoutes); // 挂载管理员路由

// 使用错误处理中间件
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port} in ${NODE_ENV} mode`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});