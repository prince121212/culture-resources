diff --git a/README.md b/README.md
index 11d44c0..9969bab 100644
Binary files a/README.md and b/README.md differ
diff --git a/backend/src/controllers/admin.controller.ts b/backend/src/controllers/admin.controller.ts
index 02f3f02..ecc898f 100644
--- a/backend/src/controllers/admin.controller.ts
+++ b/backend/src/controllers/admin.controller.ts
@@ -6,7 +6,6 @@ import { AuthenticatedRequest } from '../middleware/auth.middleware';
 import mongoose from 'mongoose';
 // import Comment from '../models/comment.model'; // Commented out until the model is found/created
 import Favorite from '../models/favorite.model';
-import DownloadHistory from '../models/downloadHistory.model'; // Changed from Download to DownloadHistory
 import Rating from '../models/rating.model';
 import Category from '../models/category.model'; // Added import for Category
 import Tag from '../models/tag.model'; // Added import for Tag
@@ -345,7 +344,6 @@ export const getUserStats = async (req: AuthenticatedRequest, res: Response, nex
 
     const totalResourcesUploaded = await Resource.countDocuments({ uploader: id });
     const totalCollections = await Favorite.countDocuments({ user: id });
-    const totalDownloads = await DownloadHistory.countDocuments({ user: id }); // Changed from Download to DownloadHistory
     // const totalComments = await Comment.countDocuments({ user: id }); // Commented out until Comment model is available
     const totalRatings = await Rating.countDocuments({ user: id });
 
@@ -367,7 +365,6 @@ export const getUserStats = async (req: AuthenticatedRequest, res: Response, nex
     res.status(200).json({
       totalResourcesUploaded,
       totalCollections,
-      totalDownloads,
       // totalComments,
       totalRatings,
       recentUploads,
@@ -434,7 +431,6 @@ export const getSystemStats = async (req: AuthenticatedRequest, res: Response, n
     const totalRejectedResources = await Resource.countDocuments({ status: 'rejected' });
     const totalCategories = await Category.countDocuments();
     const totalTags = await Tag.countDocuments();
-    const totalDownloads = await DownloadHistory.countDocuments(); // Changed from Download to DownloadHistory
     // const totalComments = await Comment.countDocuments(); // Commented out until Comment model is available
     const totalRatings = await Rating.countDocuments();
     const totalFavorites = await Favorite.countDocuments();
@@ -460,7 +456,6 @@ export const getSystemStats = async (req: AuthenticatedRequest, res: Response, n
       totalRejectedResources,
       totalCategories,
       totalTags,
-      totalDownloads,
       // totalComments,
       totalRatings,
       totalFavorites,
diff --git a/backend/src/controllers/download.controller.ts b/backend/src/controllers/download.controller.ts
deleted file mode 100644
index dcb5017..0000000
--- a/backend/src/controllers/download.controller.ts
+++ /dev/null
@@ -1,109 +0,0 @@
-import { Request, Response, NextFunction } from 'express';
-import mongoose from 'mongoose';
-import { AuthenticatedRequest } from '../middleware/auth.middleware';
-import Resource, { IResource } from '../models/resource.model';
-import DownloadHistory, { IDownloadHistory } from '../models/downloadHistory.model';
-
-/**
- * @desc    记录资源下载
- * @route   POST /api/resources/:id/download
- * @access  Private
- */
-export const recordDownload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
-  try {
-    const resourceId = req.params.id;
-    const userId = req.user?.id;
-
-    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
-      res.status(400).json({ message: '无效的资源ID' });
-      return;
-    }
-
-    // 检查资源是否存在
-    const resource = await Resource.findById(resourceId);
-    if (!resource) {
-      res.status(404).json({ message: '资源不存在' });
-      return;
-    }
-
-    // 创建下载记录
-    const downloadRecord = new DownloadHistory({
-      user: userId,
-      resource: resourceId,
-      downloadDate: new Date(),
-    });
-
-    await downloadRecord.save();
-
-    // 增加资源的下载计数
-    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });
-
-    res.status(201).json({ message: '下载记录已保存' });
-    return;
-  } catch (error) {
-    next(error);
-  }
-};
-
-/**
- * @desc    获取用户的下载历史
- * @route   GET /api/downloads
- * @access  Private
- */
-export const getDownloadHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
-  try {
-    const userId = req.user?.id;
-    const page = parseInt(req.query.page as string) || 1;
-    const limit = parseInt(req.query.limit as string) || 10;
-    const skip = (page - 1) * limit;
-
-    const totalDownloads = await DownloadHistory.countDocuments({ user: userId });
-    
-    const downloads = await DownloadHistory.find({ user: userId })
-      .populate<{
-        resource: IResource & { uploader: { username: string; email: string } };
-      }>({
-        path: 'resource',
-        populate: {
-          path: 'uploader',
-          select: 'username email'
-        }
-      })
-      .sort({ downloadDate: -1 })
-      .skip(skip)
-      .limit(limit) as (IDownloadHistory & { resource: IResource & { uploader: { username: string; email: string } } })[];
-
-    // 提取资源数据并添加下载日期
-    const resources = downloads.map((download: IDownloadHistory & { resource: IResource & { uploader: { username: string; email: string } } }) => {
-      if (download.resource && typeof download.resource === 'object' && 'toObject' in download.resource) {
-        const resourceObj = (download.resource as any).toObject();
-        return {
-          ...resourceObj,
-          downloadDate: download.downloadDate
-        };
-      }
-      return {
-        _id: download.resource,
-        downloadDate: download.downloadDate 
-      };
-    });
-
-    res.status(200).json({
-      data: resources,
-      pagination: {
-        currentPage: page,
-        totalPages: Math.ceil(totalDownloads / limit),
-        totalResources: totalDownloads,
-        limit,
-      },
-    });
-    return;
-  } catch (error) {
-    next(error);
-  }
-};
-
-export default {
-  recordDownload,
-  getDownloadHistory,
-};
diff --git a/backend/src/controllers/user.controller.ts b/backend/src/controllers/user.controller.ts
index db009cc..98d820a 100644
--- a/backend/src/controllers/user.controller.ts
+++ b/backend/src/controllers/user.controller.ts
@@ -326,17 +326,6 @@ export const getUserStats = async (req: AuthenticatedRequest, res: Response, nex
       uploads.total += stat.count;
     });
 
