import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/user.model'; // 导入User模型
import mongoose from 'mongoose';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in auth.middleware.");
  process.exit(1);
}

// const User = mongoose.model('User'); // 移除此行，使用导入的User模型

// Extend Express Request interface to include user payload from JWT
export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string }; // Or a more detailed IUserPayload
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // 在验证之前打印收到的Token和JWT_SECRET，用于调试
      console.log('[DEBUG] Token received for verification:', token);
      console.log('[DEBUG] JWT_SECRET used for verification:', JWT_SECRET);
      
      const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; role: string; iat: number; exp: number };

      // Attach user info to request object
      // 실제로는 decoded.id로 DB에서 사용자 정보를 조회해서 req.user에 할당하는 것이 좋음
      // 여기서는 단순화를 위해 decoded payload를 그대로 사용
      req.user = { id: decoded.id, role: decoded.role };
      next();
      return;
    } catch (error: any) { // 将 error 类型改为 any 以便访问其属性
      // 添加更明确的日志
      console.error('-----------------------------------------------------');
      console.error('[AUTH ERROR] Token verification FAILED. Details below:');
      console.error('[AUTH ERROR] Raw Token String:', token); // 打印原始token
      console.error('[AUTH ERROR] Error Name:', error.name);
      console.error('[AUTH ERROR] Error Message:', error.message);
      console.error('[AUTH ERROR] Full Error Object:', JSON.stringify(error, null, 2));
      console.error('-----------------------------------------------------');
      
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Middleware to restrict access based on roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
      return;
    }
    next();
  };
};

// 管理员权限验证中间件
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: '需要管理员权限才能访问此资源' });
    return;
  }
  next();
};

export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.headers['user-id'];
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    const user = await User.findById(userId as string); // 使用导入的User模型
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    // 假设Role模型也会从其定义文件导入，如果存在的话
    // const Role = mongoose.model('Role'); 
    // const role = await Role.findOne({ name: (user as any).role });
    // 为了避免潜在的Role模型重复定义，暂时注释掉上面两行，
    // 并假设user对象上直接有permissions字段或通过role关联的permissions
    // 这部分逻辑可能需要根据Role模型的实际定义和User模型如何关联Role来进行调整
    const userWithRole = await User.findById(userId as string).populate('role'); // 假设role字段可以populate
    if (!userWithRole || !(userWithRole as any).role || !(userWithRole as any).role.permissions.includes(permission)) {
      res.status(403).json({ message: '权限不足' });
      return;
    }

    next();
  };
};