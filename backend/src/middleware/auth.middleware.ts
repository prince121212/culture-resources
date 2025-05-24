import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in auth.middleware.");
  process.exit(1);
}

// const User = mongoose.model('User'); // 移除此行，使用导入的User模型

// Extend Express Request interface to include user payload from JWT
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * 验证用户Token
 * 在需要认证的路由前添加此中间件
 */
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  // 检查headers中的authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; role: string; iat: number; exp: number };

      // Attach user info to request object
      req.user = { id: decoded.id, role: decoded.role };
      next();
      return;
    } catch (error: any) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

/**
 * 验证用户是否为管理员
 * 在需要管理员权限的路由前添加此中间件
 */
export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
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