-    // 获取用户下载统计
-    const DownloadHistory = mongoose.model('DownloadHistory');
-    const now = new Date();
-    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
-
-    const totalDownloads = await DownloadHistory.countDocuments({ user: userId });
-    const monthlyDownloads = await DownloadHistory.countDocuments({
-      user: userId,
-      downloadDate: { $gte: firstDayOfMonth }
-    });
-
     // 获取用户评分统计
     const Rating = mongoose.model('Rating');
 
@@ -416,10 +405,6 @@ export const getUserStats = async (req: AuthenticatedRequest, res: Response, nex
     // 组合所有统计数据
     const stats = {
       uploads,
-      downloads: {
-        total: totalDownloads,
-        lastMonth: monthlyDownloads
-      },
       ratings: {
         given: givenRatingsCount,
         averageGiven: averageGivenRating,
diff --git a/backend/src/models/downloadHistory.model.ts b/backend/src/models/downloadHistory.model.ts
deleted file mode 100644
index ee8bb37..0000000
--- a/backend/src/models/downloadHistory.model.ts
+++ /dev/null
@@ -1,41 +0,0 @@
-import mongoose, { Document, Schema } from 'mongoose';
-import { IUser } from './user.model';
-import { IResource } from './resource.model';
-
-// 定义DownloadHistory文档的接口
-export interface IDownloadHistory extends Document {
-  user: IUser['_id']; 
-  resource: IResource['_id']; 
-  downloadDate: Date;
-  createdAt: Date;
-  updatedAt: Date;
-}
-
-// 创建下载历史模型Schema
-const downloadHistorySchema = new Schema(
-  {
-    user: {
-      type: mongoose.Schema.Types.ObjectId,
-      ref: 'User',
-      required: true,
-    },
-    resource: {
-      type: mongoose.Schema.Types.ObjectId,
-      ref: 'Resource',
-      required: true,
-    },
-    downloadDate: {
-      type: Date,
-      default: Date.now,
-    },
-  },
-  {
-    timestamps: true,
-  }
-);
-
-// 使用 IDownloadHistory 接口作为 Mongoose 模型的类型
-// 并通过 mongoose.models 检查防止重复编译
-const DownloadHistory = mongoose.models.DownloadHistory || mongoose.model<IDownloadHistory>('DownloadHistory', downloadHistorySchema);
-
-export default DownloadHistory; 
\ No newline at end of file
diff --git a/backend/src/routes/download.routes.ts b/backend/src/routes/download.routes.ts
deleted file mode 100644
index a3511d6..0000000
--- a/backend/src/routes/download.routes.ts
+++ /dev/null
@@ -1,47 +0,0 @@
-import { Router } from 'express';
-import { Request, Response, NextFunction } from 'express';
-import mongoose from 'mongoose';
-import {
-  recordDownload,
-  getDownloadHistory
-} from '../controllers/download.controller';
-import { protect } from '../middleware/auth.middleware';
-import Resource from '../models/resource.model';
-import { AuthenticatedRequest } from '../middleware/auth.middleware';
-
-const router = Router();
-
-// 获取用户下载历史
-router.get('/', protect, getDownloadHistory);
-
-// 记录资源下载
-router.post('/resources/:id/download', protect, recordDownload);
-
-// 下载资源（公开访问）
-router.get('/download/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
-  try {
-    const resourceId = req.params.id;
-
-    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
-      res.status(400).json({ message: '无效的资源ID' });
-      return;
-    }
-
-    const resource = await Resource.findById(resourceId);
-    if (!resource) {
-      res.status(404).json({ message: '资源不存在' });
-      return;
-    }
-
-    // 增加资源的下载计数
-    await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });
-
-    // 重定向到资源链接
-    res.redirect(resource.link);
-    return;
-  } catch (error) {
-    next(error);
-  }
-});
-
-export default router;
\ No newline at end of file
diff --git a/backend/src/seedData.ts b/backend/src/seedData.ts
index 6e0ad78..16a02e5 100644
--- a/backend/src/seedData.ts
+++ b/backend/src/seedData.ts
@@ -6,7 +6,6 @@ import Resource, { IResource } from './models/resource.model';
 import Category, { ICategory } from './models/category.model';
 import Tag, { ITag } from './models/tag.model';
 import Rating from './models/rating.model';
-import DownloadHistory from './models/downloadHistory.model';
 import Favorite from './models/favorite.model';
 import Notification from './models/notification.model';
 
@@ -40,10 +39,6 @@ const seedData = async () => {
         await Rating.collection.dropIndexes();
         console.log('Indexes dropped for Ratings collection.');
       }
