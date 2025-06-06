# culture-resources

## 项目简介
这是一个用于存放和管理电子资源链接的网站平台。用户可以在此平台上分享、查找、分类和管理各类电子资源的链接，如电子书、视频教程、学术文献、开源软件等资源。

## 开发状态
项目目前处于积极开发阶段，已完成基础架构搭建和核心功能实现，包括用户系统、资源管理、评论、收藏和评分等功能。最近完成了资源链接有效性检测功能，可以自动检测和标记失效的资源链接。接下来将进行系统设置功能的开发，完善网站的基本配置和通知设置。详细进度请查看[项目进度](#项目进度)和[当前开发状态](#当前开发状态)部分。

## 快速开始

### 前端开发
```bash
cd frontend
npm install
npm run dev
```
访问 http://localhost:3000 查看前端页面

### 后端开发
```bash
cd backend
npm install
npm run start:backend
```
后端API将在 http://localhost:5001 运行

## 核心功能

### 1. 用户系统
- **用户注册与登录**：支持邮箱登录注册 (手机号及第三方登录后续迭代支持)
- **用户角色管理**：所有注册用户均拥有上传和下载资源的权限。可进一步区分普通用户、贡献者、管理员等角色，主要用于内容审核、社区管理及高级功能授权。
- **个人中心**：用户可管理个人上传、收藏、下载历史
- **用户积分体系**：鼓励用户分享优质资源，获取积分奖励

### 2. 资源管理
- **资源链接添加**：支持用户添加各类电子资源的链接
- **资源信息管理**：为每个资源添加标题、描述、封面图片、资源类型等元数据
- **资源状态控制**：支持标记资源链接的有效性，自动检测失效链接
- **资源版本管理**：支持记录资源更新历史，维护最新版本

### 3. 分类与标签系统
- **多级分类**：支持创建多层级的资源分类目录
- **标签管理**：为资源添加多个标签，便于多维度归类
- **自定义分类**：管理员可灵活配置分类体系
- **热门标签展示**：自动统计并展示热门标签

### 4. 搜索与筛选
- **全文搜索**：支持对资源标题、描述等进行全文检索
- **高级筛选**：按分类、标签、格式、上传时间等多条件筛选
- **搜索建议**：智能提供搜索关键词建议
- **搜索历史**：记录用户搜索历史，便于快速重复搜索

### 5. 社区互动
- **资源评分**：用户可对资源质量进行评分
- **评论系统**：支持对资源进行评论和讨论
- **资源收藏**：用户可收藏感兴趣的资源
- **分享功能**：方便分享资源到社交媒体

### 6. 界面与体验
- **响应式设计**：适配PC端、平板和移动设备
- **主题切换**：支持浅色/深色模式切换
- **个性化推荐**：基于用户兴趣和行为推荐相关资源
- **最近浏览记录**：自动保存用户最近浏览的资源

### 7. 数据统计与分析
- **资源热度统计**：记录并展示资源的浏览量、下载量、收藏数
- **用户行为分析**：分析用户偏好，优化推荐算法
- **趋势报告**：定期生成热门资源趋势报告
- **数据可视化**：以图表形式展示各类统计数据

### 8. 安全与权限
- **资源审核机制**：新增资源需经过审核，确保内容合规
- **访问权限控制**：部分资源可设置访问权限（公开、私有、指定用户）
- **防盗链措施**：保护资源不被非法调用
- **举报功能**：用户可举报违规内容

### 9. 系统管理
- **管理后台**：强大的后台管理系统，便于维护网站
- **数据备份**：定期备份系统数据，防止数据丢失
- **系统监控**：监控系统运行状态，及时发现并解决问题
- **站点公告**：发布网站公告、更新日志等信息

### 10. 扩展功能
- **API接口**：提供开放API，便于第三方应用集成
- **插件系统**：支持功能扩展插件
- **多语言支持**：支持多种语言界面切换
- **离线访问**：支持将资源信息保存到本地，离线浏览

## 技术栈
- 前端：React (Next.js)
- 后端：Node.js (Express)
- 数据库：MongoDB
- 搜索引擎：Elasticsearch 或 MongoDB 自带的全文搜索
- 部署环境：Docker + Nginx

## 部署要求
- Node.js 18+
- MongoDB 6+
- Docker 20+
- Nginx 1.20+

## 开发计划
1. **第一阶段：基础架构搭建**
   - 搭建前端项目结构
   - 搭建后端项目结构
   - 配置数据库和搜索引擎
   - 实现用户注册和登录功能

2. **第二阶段：核心功能开发**
   - 实现资源上传和管理功能
   - 实现资源分类和标签系统
   - 实现资源搜索和筛选功能
   - 实现资源下载和访问功能

3. **第三阶段：社区功能开发**
   - 实现评论和评分系统
   - 实现收藏和分享功能
   - 实现用户个人中心
   - 实现资源推荐系统

4. **第四阶段：系统优化和扩展**
   - 实现资源审核机制
   - 实现数据统计和分析功能
   - 实现系统监控和备份功能
   - 实现API接口和插件系统

## 贡献指南

### 如何贡献
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

### 开发规范
- **代码风格**: 使用ESLint和Prettier进行代码格式化
- **提交规范**: 遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范
  - `feat`: 新功能
  - `fix`: 修复bug
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `refactor`: 代码重构
  - `test`: 测试相关
  - `chore`: 构建过程或辅助工具的变动
- **分支管理**:
  - `main`: 主分支，用于生产环境
  - `develop`: 开发分支，用于开发环境
  - `feature/*`: 功能分支，用于开发新功能
  - `bugfix/*`: 修复分支，用于修复bug
  - `release/*`: 发布分支，用于版本发布

### 测试要求
- 所有新功能必须包含单元测试
- 所有修复必须包含相关测试用例
- 测试覆盖率应保持在80%以上

### 文档要求
- 新功能必须更新相关文档
- API变更必须更新API文档
- 复杂逻辑必须添加详细注释

## 许可证
- MIT License

## 数据库设计

### 用户表 (users)
```json
{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "password": "String (hashed)",
  "role": "String (user/contributor/admin)",
  "avatar": "String (URL)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "lastLogin": "Date",
  "points": "Number",
  "status": "String (active/inactive/banned)"
}
```

### 资源表 (resources)
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "url": "String",
  "type": "String",
  "category": "ObjectId (ref: categories)",
  "tags": ["ObjectId (ref: tags)"],
  "uploader": "ObjectId (ref: users)",
  "status": "String (pending/approved/rejected)",
  "views": "Number",
  "downloads": "Number",
  "rating": "Number",
  "createdAt": "Date",
  "updatedAt": "Date",
  "version": "Number",
  "isPublic": "Boolean"
}
```

### 分类表 (categories)
```json
{
  "_id": "ObjectId",
  "name": "String",
  "parent": "ObjectId (ref: categories)",
  "level": "Number",
  "order": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 标签表 (tags)
```json
{
  "_id": "ObjectId",
  "name": "String",
  "count": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 评论表 (comments)
```json
{
  "_id": "ObjectId",
  "resource": "ObjectId (ref: resources)",
  "user": "ObjectId (ref: users)",
  "content": "String",
  "rating": "Number",
  "createdAt": "Date",
  "updatedAt": "Date",
  "status": "String (active/hidden)"
}
```

### 收藏表 (favorites)
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: users)",
  "resource": "ObjectId (ref: resources)",
  "createdAt": "Date"
}
```

### 下载历史表 (downloads)
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: users)",
  "resource": "ObjectId (ref: resources)",
  "ip": "String",
  "userAgent": "String",
  "createdAt": "Date"
}
```

## API接口设计

### 用户相关
- POST /auth/register - 用户注册
- POST /auth/login - 用户登录
- GET /auth/logout - 用户登出
- GET /users/profile - 获取用户信息
- PUT /users/profile - 更新用户信息
- GET /users/favorites - 获取用户收藏
- GET /users/uploads - 获取用户上传

### 资源相关
- GET /resources - 获取资源列表
- POST /resources - 创建新资源
- GET /resources/:id - 获取资源详情
- PUT /resources/:id - 更新资源信息
- DELETE /resources/:id - 删除资源
- PATCH /resources/:id/increment-download - 增加资源下载计数
- PUT /resources/:id/check-link - 检查资源链接有效性（管理员）
- POST /resources/check-links - 批量检查资源链接（管理员）

### 分类相关
- GET /categories - 获取分类列表
- POST /categories - 创建新分类
- PUT /categories/:id - 更新分类
- DELETE /categories/:id - 删除分类

### 标签相关
- GET /tags - 获取标签列表
- POST /tags - 创建新标签
- PUT /tags/:id - 更新标签
- DELETE /tags/:id - 删除标签

### 评论相关
- GET /resources/:id/comments - 获取资源评论
- POST /resources/:id/comments - 添加评论
- PUT /comments/:id - 更新评论
- DELETE /comments/:id - 删除评论
- POST /comments/:id/like - 点赞/取消点赞评论

### 评分相关
- POST /resources/:id/rate - 为资源评分
- GET /resources/:id/rating - 获取用户对资源的评分
- GET /resources/:id/ratings/stats - 获取资源评分统计
- GET /ratings/user/:userId - 获取用户评分历史

### 收藏相关
- GET /favorites - 获取用户收藏的资源列表
- POST /resources/:id/favorite - 收藏资源
- DELETE /resources/:id/favorite - 取消收藏资源
- GET /resources/:id/favorite - 检查用户是否已收藏资源

### 下载相关
- POST /resources/:id/download - 记录资源下载
- GET /downloads/user/:userId - 获取用户下载历史

### 搜索相关
- GET /search - 搜索资源
- GET /search/suggestions - 获取搜索建议
- GET /search/history - 获取搜索历史

### 系统设置相关
- GET /settings - 获取系统设置
- PUT /settings - 更新系统设置
- GET /settings/:group - 获取特定组的系统设置
- PUT /settings/:group - 更新特定组的系统设置

### 通知相关
- GET /notifications - 获取用户通知
- PUT /notifications/:id - 标记通知为已读
- DELETE /notifications/:id - 删除通知
- POST /notifications/read-all - 标记所有通知为已读

### 管理员相关
- GET /admin/dashboard - 获取管理员仪表盘数据
- GET /admin/resources - 获取所有资源（包括未审核）
- PUT /admin/resources/:id/status - 更新资源状态
- GET /admin/users - 获取所有用户
- PUT /admin/users/:id/role - 更新用户角色
- GET /admin/settings - 获取系统设置
- PUT /admin/settings - 更新系统设置

## 前端页面设计

### 用户端页面
- 首页 (Home)
- 资源列表页 (ResourceList)
- 资源详情页 (ResourceDetail)
- 搜索结果页 (SearchResults)
- 用户登录页 (Login)
- 用户注册页 (Register)

### 用户中心 (用户端)
- 个人资料页 (Profile)
- 我的上传 (MyUploads)
- 我的收藏 (MyFavorites)
- 下载历史 (DownloadHistory)
- 消息中心 (Messages)

### 管理后台页面
- 管理后台登录页 (AdminLogin)
- 仪表盘 (Dashboard)
- 用户管理 (UserManagement)
- 资源管理 (ResourceManagement)
- 分类管理 (CategoryManagement)
- 标签管理 (TagManagement)
- 评论管理 (CommentManagement)
- 系统设置 (SystemSettings)
- 站点公告管理 (SiteAnnouncementManagement)

## 安全措施
1. 用户认证
   - JWT token认证
   - 密码加密存储
   - 登录失败限制
   - 会话管理

2. 数据安全
   - 数据加密传输
   - 敏感信息脱敏
   - 定期数据备份
   - 访问权限控制

3. 接口安全
   - 请求频率限制
   - 参数验证
   - SQL注入防护
   - XSS防护

4. 系统安全
   - 日志记录
   - 异常监控
   - 防火墙配置
   - 定期安全审计

## 项目结构
```
culture-resources/
├── frontend/                # 前端项目 (包含用户端和管理后台)
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── components/     # 公共组件
│   │   ├── pages/         # 页面 (用户端页面，例如 /home, /resources)
│   │   │   └── admin/      # 管理后台页面 (例如 /admin/dashboard)
│   │   ├── styles/        # 样式
│   │   ├── utils/         # 工具函数
│   │   └── api/           # API接口调用
│   ├── package.json       # 依赖配置
│   └── README.md          # 前端说明
├── backend/                # 后端项目
│   ├── src/               # 源代码
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 服务
│   │   ├── utils/         # 工具函数
│   │   └── config/        # 配置文件
│   ├── package.json       # 依赖配置
│   └── README.md          # 后端说明
├── docker/                # Docker配置
│   ├── frontend/         # 前端Docker配置
│   ├── backend/          # 后端Docker配置
│   └── nginx/            # Nginx配置
├── docs/                  # 文档
│   ├── api/              # API文档
│   ├── database/         # 数据库文档
│   └── deployment/       # 部署文档
└── README.md             # 项目说明
```

## 开发规范

### 代码规范
1. 前端规范
   - 使用ESLint进行代码检查
   - 使用Prettier进行代码格式化
   - 遵循React最佳实践
   - 使用TypeScript进行类型检查

2. 后端规范
   - 使用ESLint进行代码检查
   - 使用Prettier进行代码格式化
   - 遵循RESTful API设计规范
   - 使用TypeScript进行类型检查

### Git规范
1. 分支管理
   - main: 主分支，用于生产环境
   - develop: 开发分支，用于开发环境
   - feature/*: 功能分支，用于开发新功能
   - bugfix/*: 修复分支，用于修复bug
   - release/*: 发布分支，用于版本发布

2. 提交规范
   - feat: 新功能
   - fix: 修复bug
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 代码重构
   - test: 测试相关
   - chore: 构建过程或辅助工具的变动

### 文档规范
1. 代码注释
   - 使用JSDoc规范
   - 关键代码必须添加注释
   - 复杂逻辑需要详细说明

2. API文档
   - 使用Swagger生成API文档
   - 详细说明接口参数和返回值
   - 提供接口示例

## 部署流程

### 开发环境
1. 安装依赖
   ```bash
   # 前端
   cd frontend
   npm install

   # 后端
   cd backend
   npm install
   ```

2. 启动服务
   ```bash
   # 前端
   npm run dev

   # 后端
   npm run dev
   ```

### 生产环境
1. 构建项目
   ```bash
   # 前端
   npm run build

   # 后端
   npm run build
   ```

2. Docker部署
   ```bash
   # 构建镜像
   docker-compose build

   # 启动服务
   docker-compose up -d
   ```

## 监控与维护

### 系统监控
1. 性能监控
   - 使用Prometheus收集指标
   - 使用Grafana展示监控数据
   - 设置性能告警阈值

2. 日志监控
   - 使用ELK收集日志
   - 设置日志告警规则
   - 定期分析日志数据

### 数据备份
1. 数据库备份
   - 每日全量备份
   - 每小时增量备份
   - 备份文件加密存储

2. 文件备份
   - 定期备份上传文件
   - 使用对象存储服务
   - 设置备份保留策略

## 性能优化

### 前端优化
1. 加载优化
   - 使用CDN加速
   - 图片懒加载
   - 代码分割
   - 资源预加载

2. 渲染优化
   - 虚拟列表
   - 防抖节流
   - 缓存优化
   - 按需加载

### 后端优化
1. 接口优化
   - 接口缓存
   - 数据压缩
   - 批量处理
   - 异步处理

2. 数据库优化
   - 索引优化
   - 查询优化
   - 连接池管理
   - 分库分表

## 测试策略

### 单元测试
1. 前端测试
   - 使用Jest进行单元测试
   - 使用React Testing Library测试组件
   - 测试覆盖率要求>80%

2. 后端测试
   - 使用Jest进行单元测试
   - 使用Supertest测试API
   - 测试覆盖率要求>80%

### 集成测试
1. 接口测试
   - 使用Postman进行接口测试
   - 编写自动化测试脚本
   - 定期运行测试套件

2. 性能测试
   - 使用JMeter进行压力测试
   - 设置性能基准
   - 监控性能指标

## 项目进度

### 第一阶段（1-2周）
- [x] 项目初始化
- [x] 需求分析
- [x] 技术选型
- [x] 数据库设计
- [x] API设计

### 第二阶段（3-4周）
- [x] 用户系统开发
  - [x] 用户注册/登录
  - [x] 用户认证中间件
  - [x] 用户信息管理
  - [x] 用户角色与权限管理
- [x] 资源管理开发
  - [x] 资源上传
  - [x] 资源列表与详情
  - [x] 资源更新与删除
  - [x] 资源下载计数
  - [ ] 资源版本管理
- [x] 分类系统开发
  - [x] 基础分类功能
  - [x] 多级分类
  - [x] 分类管理
- [x] 搜索功能开发
  - [x] 基础搜索
  - [ ] 高级筛选
  - [ ] 搜索建议

### 第三阶段（5-6周）
- [x] 社区功能开发
  - [x] 评论系统
  - [x] 收藏功能
  - [x] 评分系统
  - [ ] 举报功能
- [x] 管理后台开发 (独立前端模块或页面)
  - [x] 用户管理
  - [x] 资源审核
  - [x] 内容管理
- [x] 资源链接有效性检测
  - [x] 单个资源链接检测
  - [x] 批量资源链接检测
  - [x] 失效链接自动标记
- [ ] 系统优化
  - [ ] 性能优化
  - [ ] 用户体验优化
- [ ] 测试与修复
  - [ ] 单元测试
  - [ ] 集成测试
  - [ ] Bug修复

### 第四阶段（7-8周）
- [x] 系统设置功能
  - [x] 网站基本设置
  - [ ] 通知设置
  - [ ] 权限设置
- [ ] 部署准备
  - [ ] Docker配置
  - [ ] CI/CD流程
  - [ ] 环境配置文档
- [ ] 文档完善
  - [ ] API文档
  - [ ] 用户手册
  - [ ] 开发者文档
- [ ] 项目总结与规划

## 当前开发状态

### 功能开发进度

#### ✅ 已完成功能

**基础架构**
- ✅ 前端项目结构 (Next.js)
- ✅ 后端项目结构 (Express)
- ✅ 数据库连接 (MongoDB)
- ✅ 路由与控制器
- ✅ 中间件配置
- ✅ 暗色/亮色模式切换

**用户系统**
- ✅ 用户注册与登录
- ✅ JWT认证
- ✅ 用户信息管理
- ✅ 用户角色与权限管理
- ✅ 用户个人中心 (基础功能)

**资源管理**
- ✅ 资源上传与管理
- ✅ 资源列表与详情页
- ✅ 资源搜索与筛选
- ✅ 资源下载功能
- ✅ 资源状态管理（草稿、待审核、已发布、已拒绝、已终止）
- ✅ 资源链接有效性检测
- ❌ 资源版本管理

**社区功能**
- ✅ 评论系统
- ✅ 收藏功能
- ✅ 评分系统
- ✅ 相关资源推荐
- ❌ 举报功能

**管理后台**
- ✅ 管理后台布局与导航
- ✅ 管理员仪表盘
- ✅ 资源管理列表
- ✅ 资源审核功能
- ✅ 资源详情页
- ✅ 用户管理功能
- ✅ 分类管理功能
- ❌ 系统设置功能

**通知系统**
- ✅ 审核通知
- ✅ 通知管理

#### 🔄 最近完成的工作

**网站基本设置功能** (2023年12月)
- ✅ 网站名称、描述、Logo等基本信息设置
- ✅ 注册设置（是否开放注册、注册验证方式等）
- ✅ 资源上传设置（允许的文件类型、大小限制等）
- ✅ 设置分组管理
- ✅ 设置权限控制（公开/非公开）

**资源链接有效性检测** (2023年12月)
- ✅ 单个资源链接检测功能（支持管理员手动检查资源链接有效性）
- ✅ 批量资源链接检测功能（支持管理员批量检查所有资源链接）
- ✅ 自动将失效链接标记为"已终止"状态
- ✅ 失效原因记录与显示
- ✅ 通知上传者资源链接已失效

**分类管理功能** (2023年11月)
- ✅ 分类列表页面（支持搜索、筛选和分页）
- ✅ 分类创建功能（支持设置父分类，实现多级分类）
- ✅ 分类编辑功能（支持修改分类信息、父分类和状态）
- ✅ 分类删除功能（支持安全删除，防止误删有子分类或资源的分类）
- ✅ 标签管理功能（支持创建、编辑、删除和禁用标签）

**用户管理功能** (2023年10月)
- ✅ 用户列表页面（支持搜索、筛选和分页）
- ✅ 用户详情页面（展示用户基本信息和活动统计）
- ✅ 用户编辑功能（支持修改用户信息、角色和状态）
- ✅ 用户资源管理（查看用户上传的资源）
- ✅ 用户角色管理（支持设置用户为普通用户、贡献者或管理员）

**用户个人中心完善** (2023年9月)
- ✅ 用户资料编辑功能（支持头像上传和个人信息修改）
- ✅ 用户评分历史（展示用户对资源的评分记录）
- ✅ 用户活动统计（展示用户的上传、下载、评论等活动数据）

**资源审核流程** (2023年8月)
- ✅ 资源状态管理（草稿、待审核、已发布、已拒绝、已终止）
- ✅ 管理员审核界面
- ✅ 审核通知系统
- ✅ 资源状态变更API

#### 📋 待开发功能与计划

**近期开发计划（优先级由高到低）**

1️⃣ **系统设置功能**
- ✅ 网站基本设置
  - ✅ 实现网站名称、描述、Logo等基本信息设置
  - ✅ 实现注册设置（是否开放注册、注册验证方式等）
  - ✅ 实现资源上传设置（允许的文件类型、大小限制等）
- ❌ 通知设置
  - 📝 计划：实现系统通知模板配置
  - 📝 计划：实现通知发送方式设置（站内信、邮件等）


2️⃣ **下一版本（V2）计划开发功能**

**系统测试与优化**
- ❌ 单元测试
  - 📝 计划：编写核心功能的单元测试
  - 📝 计划：实现自动化测试流程
- ❌ 性能优化
  - 📝 计划：优化页面加载速度和后端响应时间
  - 📝 计划：实现数据库查询优化
  - 📝 计划：添加缓存机制
- ❌ 用户体验改进
  - 📝 计划：根据用户反馈优化界面交互
  - 📝 计划：改进移动端适配

**高级功能开发**
- ❌ 资源版本管理
  - 📝 计划：支持资源版本历史记录
  - 📝 计划：支持版本比较和回滚
- ❌ 举报功能
  - 📝 计划：实现内容举报机制
  - 📝 计划：实现举报处理流程
- ❌ 内容推荐算法
  - 📝 计划：基于用户行为的个性化推荐
  - 📝 计划：热门内容推荐

**系统功能**
- ❌ 数据统计与可视化
  - 📝 计划：用户活跃度分析
  - 📝 计划：资源使用情况统计
- ❌ 系统监控
  - 📝 计划：服务器性能监控
  - 📝 计划：异常报警机制
- ❌ API接口文档
  - 📝 计划：自动生成API文档
  - 📝 计划：API测试工具
- ❌ 多语言支持
- ❌ 离线访问




前后端对接口：
```

## 前后端接口一致性检查

为确保前后端接口的一致性，我们进行了以下修改：

1. **统一 API 基础 URL**：
   - 在所有前端服务文件中的 API_BASE_URL 默认值中添加 `/api` 后缀
   - 确保所有服务使用相同的 API_BASE_URL 定义：`process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'`
   - 这与后端路由挂载保持一致，后端在 index.ts 中将所有路由挂载在 `/api` 前缀下

2. **修正评论创建接口**：
   - 将 `comment.service.ts` 中的评论创建接口从 `/comments` 修改为 `/resources/:id/comments`，与后端路由保持一致
   - 调整请求体格式，只发送必要的内容字段

3. **统一变量命名**：
   - 将部分服务中的 `API_URL` 重命名为 `API_BASE_URL`，保持命名一致性

4. **更新 README 中的 API 接口设计**：
   - 添加了实际实现的接口，如评分相关、收藏相关等

这些修改确保了前后端接口的一致性，避免了由于路径不匹配导致的 404 错误。

目前前后端接口还没联调