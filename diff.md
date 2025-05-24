diff --git a/backend/package-lock.json b/backend/package-lock.json
index 3f87a9a..c627c9f 100644
--- a/backend/package-lock.json
+++ b/backend/package-lock.json
@@ -13,14 +13,17 @@
         "@types/multer": "^1.4.12",
         "@types/node-fetch": "^2.6.12",
         "bcryptjs": "^3.0.2",
+        "compression": "^1.8.0",
         "cors": "^2.8.5",
         "dotenv": "^16.5.0",
         "express": "^5.1.0",
         "express-validator": "^7.2.1",
         "gridfs-stream": "^1.1.1",
+        "helmet": "^8.1.0",
         "jsonwebtoken": "^9.0.2",
         "mongodb": "^6.16.0",
         "mongoose": "^8.15.0",
+        "morgan": "^1.10.0",
         "multer": "^1.4.5-lts.1",
         "node-fetch": "^2.7.0",
         "react-hot-toast": "^2.5.2",
@@ -28,8 +31,10 @@
       },
       "devDependencies": {
         "@types/bcryptjs": "^2.4.6",
+        "@types/compression": "^1.8.0",
         "@types/express": "^5.0.2",
         "@types/jsonwebtoken": "^9.0.9",
+        "@types/morgan": "^1.9.9",
         "@types/node": "^22.15.18",
         "nodemon": "^3.1.10",
         "ts-node": "^10.9.2",
@@ -131,6 +136,17 @@
         "@types/node": "*"
       }
     },
+    "node_modules/@types/compression": {
+      "version": "1.8.0",
+      "resolved": "https://registry.npmjs.org/@types/compression/-/compression-1.8.0.tgz",
+      "integrity": "sha512-g4vmPIwbTii9dX1HVioHbOolubEaf4re4vDxuzpKrzz9uI7uarBExi9begX0cXyIB85jXZ5X2A/v8rsHZxSAPw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@types/express": "*",
+        "@types/node": "*"
+      }
+    },
     "node_modules/@types/connect": {
       "version": "3.4.38",
       "resolved": "https://registry.npmjs.org/@types/connect/-/connect-3.4.38.tgz",
@@ -195,6 +211,16 @@
       "integrity": "sha512-/pyBZWSLD2n0dcHE3hq8s8ZvcETHtEuF+3E7XVt0Ig2nvsVQXdghHVcEkIWjy9A0wKfTn97a/PSDYohKIlnP/w==",
       "license": "MIT"
     },
+    "node_modules/@types/morgan": {
+      "version": "1.9.9",
+      "resolved": "https://registry.npmjs.org/@types/morgan/-/morgan-1.9.9.tgz",
+      "integrity": "sha512-iRYSDKVaC6FkGSpEVVIvrRGw0DfJMiQzIn3qr2G5B3C//AWkulhXgaBd7tS9/J79GWSYMTHGs7PfI5b3Y8m+RQ==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@types/node": "*"
+      }
+    },
     "node_modules/@types/ms": {
       "version": "2.1.0",
       "resolved": "https://registry.npmjs.org/@types/ms/-/ms-2.1.0.tgz",
@@ -357,6 +383,24 @@
       "dev": true,
       "license": "MIT"
     },
+    "node_modules/basic-auth": {
+      "version": "2.0.1",
+      "resolved": "https://registry.npmjs.org/basic-auth/-/basic-auth-2.0.1.tgz",
+      "integrity": "sha512-NF+epuEdnUYVlGuhaxbbq+dvJttwLnGY+YixlXlME5KpQ5W3CnXA5cVTneY3SPbPDRkcjMbifrwmFYcClgOZeg==",
+      "license": "MIT",
+      "dependencies": {
+        "safe-buffer": "5.1.2"
+      },
+      "engines": {
+        "node": ">= 0.8"
+      }
+    },
+    "node_modules/basic-auth/node_modules/safe-buffer": {
+      "version": "5.1.2",
+      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.1.2.tgz",
+      "integrity": "sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g==",
+      "license": "MIT"
+    },
     "node_modules/bcryptjs": {
       "version": "3.0.2",
       "resolved": "https://registry.npmjs.org/bcryptjs/-/bcryptjs-3.0.2.tgz",
@@ -530,6 +574,60 @@
         "node": ">= 0.8"
       }
     },