-      if (mongoose.connection.collections.downloadhistories) {
-        await DownloadHistory.collection.dropIndexes();
-        console.log('Indexes dropped for DownloadHistory collection.');
-      }
       if (mongoose.connection.collections.favorites) {
         await Favorite.collection.dropIndexes();
         console.log('Indexes dropped for Favorites collection.');
@@ -65,7 +60,6 @@ const seedData = async () => {
     await Category.deleteMany({});
     await Tag.deleteMany({});
     await Rating.deleteMany({});
-    await DownloadHistory.deleteMany({});
     await Favorite.deleteMany({});
     await Notification.deleteMany({});
 
@@ -334,34 +328,6 @@ const seedData = async () => {
     
     console.log('Ratings created...');
     
-    // 创建下载历史
-    console.log('Creating download history...');
-    await DownloadHistory.create({
-      user: regularUser1._id,
-      resource: resource3._id,
-      downloadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天前
-    });
-    
-    await DownloadHistory.create({
-      user: regularUser2._id,
-      resource: resource1._id,
-      downloadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
-    });
-    
-    await DownloadHistory.create({
-      user: regularUser3._id,
-      resource: resource2._id,
-      downloadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
-    });
-    
-    await DownloadHistory.create({
-      user: moderatorUser._id,
-      resource: resource4._id,
-      downloadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5天前
-    });
-    
-    console.log('Download history created...');
-    
     // 创建收藏记录
     console.log('Creating favorites...');
     await Favorite.create({
diff --git a/diff.md b/diff.md
index 82b838e..3b51096 100644
--- a/diff.md
+++ b/diff.md
@@ -1,592 +0,0 @@
-﻿diff --git a/backend/src/controllers/category.controller.ts b/backend/src/controllers/category.controller.ts
-index 0e159ca..0244453 100644
---- a/backend/src/controllers/category.controller.ts
-+++ b/backend/src/controllers/category.controller.ts
-@@ -9,7 +9,7 @@ import { AuthenticatedRequest } from '../middleware/auth.middleware';
- // @access  Public
- export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
-   try {
--    const { flat, activeOnly } = req.query;
-+    const { flat, activeOnly, withResourceCount } = req.query;
-     const query: any = {};
- 
-     // 如果指定了只获取活跃分类
-@@ -22,7 +22,41 @@ export const getCategories = async (req: Request, res: Response, next: NextFunct
-       .sort({ level: 1, order: 1 })
-       .select('name description parent level order path isActive');
- 
--    // 如果请求扁平结构，直接返回
-+    // 默认添加资源计数，除非明确指定不需要
-+    if (withResourceCount !== 'false') {
-+      // 获取每个分类的资源计数
-+      const categoryIds = categories.map(cat => (cat._id as mongoose.Types.ObjectId).toString());
-+      
-+      // 获取所有资源的分类统计
-+      const resourceCounts = await Resource.aggregate([
-+        { $match: { category: { $in: categoryIds } } },
-+        { $group: { _id: '$category', count: { $sum: 1 } } }
-+      ]);
-+      
-+      // 将计数添加到分类对象中
-+      const categoriesWithCount = categories.map(category => {
-+        const categoryObj = category.toObject();
-+        const categoryId = (categoryObj._id as mongoose.Types.ObjectId).toString();
-+        const resourceCount = resourceCounts.find(rc => rc._id === categoryId);
-+        
-+        // 确保resourceCount字段存在
-+        return {
-+          ...categoryObj,
-+          resourceCount: resourceCount ? resourceCount.count : 0
-+        };
-+      });
-+      
-+      // 如果请求扁平结构，直接返回带有计数的分类
-+      if (flat === 'true') {
-+        return res.status(200).json(categoriesWithCount);
-+      }
-+      
-+      // 构建树形结构
-+      const categoryTree = buildCategoryTree(categoriesWithCount);
-+      return res.status(200).json(categoryTree);
-+    }
-+    
-+    // 如果明确指定不需要资源计数，按原来的逻辑处理
-     if (flat === 'true') {
-       return res.status(200).json(categories);
-     }
-@@ -258,20 +292,25 @@ const buildCategoryTree = (categories: any[]) => {
- 
-   // 首先将所有分类映射到一个Map中，以便快速查找
-   categories.forEach(category => {
--    categoryMap.set(category._id.toString(), {
--      ...category.toObject(),
-+    // 检查category是否已经是普通对象
-+    const categoryObj = typeof category.toObject === 'function' ? category.toObject() : category;
-+    
-+    categoryMap.set(categoryObj._id.toString(), {
-+      ...categoryObj,
-       children: []
-     });
-   });
- 
-   // 然后构建树形结构
-   categories.forEach(category => {
--    const categoryId = category._id.toString();
-+    // 确保我们使用的是对象而不是mongoose文档
-+    const categoryObj = typeof category.toObject === 'function' ? category.toObject() : category;
-+    const categoryId = categoryObj._id.toString();
-     const categoryWithChildren = categoryMap.get(categoryId);
- 
--    if (category.parent) {
-+    if (categoryObj.parent) {
-       // 如果有父分类，将当前分类添加到父分类的children数组中
--      const parentId = category.parent.toString();
-+      const parentId = categoryObj.parent.toString();
-       const parent = categoryMap.get(parentId);
-       if (parent) {
-         parent.children.push(categoryWithChildren);
-diff --git a/backend/src/controllers/rating.controller.ts b/backend/src/controllers/rating.controller.ts
-index 794577e..b0759b3 100644
---- a/backend/src/controllers/rating.controller.ts
-+++ b/backend/src/controllers/rating.controller.ts
-@@ -71,7 +71,7 @@ export const getUserRating = async (req: AuthenticatedRequest, res: Response, ne
-     const userRating = await Rating.findOne({ resource: resourceId, user: userId });
- 
-     if (!userRating) {
--      return res.status(404).json({ message: '未找到评分记录' });
-+      return res.status(200).json({ message: '未找到评分记录' });
-     }
- 
-     res.status(200).json(userRating);
-diff --git a/backend/src/controllers/resource.controller.ts b/backend/src/controllers/resource.controller.ts
-index f713c7f..f99d6e5 100644
---- a/backend/src/controllers/resource.controller.ts
-+++ b/backend/src/controllers/resource.controller.ts
-@@ -54,6 +54,11 @@ export const getResources = async (req: Request, res: Response, next: NextFuncti
- 
-     // Build query object
-     const query: any = {};
-+    
-+    // 如果明确指定了状态，则按状态过滤，否则不过滤状态
-+    if (req.query.status && req.query.status !== 'all') {
-+      query.status = req.query.status;
-+    }
- 
-     // Filtering by keyword (searches title and description)
-     if (req.query.keyword) {
-@@ -63,7 +68,8 @@ export const getResources = async (req: Request, res: Response, next: NextFuncti
- 
-     // Filtering by category (exact match)
-     if (req.query.category) {
--      query.category = req.query.category as string;
-+      const category = req.query.category as string;
-+      query.category = category;
-     }
- 
-     // Filtering by tags (matches if resource contains ANY of the provided tags)
-@@ -77,9 +83,7 @@ export const getResources = async (req: Request, res: Response, next: NextFuncti
-     // Filtering by uploaderId
-     if (uploaderId) {
-       if (!mongoose.Types.ObjectId.isValid(uploaderId as string)) {
--        // Optional: return a 400 error for invalid ID format
--        // return res.status(400).json({ message: 'Invalid uploader ID format' });
--        // Or simply ignore the filter if ID is invalid, depending on desired behavior
-+        // 如果ID格式无效，忽略此过滤条件
-         console.warn(`Invalid uploaderId format provided: ${uploaderId}, ignoring filter.`);
-       } else {
-         query.uploader = uploaderId as string; // Apply uploader filter
-@@ -97,6 +101,7 @@ export const getResources = async (req: Request, res: Response, next: NextFuncti
-     }
- 
-     const totalResources = await Resource.countDocuments(query);
-+
-     const resources = await Resource.find(query)
-       .populate('uploader', 'username email')
-       .sort(sortOptions)
-diff --git a/diff.md b/diff.md
-index 5f28270..ba812c2 100644
---- a/diff.md
-+++ b/diff.md
-@@ -1 +0,0 @@
--﻿
-\ No newline at end of file
-diff --git a/frontend/src/app/resources/[id]/edit/page.tsx b/frontend/src/app/resources/[id]/edit/page.tsx
-index 24a28bc..fd8bce7 100644
---- a/frontend/src/app/resources/[id]/edit/page.tsx
-+++ b/frontend/src/app/resources/[id]/edit/page.tsx
-@@ -16,10 +16,10 @@ import Link from 'next/link';
- 
- export default function EditResourcePage() {
-   const router = useRouter();
--  const params = useParams();
-+  const params = useParams<{ id: string }>();
-   const { user: currentUser, token, isAuthenticated, isLoading: authLoading } = useAuth();
-   
--  const resourceId = typeof params.id === 'string' ? params.id : null;
-+  const resourceId = params?.id || null;
- 
-   const [resource, setResource] = useState<ResourceType | null>(null);
-   const [isFetching, setIsFetching] = useState<boolean>(true);
-@@ -31,7 +31,7 @@ export default function EditResourcePage() {
-     if (authLoading) return; // Wait for auth state to load
- 
-     if (!isAuthenticated) {
--      toast.error('Please login to edit resources.');
-+      toast.error('请先登录以编辑资源。');
-       router.replace(`/auth/login?redirect=/resources/${resourceId}/edit`);
-       return;
-     }
-@@ -45,15 +45,15 @@ export default function EditResourcePage() {
-           setResource(data);
-           // Authorization check: current user must be the uploader
-           if (currentUser?._id !== (typeof data.uploader === 'string' ? data.uploader : data.uploader._id)) {
--            toast.error('You are not authorized to edit this resource.');
-+            toast.error('您无权编辑此资源。');
-             router.replace(`/resources/${resourceId}`); // Redirect to detail page or resource list
-             return;
-           }
-         } catch (err: unknown) {
--          let errorMessage = 'Failed to fetch resource for editing.';
-+          let errorMessage = '获取资源信息失败。';
-           if (err instanceof ApiError) {
-             errorMessage = err.response?.message || err.message;
--            if (err.status === 404) toast.error('Resource not found.');
-+            if (err.status === 404) toast.error('未找到资源。');
-           } else if (err instanceof Error) {
-             errorMessage = err.message;
-           }
-@@ -65,8 +65,8 @@ export default function EditResourcePage() {
-       };
-       fetchResourceToEdit();
-     } else {
--      setGeneralPageError('Resource ID is missing.');
--      toast.error('Resource ID is missing.');
-+      setGeneralPageError('缺少资源ID。');
-+      toast.error('缺少资源ID。');
-       router.replace('/resources');
-       setIsFetching(false);
-     }
-@@ -74,7 +74,7 @@ export default function EditResourcePage() {
- 
-   const handleUpdate = async (data: CreateResourceData) => {
-     if (!resourceId || !token) {
--      toast.error('Cannot update resource. Missing ID or authentication.');
-+      toast.error('无法更新资源。缺少ID或认证信息。');
-       return;
-     }
-     setIsSubmitting(true);
-@@ -83,10 +83,10 @@ export default function EditResourcePage() {
- 
-     try {
-       const updated = await updateResource(resourceId, data, token);
--      toast.success('Resource updated successfully!');
-+      toast.success('资源更新成功！');
-       router.push(`/resources/${updated._id}`);
-     } catch (err: unknown) {
--      let toastMessage = 'Failed to update resource. Please try again.';
-+      let toastMessage = '更新资源失败，请重试。';
-       let specificFieldErrors: ValidationError[] = [];
-       let pageLevelErrorMessage: string | null = null; // For errors not tied to specific fields
- 
-@@ -95,7 +95,7 @@ export default function EditResourcePage() {
-         if (err.response?.errors && Array.isArray(err.response.errors)) {
-           specificFieldErrors = err.response.errors;
-           // If specific errors exist, the toast message might be better as a general one
--          toastMessage = err.response.message || "Please check the form for errors."; 
-+          toastMessage = err.response.message || "请检查表单中的错误。"; 
-         } else {
-           // No specific field errors from backend, so this is a general API error
-           pageLevelErrorMessage = err.response?.message || err.message;
-@@ -111,7 +111,7 @@ export default function EditResourcePage() {
-         setGeneralPageError(pageLevelErrorMessage);
-       } else if (specificFieldErrors.length > 0 && !pageLevelErrorMessage) {
-         // Optional: if only field errors, maybe set a generic page error too.
--        // setGeneralPageError("Please correct the errors highlighted below.");
-+        setGeneralPageError("请修正以下高亮显示的错误。");
-       }
- 
-       toast.error(toastMessage); // Display the most relevant message as a toast
-@@ -123,7 +123,7 @@ export default function EditResourcePage() {
-   if (isFetching || authLoading) {
-     return (
-       <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
--        <p className="text-xl text-gray-600">Loading editor...</p>
-+        <p className="text-xl text-white font-medium">加载编辑器中...</p>
-       </div>
-     );
-   }
-@@ -131,9 +131,9 @@ export default function EditResourcePage() {
-   if (generalPageError && !resource) {
-     return (
-       <div className="container mx-auto px-4 py-8 text-center">
--        <p className="text-xl text-red-500 mb-4">Error: {generalPageError}</p>
--        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-indigo-600 hover:text-indigo-800">
--          &larr; Back
-+        <p className="text-xl text-red-500 mb-4 font-bold">错误: {generalPageError}</p>
-+        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-blue-400 hover:text-blue-300 font-medium">
-+          &larr; 返回
-         </Link>
-       </div>
-     );
-@@ -142,44 +142,54 @@ export default function EditResourcePage() {
-   if (!resource) {
-     return (
-       <div className="container mx-auto px-4 py-8 text-center">
--        <p className="text-xl text-gray-700">Resource could not be loaded for editing.</p>
--         <Link href="/resources" className="text-indigo-600 hover:text-indigo-800">
--            &larr; Back to Resources
-+        <p className="text-xl text-white mb-4 font-medium">无法加载资源进行编辑。</p>
-+         <Link href="/resources" className="text-blue-400 hover:text-blue-300 font-medium">
-+            &larr; 返回资源列表
-           </Link>
-       </div>
-     );
-   }
- 
--  // Prepare initial data for the form, ensuring tags are a comma-separated string
-+  // Prepare initial data for the form, ensuring tags are properly formatted
-   const formInitialData: Partial<CreateResourceData> = {
--    ...resource,
--    tags: resource.tags ? resource.tags.join(', ') : '',
-+    title: resource.title,
-+    description: resource.description || '',
-+    // 使用resource.link作为url字段的值，因为CreateResourceData接受url字段
-+    url: resource.link,
-+    category: resource.category || '',
-+    // 修复类型错误：确保tags始终是数组
-+    tags: Array.isArray(resource.tags) ? resource.tags : [],
-   };
- 
-   return (
-     <div className="container mx-auto px-4 py-8 max-w-2xl">
-       <div className="mb-6">
--        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-indigo-600 hover:text-indigo-800">
--          &larr; Back to Resource Details
-+        <Link href={resourceId ? `/resources/${resourceId}` : "/resources"} className="text-blue-400 hover:text-blue-300 font-medium flex items-center">
-+          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
-+            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
-+          </svg>
-+          返回资源详情
-         </Link>
--        <h1 className="text-3xl font-bold text-gray-800 mt-2">Edit Resource</h1>
--        <p className="text-gray-600 mt-1">Update the details of your resource.</p>
-+        <h1 className="text-3xl font-bold text-white mt-3 mb-2">编辑资源</h1>
-+        <p className="text-gray-300 text-lg">更新您的资源详情。</p>
-       </div>
- 
-       {generalPageError && (
--         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
--          <strong className="font-bold">Error: </strong>
-+         <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative mb-4" role="alert">
-+          <strong className="font-bold">错误: </strong>
-           <span className="block sm:inline">{generalPageError}</span>
-         </div>
-       )}
- 
--      <ResourceForm 
--        onSubmit={handleUpdate} 
--        initialData={formInitialData} 
--        isLoading={isSubmitting} 
--        submitButtonText="Update Resource"
--        serverErrors={serverValidationErrors}
--      />
-+      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
-+        <ResourceForm 
-+          onSubmit={handleUpdate} 
-+          initialData={formInitialData} 
-+          isLoading={isSubmitting} 
-+          submitButtonText="更新资源"
-+          serverErrors={serverValidationErrors}
-+        />
-+      </div>
-     </div>
-   );
- } 
-\ No newline at end of file
-diff --git a/frontend/src/app/resources/page.tsx b/frontend/src/app/resources/page.tsx
-index 69bd3b7..a7cec43 100644
---- a/frontend/src/app/resources/page.tsx
-+++ b/frontend/src/app/resources/page.tsx
-@@ -218,9 +218,9 @@ export default function ResourcesPage() {
-                         categories.map((category) => (
-                           <button
-                             key={category._id}
--                            onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
-+                            onClick={() => setSelectedCategory(selectedCategory === category._id ? '' : category._id)}
-                             className={`px-3 py-1 rounded-full text-xs font-medium ${
--                              selectedCategory === category.name
-+                              selectedCategory === category._id
-                                 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
-                                 : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
-                             }`}
-diff --git a/frontend/src/components/resources/ResourceForm.tsx b/frontend/src/components/resources/ResourceForm.tsx
-index 25b0856..9477044 100644
---- a/frontend/src/components/resources/ResourceForm.tsx
-+++ b/frontend/src/components/resources/ResourceForm.tsx
-@@ -1,4 +1,4 @@
-- 'use client';
-+'use client';
- 
- import React, { useState, FormEvent, useEffect, useRef } from 'react';
- import { CreateResourceData } from '@/services/resource.service';
-@@ -80,7 +80,10 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-     // 仅当 initialData 的内容实际发生变化时才更新
-     if (initialData && currentInitialDataString !== prevInitialDataRef.current) {
-       setTitle(initialData.title || '');
-+      
-+      // 处理 url 字段，确保表单能够正确显示链接
-       setUrl(initialData.url || '');
-+      
-       setDescription(initialData.description || '');
-       setCategory(initialData.category || '');
-       setTagsString(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));
-@@ -250,13 +253,13 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-   };
- 
-   return (
--    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-md rounded-lg">
-+    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg">
-       {/* Display other server errors */}
-       {otherServerErrors.length > 0 && (
--        <div className="rounded-md bg-red-50 p-4 mb-4">
-+        <div className="rounded-md bg-red-900 p-4 mb-4 border border-red-700">
-           <div className="ml-3">
--            <h3 className="text-sm font-medium text-red-800">请更正以下错误：</h3>
--            <ul className="list-disc list-inside text-sm text-red-700">
-+            <h3 className="text-sm font-medium text-white">请更正以下错误：</h3>
-+            <ul className="list-disc list-inside text-sm text-red-300">
-               {otherServerErrors.map((errMsg, index) => (
-                 <li key={`server-other-${index}`}>{errMsg}</li>
-               ))}
-@@ -266,23 +269,23 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-       )}
- 
-       <div>
--        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
--          标题 <span className="text-red-500">*</span>
-+        <label htmlFor="title" className="block text-sm font-bold text-white mb-1">
-+          标题 <span className="text-red-400">*</span>
-         </label>
-         <input
-           type="text"
-           id="title"
-           value={title}
-           onChange={(e) => setTitle(e.target.value)}
--          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(titleError || serverTitleError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
-+          className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-white ${(titleError || serverTitleError) ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
-         />
--        {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
--        {serverTitleError && <p className="mt-1 text-xs text-red-600">{serverTitleError}</p>}
-+        {titleError && <p className="mt-1 text-xs text-red-400 font-medium">{titleError}</p>}
-+        {serverTitleError && <p className="mt-1 text-xs text-red-400 font-medium">{serverTitleError}</p>}
-       </div>
- 
-       <div>
--        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
--          链接 <span className="text-red-500">*</span>
-+        <label htmlFor="url" className="block text-sm font-bold text-white mb-1">
-+          链接 <span className="text-red-400">*</span>
-         </label>
-         <input
-           type="url" 
-@@ -290,14 +293,14 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-           value={url}
-           onChange={(e) => setUrl(e.target.value)}
-           placeholder="https://example.com/resource"
--          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(urlError || serverUrlError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
-+          className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-white ${(urlError || serverUrlError) ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
-         />
--        {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
--        {serverUrlError && <p className="mt-1 text-xs text-red-600">{serverUrlError}</p>}
-+        {urlError && <p className="mt-1 text-xs text-red-400 font-medium">{urlError}</p>}
-+        {serverUrlError && <p className="mt-1 text-xs text-red-400 font-medium">{serverUrlError}</p>}
-       </div>
- 
-       <div>
--        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
-+        <label htmlFor="description" className="block text-sm font-bold text-white mb-1">
-           描述
-         </label>
-         <textarea
-@@ -305,14 +308,14 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-           value={description}
-           onChange={(e) => setDescription(e.target.value)}
-           rows={4}
--          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${serverDescriptionError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
-+          className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-white ${serverDescriptionError ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
-         />
--        {serverDescriptionError && <p className="mt-1 text-xs text-red-600">{serverDescriptionError}</p>}
-+        {serverDescriptionError && <p className="mt-1 text-xs text-red-400 font-medium">{serverDescriptionError}</p>}
-       </div>
- 
-       <div>
--        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
--          分类 <span className="text-red-500">*</span>
-+        <label htmlFor="category" className="block text-sm font-bold text-white mb-1">
-+          分类 <span className="text-red-400">*</span>
-         </label>
-         <select
-           id="category"
-@@ -321,7 +324,7 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-             setCategory(e.target.value);
-             setCategoryError(null);
-           }}
--          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(categoryError || serverCategoryError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
-+          className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-white ${(categoryError || serverCategoryError) ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
-         >
-           <option value="">请选择一个分类</option>
-           {categories.map((cat) => (
-@@ -330,12 +333,12 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-             </option>
-           ))}
-         </select>
--        {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
--        {serverCategoryError && <p className="mt-1 text-xs text-red-600">{serverCategoryError}</p>}
-+        {categoryError && <p className="mt-1 text-xs text-red-400 font-medium">{categoryError}</p>}
-+        {serverCategoryError && <p className="mt-1 text-xs text-red-400 font-medium">{serverCategoryError}</p>}
-       </div>
- 
-       <div>
--        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
-+        <label htmlFor="tags" className="block text-sm font-bold text-white mb-1">
-           标签 (逗号或空格分隔，每个标签最多5个字)
-         </label>
-         <input
-@@ -346,18 +349,18 @@ const ResourceForm: React.FC<ResourceFormProps> = ({
-             setTagsString(e.target.value);
-             setTagsError(null);
-           }}
--          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${(tagsError || serverTagsError) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
-+          className={`mt-1 block w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm text-white ${(tagsError || serverTagsError) ? 'border-red-500 focus:ring-red-400 focus:border-red-400' : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
-           placeholder="例如：js, react, 教程"
-         />
--        {tagsError && <p className="mt-1 text-xs text-red-600">{tagsError}</p>}
--        {serverTagsError && <p className="mt-1 text-xs text-red-600">{serverTagsError}</p>}
-+        {tagsError && <p className="mt-1 text-xs text-red-400 font-medium">{tagsError}</p>}
-+        {serverTagsError && <p className="mt-1 text-xs text-red-400 font-medium">{serverTagsError}</p>}
-       </div>
- 
-       <div>
-         <button
-           type="submit"
-           disabled={isLoading}
--          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
-+          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
-         >
-           {isLoading ? '提交中...' : submitButtonText}
-         </button>
-diff --git a/frontend/src/services/category.service.ts b/frontend/src/services/category.service.ts
-index db0c6e4..dbcaf2b 100644
---- a/frontend/src/services/category.service.ts
-+++ b/frontend/src/services/category.service.ts
-@@ -15,9 +15,21 @@ const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5
- /**
-  * 获取所有分类
-  */
--export const getCategories = async (): Promise<Category[]> => {
-+export const getCategories = async (params?: { withResourceCount?: boolean, flat?: boolean, activeOnly?: boolean }): Promise<Category[]> => {
-   try {
--    const response = await axios.get(`${API_BASE_URL}/categories`);
-+    // 构建查询参数
-+    const queryParams = new URLSearchParams();
-+    if (params) {
-+      if (params.withResourceCount) queryParams.append('withResourceCount', 'true');
-+      if (params.flat) queryParams.append('flat', 'true');
-+      if (params.activeOnly) queryParams.append('activeOnly', 'true');
-+    } else {
-+      // 默认添加资源计数
-+      queryParams.append('withResourceCount', 'true');
-+    }
-+    
-+    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
-+    const response = await axios.get(`${API_BASE_URL}/categories${queryString}`);
-     return response.data;
-   } catch (error) {
-     if (axios.isAxiosError(error)) {
-diff --git a/frontend/src/services/rating.service.ts b/frontend/src/services/rating.service.ts
-index f30261b..3a86a8e 100644
---- a/frontend/src/services/rating.service.ts
-+++ b/frontend/src/services/rating.service.ts
-@@ -93,13 +93,13 @@ export const getUserRating = async (
-     },
-   });
- 
--  // 如果状态码是404，表示用户尚未评分
--  if (response.status === 404) {
-+  const data = await response.json();
-+
-+  // 如果返回的数据表示未找到评分记录，返回null
-+  if (data.message === '未找到评分记录') {
-     return null;
-   }
- 
--  const data = await response.json();
--
-   if (!response.ok) {
-     throw new ApiError(
-       response.status,
-diff --git a/package.json b/package.json
-index cfe8baf..5f243e1 100644
---- a/package.json
-+++ b/package.json
-@@ -1,8 +1,19 @@
- {
-+  "name": "culture-resources",
-+  "version": "1.0.0",
-+  "description": "文化资源共享平台",
-+  "scripts": {
-+    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
-+    "start:backend": "node start-backend.js",
-+    "start:frontend": "cd frontend && npm run dev",
-+    "build": "concurrently \"cd backend && npm run build\" \"cd frontend && npm run build\"",
-+    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
-+  },
-   "dependencies": {
-     "axios": "^1.9.0"
-   },
-   "devDependencies": {
--    "@types/multer": "^1.4.12"
-+    "@types/multer": "^1.4.12",
-+    "concurrently": "^8.2.2"
-   }
- }
diff --git a/frontend/src/app/profile/downloads/page.tsx b/frontend/src/app/profile/downloads/page.tsx
deleted file mode 100644
index f66278b..0000000
--- a/frontend/src/app/profile/downloads/page.tsx
+++ /dev/null
@@ -1,107 +0,0 @@
-'use client';
-
-import React, { useEffect, useState } from 'react';
-import { useRouter } from 'next/navigation';
-import { useAuth } from '@/context/AuthContext';
-import Link from 'next/link';
-import toast from 'react-hot-toast';
-import { Resource, PaginatedResourcesResponse } from '@/services/resource.service';
-import { getDownloadHistory } from '@/services/download.service';
-import ResourceCard from '@/components/resources/ResourceCard';
-import { ApiError } from '@/services/auth.service';
-
-export default function DownloadsPage() {
-  const router = useRouter();
-  const { user: currentUser, isAuthenticated, isLoading: authLoading, token } = useAuth();
-
-  const [downloadedResources, setDownloadedResources] = useState<Resource[]>([]);
-  const [isFetchingResources, setIsFetchingResources] = useState<boolean>(true);
-  const [fetchError, setFetchError] = useState<string | null>(null);
-  const [refreshKey, setRefreshKey] = useState(0);
-
-  useEffect(() => {
-    if (!authLoading && !isAuthenticated) {
-      toast.error('请先登录以查看您的下载历史');
-      router.replace('/auth/login?redirect=/profile/downloads');
-    }
-  }, [isAuthenticated, authLoading, router]);
-
-  useEffect(() => {
-    if (currentUser && token) {
-      const fetchDownloadHistory = async () => {
-        setIsFetchingResources(true);
-        setFetchError(null);
-        try {
-          const response: PaginatedResourcesResponse = await getDownloadHistory(token);
-          setDownloadedResources(response.data);
-        } catch (err) {
-          let errorMessage = '获取您的下载历史失败';
-          if (err instanceof ApiError) {
-            errorMessage = err.response?.message || err.message;
-          } else if (err instanceof Error) {
-            errorMessage = err.message;
-          }
-          setFetchError(errorMessage);
-          toast.error(errorMessage);
-          setDownloadedResources([]);
-        }
-        setIsFetchingResources(false);
-      };
-      fetchDownloadHistory();
-    }
-  }, [currentUser, token, refreshKey]);
-
-  if (authLoading || !isAuthenticated || !currentUser) {
-    return (
-      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
-        <p className="text-xl text-gray-600 dark:text-gray-400">正在加载...</p>
-      </div>
-    );
-  }
-
-  return (
-    <div className="container mx-auto px-4 py-8">
-      <div className="flex items-center mb-8">
-        <Link 
-          href="/profile" 
-          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
-        >
-          &larr; 返回个人中心
-        </Link>
-        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">下载历史</h1>
-        <button
-          onClick={() => setRefreshKey(prev => prev + 1)}
-          className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
-        >
-          刷新
-        </button>
-      </div>
-
-      <div className="mt-6">
-        {isFetchingResources && <p className="text-center text-gray-500 dark:text-gray-400 py-4">正在加载您的下载历史...</p>}
-        {fetchError && <p className="text-center text-red-500 py-4">错误: {fetchError}</p>}
-        {!isFetchingResources && !fetchError && downloadedResources.length === 0 && (
-          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 min-h-[150px] flex flex-col items-center justify-center">
-            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">您还没有下载任何资源</p>
-            <Link href="/resources" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
-                浏览资源
-            </Link>
-          </div>
-        )}
-        {!isFetchingResources && !fetchError && downloadedResources.length > 0 && (
-          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
-            {downloadedResources.map(resource => (
-              <ResourceCard 
-                key={resource._id} 
-                resource={resource} 
-                currentUserId={currentUser._id}
-                token={token}
-                showDownloadDate={true}
-              />
-            ))}
-          </div>
-        )}
-      </div>
-    </div>
-  );
-}
diff --git a/frontend/src/app/profile/stats/page.tsx b/frontend/src/app/profile/stats/page.tsx
index 966d52e..1ba848a 100644
--- a/frontend/src/app/profile/stats/page.tsx
+++ b/frontend/src/app/profile/stats/page.tsx
@@ -15,10 +15,6 @@ interface UserStats {
     pending: number;
     rejected: number;
   };
-  downloads: {
-    total: number;
-    lastMonth: number;
-  };
   ratings: {
     given: number;
     averageGiven: number;
@@ -129,15 +125,6 @@ export default function UserStatsPage() {
               </div>
             </div>
 
-            {/* 下载统计 */}
-            <div>
-              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">下载统计</h2>
-              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-                {renderStatCard('总下载数', stats.downloads.total)}
-                {renderStatCard('本月下载', stats.downloads.lastMonth)}
-              </div>
-            </div>
-
             {/* 评分统计 */}
             <div>
               <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">评分统计</h2>
diff --git a/frontend/src/components/Layout.tsx b/frontend/src/components/Layout.tsx
index 519676b..5837ac6 100644
--- a/frontend/src/components/Layout.tsx
+++ b/frontend/src/components/Layout.tsx
@@ -44,7 +44,6 @@ const Layout: React.FC<LayoutProps> = ({ children }) => {
     { href: '/profile', label: '个人中心' },
     { href: '/profile/uploads', label: '我的上传' },
     { href: '/profile/favorites', label: '我的收藏' },
-    { href: '/profile/downloads', label: '下载历史' },
   ];
 
   return (
diff --git a/frontend/src/components/Navbar.tsx b/frontend/src/components/Navbar.tsx
index acb6ab3..31d54a1 100644
--- a/frontend/src/components/Navbar.tsx
+++ b/frontend/src/components/Navbar.tsx
@@ -120,7 +120,6 @@ const Navbar: React.FC = () => {
     { href: '/profile', label: '个人中心' },
     { href: '/profile/uploads', label: '我的上传' },
     { href: '/profile/favorites', label: '我的收藏' },
-    { href: '/profile/downloads', label: '下载历史' },
   ];
 
   return (
diff --git a/frontend/src/services/download.service.ts b/frontend/src/services/download.service.ts
index a8fc85e..c96deb8 100644
--- a/frontend/src/services/download.service.ts
+++ b/frontend/src/services/download.service.ts
@@ -1,90 +1,31 @@
-import { ApiError } from './auth.service';
-import { PaginatedResourcesResponse } from './resource.service';
-
 const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
 
 /**
- * 获取用户下载历史
- */
-export const getDownloadHistory = async (
-  token: string,
-  page: number = 1,
-  limit: number = 10
-): Promise<PaginatedResourcesResponse> => {
-  const query = new URLSearchParams({
-    page: page.toString(),
-    limit: limit.toString(),
-  });
-
-  const response = await fetch(`${API_BASE_URL}/downloads?${query.toString()}`, {
-    method: 'GET',
-    headers: {
-      'Content-Type': 'application/json',
-      'Authorization': `Bearer ${token}`,
-    },
-  });
-
-  const data = await response.json();
-
-  if (!response.ok) {
-    throw new ApiError(
-      response.status,
-      '获取下载历史失败',
-      { message: data.message || '获取下载历史失败' }
-    );
-  }
-
-  return data as PaginatedResourcesResponse;
-};
-
-/**
- * 记录资源下载
- */
-export const recordDownload = async (
-  resourceId: string,
-  token: string
-): Promise<{ message: string }> => {
-  const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download`, {
-    method: 'POST',
-    headers: {
-      'Content-Type': 'application/json',
-      'Authorization': `Bearer ${token}`,
-    },
-  });
-
-  const data = await response.json();
-
-  if (!response.ok) {
-    throw new ApiError(
-      response.status,
-      '记录下载失败',
-      { message: data.message || '记录下载失败' }
-    );
-  }
-
-  return data as { message: string };
-};
-
-/**
- * 下载资源并记录
+ * 下载资源
  */
 export const downloadResource = async (
   resourceId: string,
   token: string | null
 ): Promise<void> => {
   try {
-    // 如果用户已登录，记录下载
+    // 增加资源的下载计数
     if (token) {
       try {
-        await recordDownload(resourceId, token);
+        await fetch(`${API_BASE_URL}/resources/${resourceId}/increment-download`, {
+          method: 'PATCH',
+          headers: {
+            'Content-Type': 'application/json',
+            'Authorization': `Bearer ${token}`,
+          },
+        });
       } catch (error) {
-        console.error('记录下载失败', error);
+        console.error('增加下载计数失败', error);
         // 即使记录失败，也继续下载
       }
     }
 
-    // 打开下载链接
-    window.open(`${API_BASE_URL}/downloads/download/${resourceId}`, '_blank');
+    // 打开资源链接
+    window.open(`${API_BASE_URL}/resources/${resourceId}/download`, '_blank');
   } catch (error) {
     console.error('下载资源失败', error);
     throw new Error('下载资源失败');