+    "node_modules/compressible": {
+      "version": "2.0.18",
+      "resolved": "https://registry.npmjs.org/compressible/-/compressible-2.0.18.tgz",
+      "integrity": "sha512-AF3r7P5dWxL8MxyITRMlORQNaOA2IkAFaTr4k7BUumjPtRpGDTZpl0Pb1XCO6JeDCBdp126Cgs9sMxqSjgYyRg==",
+      "license": "MIT",
+      "dependencies": {
+        "mime-db": ">= 1.43.0 < 2"
+      },
+      "engines": {
+        "node": ">= 0.6"
+      }
+    },
+    "node_modules/compression": {
+      "version": "1.8.0",
+      "resolved": "https://registry.npmjs.org/compression/-/compression-1.8.0.tgz",
+      "integrity": "sha512-k6WLKfunuqCYD3t6AsuPGvQWaKwuLLh2/xHNcX4qE+vIfDNXpSqnrhwA7O53R7WVQUnt8dVAIW+YHr7xTgOgGA==",
+      "license": "MIT",
+      "dependencies": {
+        "bytes": "3.1.2",
+        "compressible": "~2.0.18",
+        "debug": "2.6.9",
+        "negotiator": "~0.6.4",
+        "on-headers": "~1.0.2",
+        "safe-buffer": "5.2.1",
+        "vary": "~1.1.2"
+      },
+      "engines": {
+        "node": ">= 0.8.0"
+      }
+    },
+    "node_modules/compression/node_modules/debug": {
+      "version": "2.6.9",
+      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
+      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
+      "license": "MIT",
+      "dependencies": {
+        "ms": "2.0.0"
+      }
+    },
+    "node_modules/compression/node_modules/ms": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
+      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
+      "license": "MIT"
+    },
+    "node_modules/compression/node_modules/negotiator": {
+      "version": "0.6.4",
+      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.4.tgz",
+      "integrity": "sha512-myRT3DiWPHqho5PrJaIRyaMv2kgYf0mUVgBNOYMuCH5Ki1yEiQaf/ZJuQ62nvpc44wL5WDbTX7yGJi1Neevw8w==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.6"
+      }
+    },
     "node_modules/concat-map": {
       "version": "0.0.1",
       "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
@@ -1078,6 +1176,15 @@
         "node": ">= 0.4"
       }
     },
+    "node_modules/helmet": {
+      "version": "8.1.0",
+      "resolved": "https://registry.npmjs.org/helmet/-/helmet-8.1.0.tgz",
+      "integrity": "sha512-jOiHyAZsmnr8LqoPGmCjYAaiuWwjAPLgY8ZX2XrmHawt99/u1y6RgrZMTeoPfpUbV96HOalYgz1qzkRbw54Pmg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=18.0.0"
+      }
+    },
     "node_modules/http-errors": {
       "version": "2.0.0",
       "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.0.tgz",
@@ -1462,6 +1569,49 @@
         "url": "https://opencollective.com/mongoose"
       }
     },
+    "node_modules/morgan": {
+      "version": "1.10.0",
+      "resolved": "https://registry.npmjs.org/morgan/-/morgan-1.10.0.tgz",
+      "integrity": "sha512-AbegBVI4sh6El+1gNwvD5YIck7nSA36weD7xvIxG4in80j/UoK8AEGaWnnz8v1GxonMCltmlNs5ZKbGvl9b1XQ==",
+      "license": "MIT",
+      "dependencies": {
+        "basic-auth": "~2.0.1",
+        "debug": "2.6.9",
+        "depd": "~2.0.0",
+        "on-finished": "~2.3.0",
+        "on-headers": "~1.0.2"
+      },
+      "engines": {
+        "node": ">= 0.8.0"
+      }
+    },
+    "node_modules/morgan/node_modules/debug": {
+      "version": "2.6.9",
+      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
+      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
+      "license": "MIT",
+      "dependencies": {
+        "ms": "2.0.0"
+      }
+    },
+    "node_modules/morgan/node_modules/ms": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
+      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
+      "license": "MIT"
+    },
+    "node_modules/morgan/node_modules/on-finished": {
+      "version": "2.3.0",
+      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.3.0.tgz",
+      "integrity": "sha512-ikqdkGAAyf/X/gPhXGvfgAytDZtDbr+bkNUJ0N9h5MI/dmdgCs3l6hoHrcUv41sRKew3jIwrp4qQDXiK99Utww==",
+      "license": "MIT",
+      "dependencies": {
+        "ee-first": "1.1.1"
+      },
+      "engines": {
+        "node": ">= 0.8"
+      }
+    },
     "node_modules/mpath": {
       "version": "0.9.0",
       "resolved": "https://registry.npmjs.org/mpath/-/mpath-0.9.0.tgz",
@@ -1674,6 +1824,15 @@
         "node": ">= 0.8"
       }
     },
+    "node_modules/on-headers": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/on-headers/-/on-headers-1.0.2.tgz",
+      "integrity": "sha512-pZAE+FJLoyITytdqK0U5s+FIpjN0JP3OzFi/u8Rx+EV5/W+JTWGXG8xFzevE7AjBfDqHv/8vL8qQsIhHnqRkrA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.8"
+      }
+    },
     "node_modules/once": {
       "version": "1.4.0",
       "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
diff --git a/backend/package.json b/backend/package.json
index f6e8b45..1095d6c 100644
--- a/backend/package.json
+++ b/backend/package.json
@@ -7,14 +7,17 @@
     "@types/multer": "^1.4.12",
     "@types/node-fetch": "^2.6.12",
     "bcryptjs": "^3.0.2",
+    "compression": "^1.8.0",
     "cors": "^2.8.5",
     "dotenv": "^16.5.0",
     "express": "^5.1.0",
     "express-validator": "^7.2.1",
     "gridfs-stream": "^1.1.1",
+    "helmet": "^8.1.0",
     "jsonwebtoken": "^9.0.2",
     "mongodb": "^6.16.0",
     "mongoose": "^8.15.0",
+    "morgan": "^1.10.0",
     "multer": "^1.4.5-lts.1",
     "node-fetch": "^2.7.0",
     "react-hot-toast": "^2.5.2",
@@ -33,8 +36,10 @@
   "description": "",
   "devDependencies": {
     "@types/bcryptjs": "^2.4.6",
+    "@types/compression": "^1.8.0",
     "@types/express": "^5.0.2",
     "@types/jsonwebtoken": "^9.0.9",
+    "@types/morgan": "^1.9.9",
     "@types/node": "^22.15.18",
     "nodemon": "^3.1.10",
     "ts-node": "^10.9.2",
diff --git a/backend/src/config/gridfs.ts b/backend/src/config/gridfs.ts
index a3a79f3..d157960 100644
--- a/backend/src/config/gridfs.ts
+++ b/backend/src/config/gridfs.ts
@@ -10,7 +10,7 @@ export const initGridFS = (connection: mongoose.Connection) => {
   if (!connection.db) {
     throw new Error('Database connection not established');
   }
-  
+
   gridFSBucket = new GridFSBucket(connection.db, {
     bucketName: 'uploads'
   });
@@ -30,9 +30,9 @@ export const getGridFSBucket = () => {
 export const storage = multer.memoryStorage();
 
 // 文件过滤器
-export const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
+export const fileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
   const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
-  
+
   if (allowedMimeTypes.includes(file.mimetype)) {
     callback(null, true);
   } else {
@@ -41,7 +41,7 @@ export const fileFilter = (req: Request, file: Express.Multer.File, callback: mu
 };
 
 // 配置Multer中间件
-export const upload = multer({ 
+export const upload = multer({
   storage,
   limits: {
     fileSize: 2 * 1024 * 1024 // 2MB
@@ -58,7 +58,7 @@ export const getFileById = async (id: string) => {
   return new Promise((resolve, reject) => {
     try {
       const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(id));
-      
+
       downloadStream.on('error', (error) => {
         reject(error);
       });
@@ -72,7 +72,7 @@ export const getFileById = async (id: string) => {
 
 // 保存文件到GridFS并返回文件ID
 export const saveFileToGridFS = async (
-  file: Express.Multer.File, 
+  file: Express.Multer.File,
   metadata: object = {}
 ): Promise<mongoose.Types.ObjectId> => {
   return new Promise((resolve, reject) => {
@@ -97,4 +97,4 @@ export const saveFileToGridFS = async (
       reject(error);
     }
   });
-}; 
\ No newline at end of file
+};
\ No newline at end of file
diff --git a/backend/src/controllers/comment.controller.ts b/backend/src/controllers/comment.controller.ts
index fe93b21..718f49e 100644
--- a/backend/src/controllers/comment.controller.ts
+++ b/backend/src/controllers/comment.controller.ts
@@ -3,6 +3,7 @@ import mongoose, { Types } from 'mongoose';
 import { AuthenticatedRequest } from '../middleware/auth.middleware';
 import Resource from '../models/resource.model';
 import Comment, { IComment } from '../models/comment.model';
+import User from '../models/user.model';
 
 /**
  * @desc    创建评论
@@ -207,7 +208,7 @@ export const updateComment = async (req: AuthenticatedRequest, res: Response, ne
  * @route   DELETE /api/comments/:id
  * @access  Private
  */
-export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
+export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   try {
     const commentId = req.params.id;
     const userIdString = req.user?.id;
@@ -218,13 +219,18 @@ export const deleteComment = async (req: AuthenticatedRequest, res: Response, ne
     }
 
     const comment = await Comment.findById(commentId);
+    
     if (!comment) {
       res.status(404).json({ message: '评论不存在' });
       return;
     }
 
-    // 检查是否是评论作者
-    if (comment.author.toString() !== userIdString) {
+    // 检查是否是评论作者或管理员
+    // 获取当前用户信息，检查是否是管理员
+    const currentUser = await User.findById(userIdString).select('role');
+    const isAdmin = currentUser?.role === 'admin';
+    
+    if (comment.author.toString() !== userIdString && !isAdmin) {
       res.status(403).json({ message: '没有权限删除此评论' });
       return;
     }
diff --git a/backend/src/controllers/user.controller.ts b/backend/src/controllers/user.controller.ts
index 5865abb..db009cc 100644
--- a/backend/src/controllers/user.controller.ts
+++ b/backend/src/controllers/user.controller.ts
@@ -2,7 +2,7 @@ import { Request, Response, NextFunction } from 'express';
 import User from '../models/user.model';
 import { AuthenticatedRequest } from '../middleware/auth.middleware';
 import mongoose from 'mongoose';
-import { saveFileToGridFS, getFileById, getGridFSBucket } from '../config/gridfs';
+import { saveFileToGridFS, getGridFSBucket } from '../config/gridfs';
 
 /**
  * @desc    获取用户资料
@@ -198,8 +198,14 @@ export const getAvatar = async (req: Request, res: Response, next: NextFunction)
 
     downloadStream.on('file', (file) => {
       console.log(`[getAvatar] Streaming file: ${file.filename}, contentType: ${file.contentType}`);
-      res.set('Content-Type', file.contentType);
+
+      // 设置内容类型和缓存头部
+      res.set('Content-Type', file.contentType || 'image/jpeg');
       res.set('Content-Disposition', `inline; filename="${file.filename}"`);
+      res.set('Cache-Control', 'public, max-age=86400'); // 缓存1天
+
+      // 确保CORS头部正确设置（虽然全局中间件应该已经处理了）
+      res.set('Access-Control-Allow-Origin', '*');
     });
 
     downloadStream.on('error', (err) => {
diff --git a/backend/src/index.ts b/backend/src/index.ts
index d91b269..4775b79 100644
--- a/backend/src/index.ts
+++ b/backend/src/index.ts
@@ -1,104 +1,119 @@
-import express, { Express, Request, Response, Application } from 'express';
+import express, { Express, Request, Response, NextFunction } from 'express';
 import dotenv from 'dotenv';
-import cors from 'cors'; // 添加 cors 导入
-import path from 'path'; // 添加 path 导入
+import cors from 'cors';
+import morgan from 'morgan';
+import helmet from 'helmet';
+import compression from 'compression';
 import authRoutes from './routes/auth.routes'; // 导入认证路由
 import resourceRoutes from './routes/resource.routes'; // 导入资源路由
-import userRoutes from './routes/user.routes'; // 导入用户相关路由
-import commentRoutes from './routes/comment.routes'; // 导入评论相关路由
-import favoriteRoutes from './routes/favorite.routes'; // 导入收藏相关路由
-import downloadRoutes from './routes/download.routes'; // 导入下载相关路由
-import ratingRoutes from './routes/rating.routes'; // 导入评分相关路由
-import adminRoutes from './routes/admin.routes'; // 导入管理员路由
-import notificationRoutes from './routes/notification.routes'; // 导入通知路由
+import userRoutes from './routes/user.routes'; // 导入用户路由
+import ratingRoutes from './routes/rating.routes'; // 导入评分路由
+import notificationRoutes from './routes/notification.routes'; // 导入通知
 import categoryRoutes from './routes/category.routes'; // 导入分类路由
 import tagRoutes from './routes/tag.routes'; // 导入标签路由
 import settingRoutes from './routes/setting.routes'; // 导入设置路由
 import connectDB from './config/db'; // 导入数据库连接函数
 import { errorHandler } from './middleware/error.middleware'; // 导入错误处理中间件
-import mongoose from 'mongoose';
-import bcrypt from 'bcryptjs';
-import jwt from 'jsonwebtoken';
-import { body, validationResult } from 'express-validator';
-import User from './models/user.model'; // 导入 User 模型
+import { protect, AuthenticatedRequest } from './middleware/auth.middleware'; // 导入认证中间件
+import { deleteComment } from './controllers/comment.controller'; // 导入评论控制器
 
 // For env File
 dotenv.config();
 
-// Connect to Database
-connectDB();
-
-const app: Application = express();
+const app: Express = express();
 const port = process.env.PORT || 5001;
+const NODE_ENV = process.env.NODE_ENV || 'development';
+
+// 连接数据库
+connectDB();
 
-// 添加 CORS 中间件
+// 中间件
+// CORS配置 - 允许所有来源访问头像等静态资源
 app.use(cors({
-  origin: 'http://localhost:3000', // 允许前端开发服务器的域名
-  credentials: true, // 允许携带凭证（cookies等）
-  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 允许的 HTTP 方法
-  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
+  origin: function (origin, callback) {
+    // 允许没有origin的请求（如移动应用、Postman等）
+    if (!origin) return callback(null, true);
+
+    // 允许localhost的所有端口
+    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
+      return callback(null, true);
+    }
+
+    // 在生产环境中，这里应该检查具体的域名
+    return callback(null, true);
+  },
+  credentials: true, // 允许携带凭证
+  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'], // 允许的HTTP方法
+  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // 允许的请求头
+  exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition', 'Cache-Control'] // 暴露给前端的响应头
 }));
 
-// Middleware to parse JSON bodies
 app.use(express.json());
+app.use(express.urlencoded({ extended: true }));
+
+// 安全中间件配置
+app.use(helmet({
+  crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许跨域资源
+  crossOriginEmbedderPolicy: false // 禁用COEP以避免图片加载问题
+}));
+
+app.use(compression());
 
-// 添加静态文件服务
-// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
+// 日志中间件
+if (process.env.NODE_ENV === 'development') {
+  app.use(morgan('dev'));
+}
 
-// 添加请求日志中间件
-app.use((req: Request, res: Response, next) => {
-  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
-  if (req.url.includes('/avatar')) {
-    console.log(`[AVATAR REQUEST] ${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`);
-  }
+// 添加简单的请求日志中间件
+app.use((req: Request, _res: Response, next: NextFunction) => {
+  console.log(`${req.method} ${req.url}`);
   next();
 });
 
-app.get('/', (req: Request, res: Response) => {
+app.get('/', (_req: Request, res: Response) => {
   res.send('Welcome to Express & TypeScript Server for Resource Sharing Platform');
 });
 
 // Mount auth routes
 app.use('/api/auth', authRoutes);
 
-// 先挂载特定路由，如评论相关的完整路径
-// 为了支持 /api/resources/:id/comments 路径
-app.use('/api', commentRoutes);
+// 分别挂载评论路由的不同部分
+// 资源评论相关路由
+app.use('/api/resources', resourceRoutes); // 挂载资源路由
+
+// 评论操作相关路由（删除、更新、点赞等）
+app.delete('/api/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
+  return deleteComment(req, res, next);
+});
+
+// 评分相关路由
 app.use('/api', ratingRoutes); // 挂载评分路由
 
 // 再挂载其他常规路由
-// Mount resource routes
-app.use('/api/resources', resourceRoutes); // 挂载资源路由
-
 // Mount user routes
 app.use('/api/users', userRoutes); // 挂载用户路由
 
-// Mount favorite routes
-app.use('/api/favorites', favoriteRoutes); // 挂载收藏路由
-
-// Mount download routes
-app.use('/api/downloads', downloadRoutes); // 挂载下载路由
-
-// Mount admin routes
-app.use('/api/admin', adminRoutes); // 挂载管理员路由
-
-// Mount notification routes
-app.use('/api/notifications', notificationRoutes); // 挂载通知路由
-
-// Mount category routes
+// 挂载其他路由
 app.use('/api/categories', categoryRoutes); // 挂载分类路由
-
-// Mount tag routes
 app.use('/api/tags', tagRoutes); // 挂载标签路由
-
-// Mount setting routes
+app.use('/api/notifications', notificationRoutes); // 挂载通知路由
 app.use('/api/settings', settingRoutes); // 挂载设置路由
 
-// Error Handling Middleware (must be last)
+// 使用错误处理中间件
 app.use(errorHandler);
 
 app.listen(port, () => {
-  console.log(`🚀 Server running on port ${port}`);
-  console.log(`🌐 API available at: http://localhost:${port}/api`);
-  console.log(`👤 Avatar upload endpoint: http://localhost:${port}/api/users/:id/avatar`);
+  console.log(`⚡️[server]: Server is running at http://localhost:${port} in ${NODE_ENV} mode`);
+});
+
+// 处理未捕获的异常
+process.on('uncaughtException', (error) => {
+  console.error('Uncaught Exception:', error);
+  process.exit(1);
+});
+
+// 处理未处理的Promise拒绝
+process.on('unhandledRejection', (error) => {
+  console.error('Unhandled Rejection:', error);
+  process.exit(1);
 });
\ No newline at end of file
diff --git a/backend/src/middleware/auth.middleware.ts b/backend/src/middleware/auth.middleware.ts
index 8a76db0..63b65b6 100644
--- a/backend/src/middleware/auth.middleware.ts
+++ b/backend/src/middleware/auth.middleware.ts
@@ -1,8 +1,8 @@
 import { Request, Response, NextFunction } from 'express';
 import jwt from 'jsonwebtoken';
 import dotenv from 'dotenv';
-import User, { IUser } from '../models/user.model'; // 导入User模型
-import mongoose from 'mongoose';
+import User from '../models/user.model';
+
 
 dotenv.config();
 
@@ -17,37 +17,31 @@ if (!JWT_SECRET) {
 
 // Extend Express Request interface to include user payload from JWT
 export interface AuthenticatedRequest extends Request {
-  user?: { id: string; role: string }; // Or a more detailed IUserPayload
+  user?: {
+    id: string;
+    role: string;
+  };
 }
 
-export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
+/**
+ * 验证用户Token
+ * 在需要认证的路由前添加此中间件
+ */
+export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   let token;
 
+  // 检查headers中的authorization
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     try {
       token = req.headers.authorization.split(' ')[1];
-      // 在验证之前打印收到的Token和JWT_SECRET，用于调试
-      console.log('[DEBUG] Token received for verification:', token);
-      console.log('[DEBUG] JWT_SECRET used for verification:', JWT_SECRET);
-      
+
       const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; role: string; iat: number; exp: number };
 
       // Attach user info to request object
-      // 실제로는 decoded.id로 DB에서 사용자 정보를 조회해서 req.user에 할당하는 것이 좋음
-      // 여기서는 단순화를 위해 decoded payload를 그대로 사용
       req.user = { id: decoded.id, role: decoded.role };
       next();
       return;
-    } catch (error: any) { // 将 error 类型改为 any 以便访问其属性
-      // 添加更明确的日志
-      console.error('-----------------------------------------------------');
-      console.error('[AUTH ERROR] Token verification FAILED. Details below:');
-      console.error('[AUTH ERROR] Raw Token String:', token); // 打印原始token
-      console.error('[AUTH ERROR] Error Name:', error.name);
-      console.error('[AUTH ERROR] Error Message:', error.message);
-      console.error('[AUTH ERROR] Full Error Object:', JSON.stringify(error, null, 2));
-      console.error('-----------------------------------------------------');
-      
+    } catch (error: any) {
       res.status(401).json({ message: 'Not authorized, token failed' });
       return;
     }
@@ -59,6 +53,18 @@ export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunc
   }
 };
 
+/**
+ * 验证用户是否为管理员
+ * 在需要管理员权限的路由前添加此中间件
+ */
+export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
+  if (req.user && req.user.role === 'admin') {
+    next();
+  } else {
+    res.status(401).json({ message: 'Not authorized as an admin' });
+  }
+};
+
 // Middleware to restrict access based on roles
 export const authorize = (...roles: string[]) => {
   return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
@@ -93,7 +99,7 @@ export const checkPermission = (permission: string) => {
       return;
     }
     // 假设Role模型也会从其定义文件导入，如果存在的话
-    // const Role = mongoose.model('Role'); 
+    // const Role = mongoose.model('Role');
     // const role = await Role.findOne({ name: (user as any).role });
     // 为了避免潜在的Role模型重复定义，暂时注释掉上面两行，
     // 并假设user对象上直接有permissions字段或通过role关联的permissions
diff --git a/backend/src/routes/comment.routes.ts b/backend/src/routes/comment.routes.ts
index 5d7f72d..1780265 100644
--- a/backend/src/routes/comment.routes.ts
+++ b/backend/src/routes/comment.routes.ts
@@ -6,56 +6,34 @@ import {
   deleteComment,
   toggleCommentLike
 } from '../controllers/comment.controller';
-import { protect, AuthenticatedRequest } from '../middleware/auth.middleware'; // 导入AuthenticatedRequest类型
+import { protect } from '../middleware/auth.middleware';
 import { Request, Response, NextFunction } from 'express';
+import { AuthenticatedRequest } from '../middleware/auth.middleware';
 
 const router = Router();
 
 // 获取资源的评论
 router.get('/resources/:id/comments', (req: Request, res: Response, next: NextFunction) => {
-  console.log('[路由详细日志] GET /resources/:id/comments 命中');
-  console.log('路径参数:', req.params);
-  console.log('请求路径:', req.path);
-  console.log('请求URL:', req.originalUrl);
   return getResourceComments(req, res, next);
 });
 
 // 创建评论
 router.post('/resources/:id/comments', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
-  console.log('[路由详细日志] POST /resources/:id/comments 命中');
-  console.log('路径参数:', req.params);
-  console.log('请求路径:', req.path);
-  console.log('请求URL:', req.originalUrl);
-  console.log('请求体:', req.body);
-  console.log('用户信息:', req.user);
   return createComment(req, res, next);
 });
 
-// 更新评论 - 这些路由会被挂载到 /api/comments/:id
-router.put('/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
-  console.log('[路由详细日志] PUT /comments/:id 命中');
-  console.log('路径参数:', req.params);
-  console.log('请求路径:', req.path);
-  console.log('请求URL:', req.originalUrl);
-  console.log('请求体:', req.body);
+// 更新评论
+router.put('/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   return updateComment(req, res, next);
 });
 
 // 删除评论
-router.delete('/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
-  console.log('[路由详细日志] DELETE /comments/:id 命中');
-  console.log('路径参数:', req.params);
-  console.log('请求路径:', req.path);
-  console.log('请求URL:', req.originalUrl);
+router.delete('/comments/:id', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   return deleteComment(req, res, next);
 });
 
 // 点赞/取消点赞评论
-router.post('/:id/like', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
-  console.log('[路由详细日志] POST /comments/:id/like 命中');
-  console.log('路径参数:', req.params);
-  console.log('请求路径:', req.path);
-  console.log('请求URL:', req.originalUrl);
+router.post('/comments/:id/like', protect, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   return toggleCommentLike(req, res, next);
 });
 
diff --git a/backend/src/routes/user.routes.ts b/backend/src/routes/user.routes.ts
index c4ed226..87fca79 100644
--- a/backend/src/routes/user.routes.ts
+++ b/backend/src/routes/user.routes.ts
@@ -1,4 +1,4 @@
-import express, { Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
+import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
 import {
   getUserProfile,
   updateUserProfile,
@@ -8,7 +8,7 @@ import {
   getUserStats,
   getAvatar
 } from '../controllers/user.controller';
-import { protect, AuthenticatedRequest } from '../middleware/auth.middleware';
+import { protect } from '../middleware/auth.middleware';
 import { param, body, validationResult } from 'express-validator';
 import multer from 'multer';
 
diff --git a/frontend/src/app/admin/reviews/page.tsx b/frontend/src/app/admin/reviews/page.tsx
index 36aba94..0b51bdb 100644
--- a/frontend/src/app/admin/reviews/page.tsx
+++ b/frontend/src/app/admin/reviews/page.tsx
@@ -2,7 +2,6 @@
 
 import { useEffect, useState } from 'react';
 import { useAuth } from '@/context/AuthContext';
-import Link from 'next/link';
 import toast from 'react-hot-toast';
 
 interface Uploader {
@@ -149,7 +148,7 @@ export default function AdminReviews() {
   return (
     <div>
       <h1 className="text-2xl font-semibold mb-6">资源审核</h1>
-      
+
       {loading ? (
         <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
diff --git a/frontend/src/app/profile/downloads/page.tsx b/frontend/src/app/profile/downloads/page.tsx
index 47780b6..f66278b 100644
--- a/frontend/src/app/profile/downloads/page.tsx
+++ b/frontend/src/app/profile/downloads/page.tsx
@@ -5,7 +5,8 @@ import { useRouter } from 'next/navigation';
 import { useAuth } from '@/context/AuthContext';
 import Link from 'next/link';
 import toast from 'react-hot-toast';
-import { getDownloadHistory, Resource, PaginatedResourcesResponse } from '@/services/resource.service';
+import { Resource, PaginatedResourcesResponse } from '@/services/resource.service';
+import { getDownloadHistory } from '@/services/download.service';
 import ResourceCard from '@/components/resources/ResourceCard';
 import { ApiError } from '@/services/auth.service';
 
@@ -68,6 +69,12 @@ export default function DownloadsPage() {
           &larr; 返回个人中心
         </Link>
         <h1 className="text-3xl font-bold text-gray-800 dark:text-white">下载历史</h1>
+        <button
+          onClick={() => setRefreshKey(prev => prev + 1)}
+          className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
+        >
+          刷新
+        </button>
       </div>
 
       <div className="mt-6">
diff --git a/frontend/src/app/profile/page.tsx b/frontend/src/app/profile/page.tsx
index 393081c..6a08583 100644
--- a/frontend/src/app/profile/page.tsx
+++ b/frontend/src/app/profile/page.tsx
@@ -1,7 +1,7 @@
 'use client';
 
 import Link from 'next/link';
-// import Image from 'next/image'; //不再需要
+import Image from 'next/image';
 import React, { useEffect, useState } from 'react';
 import { useRouter } from 'next/navigation';
 import { useAuth } from '@/context/AuthContext';
@@ -74,10 +74,13 @@ export default function ProfilePage() {
         <div className="flex items-center mb-6">
           <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
             {currentUser.avatar ? (
-              <img
+              <Image
                 src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar`}
                 alt="用户头像"
-                className="w-full h-full object-cover"
+                width={80}
+                height={80}
+                className="object-cover"
+                style={{ width: '80px', height: '80px' }}
                 onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.png'; }}
               />
             ) : (
diff --git a/frontend/src/components/CommentSection.tsx b/frontend/src/components/CommentSection.tsx
index 39cd2a6..7158f46 100644
--- a/frontend/src/components/CommentSection.tsx
+++ b/frontend/src/components/CommentSection.tsx
@@ -3,6 +3,7 @@
 import React, { useState, useEffect } from 'react';
 import { format } from 'date-fns';
 import { zhCN } from 'date-fns/locale';
+import Image from 'next/image';
 import {
   HeartIcon,
   ChatBubbleLeftIcon,
@@ -11,17 +12,14 @@ import {
 } from '@heroicons/react/24/outline';
 import {
   HeartIcon as HeartIconSolid,
-  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
 } from '@heroicons/react/24/solid';
 import {
   getComments,
   createComment,
-  updateComment,
   deleteComment,
   toggleCommentLike,
   reportComment,
   Comment,
-  CommentAuthor,
 } from '@/services/comment.service';
 import { ApiError } from '@/services/auth.service';
 
@@ -241,10 +239,13 @@ export default function CommentSection({
         }`}
       >
         <div className="flex items-start space-x-3">
-          <img
-            src={comment.author.avatar || '/images/default-avatar.jpg'}
+          <Image
+            src={comment.author.avatar ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${comment.author._id}/avatar` : '/images/default-avatar.jpg'}
             alt={comment.author.username}
-            className="w-10 h-10 rounded-full"
+            width={40}
+            height={40}
+            className="rounded-full object-cover"
+            style={{ width: '40px', height: '40px' }}
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.src = '/images/default-avatar.jpg';
@@ -340,10 +341,13 @@ export default function CommentSection({
       {currentUser ? (
         <form onSubmit={handleSubmitComment} className="mb-8">
           <div className="flex items-start space-x-3">
-            <img
-              src={currentUser.avatar || '/images/default-avatar.jpg'}
+            <Image
+              src={currentUser.avatar ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentUser._id}/avatar` : '/images/default-avatar.jpg'}
               alt={currentUser.username}
-              className="w-10 h-10 rounded-full"
+              width={40}
+              height={40}
+              className="rounded-full object-cover"
+              style={{ width: '40px', height: '40px' }}
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = '/images/default-avatar.jpg';
@@ -434,4 +438,4 @@ export default function CommentSection({
       </div>
     </div>
   );
-} 
\ No newline at end of file
+}
\ No newline at end of file
diff --git a/frontend/src/components/Navbar.tsx b/frontend/src/components/Navbar.tsx
index 293d353..acb6ab3 100644
--- a/frontend/src/components/Navbar.tsx
+++ b/frontend/src/components/Navbar.tsx
@@ -2,6 +2,7 @@
 
 import React, { useState, useEffect } from 'react';
 import Link from 'next/link';
+import Image from 'next/image';
 import { usePathname } from 'next/navigation';
 import { useAuth } from '@/context/AuthContext';
 import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
@@ -168,10 +169,13 @@ const Navbar: React.FC = () => {
                   <span className="text-sm font-medium">{user?.username}</span>
                   <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                     {user?.avatar ? (
-                      <img
+                      <Image
                         src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user._id}/avatar`}
                         alt={user.username}
-                        className="h-full w-full object-cover"
+                        width={32}
+                        height={32}
+                        className="object-cover"
+                        style={{ width: '32px', height: '32px' }}
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                       />
                     ) : (
@@ -273,10 +277,13 @@ const Navbar: React.FC = () => {
                 <div className="flex-shrink-0">
                   <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                     {user?.avatar ? (
-                      <img
+                      <Image
                         src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user._id}/avatar`}
                         alt={user.username}
-                        className="h-full w-full object-cover"
+                        width={40}
+                        height={40}
+                        className="object-cover"
+                        style={{ width: '40px', height: '40px' }}
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                       />
                     ) : (
diff --git a/frontend/src/components/resources/CommentSection.tsx b/frontend/src/components/resources/CommentSection.tsx
index 8888d69..f937572 100644
--- a/frontend/src/components/resources/CommentSection.tsx
+++ b/frontend/src/components/resources/CommentSection.tsx
@@ -1,6 +1,7 @@
 'use client';
 
 import React, { useState, useEffect } from 'react';
+import Image from 'next/image';
 import { useAuth } from '@/context/AuthContext';
 import { ApiError, ApiErrorData } from '@/services/auth.service';
 import toast from 'react-hot-toast';
@@ -56,11 +57,11 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/resources/${resourceId}/comments?page=${page}&limit=${commentsPerPage}`
       );
       const data: PaginatedCommentsResponse = await response.json();
-      
+
       if (!response.ok) {
         const errorDataFromServer = await response.json().catch(() => ({})); // Try to get more error details
-        const errorData: ApiErrorData = { 
-          message: `获取评论失败 (状态: ${response.status})`, 
+        const errorData: ApiErrorData = {
+          message: `获取评论失败 (状态: ${response.status})`,
           errors: response.status === 404 ? [{ msg: '找不到评论资源' }] : errorDataFromServer.errors || [{msg: response.statusText}]
         };
         console.error('Fetch comments error details:', errorDataFromServer);
@@ -123,7 +124,7 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
 
       // 尝试解析JSON，即使响应不成功，以便获取错误信息
       const data = await response.json().catch(() => ({ message: `请求失败，状态码: ${response.status}` }));
-      
+
       if (!response.ok) {
         console.error('Submit comment error details:', data);
         throw new ApiError(response.status, data.message || '提交评论失败', data);
@@ -160,7 +161,7 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
 
     try {
       const response = await fetch(
-        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`, // 注意：删除评论的API路径与获取/创建不同
+        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`,
         {
           method: 'DELETE',
           headers: {
@@ -168,7 +169,7 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
           },
         }
       );
-      
+
       const data = await response.json().catch(() => ({ message: `请求失败，状态码: ${response.status}` }));
 
       if (!response.ok) {
@@ -258,10 +259,17 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
                   <div className="flex items-center space-x-3">
                     <div className="flex-shrink-0">
                       {comment.author.avatar ? (
-                        <img
-                          src={comment.author.avatar}
+                        <Image
+                          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${comment.author._id}/avatar`}
                           alt={comment.author.username}
-                          className="h-10 w-10 rounded-full"
+                          width={40}
+                          height={40}
+                          className="rounded-full object-cover"
+                          style={{ width: '40px', height: '40px' }}
+                          onError={(e) => {
+                            const target = e.target as HTMLImageElement;
+                            target.src = '/images/default-avatar.png';
+                          }}
                         />
                       ) : (
                         <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
@@ -312,4 +320,4 @@ export default function CommentSection({ resourceId, onCommentAdded }: CommentSe
       )}
     </div>
   );
-} 
\ No newline at end of file
+}
\ No newline at end of file
diff --git a/frontend/src/services/download.service.ts b/frontend/src/services/download.service.ts
index 132a956..a8fc85e 100644
--- a/frontend/src/services/download.service.ts
+++ b/frontend/src/services/download.service.ts
@@ -1,5 +1,5 @@
 import { ApiError } from './auth.service';
-import { Resource, PaginatedResourcesResponse } from './resource.service';
+import { PaginatedResourcesResponse } from './resource.service';
 
 const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
 
diff --git a/frontend/src/services/favorite.service.ts b/frontend/src/services/favorite.service.ts
index 94a699e..2c24813 100644
--- a/frontend/src/services/favorite.service.ts
+++ b/frontend/src/services/favorite.service.ts
@@ -1,5 +1,5 @@
 import { ApiError } from './auth.service';
-import { Resource, PaginatedResourcesResponse } from './resource.service';
+import { PaginatedResourcesResponse } from './resource.service';
 
 const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
 
