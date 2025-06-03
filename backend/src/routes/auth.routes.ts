import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model';
import { getDefaultAvatarId } from '../utils/defaultAvatar';

const router = express.Router();

// 用户注册
router.post('/register', [
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { username, email, password } = req.body;

  // 获取默认头像ID
  const defaultAvatarId = await getDefaultAvatarId();

  const user = new User({
    username,
    email,
    password,
    role: 'user',
    avatar: defaultAvatarId, // 设置默认头像
    createdAt: new Date(),
    updatedAt: new Date(),
    points: 0,
    status: 'active'
  });

  await user.save();
  res.status(201).json({ message: '用户注册成功' });
});

// 用户登录
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    console.log('Attempting login for email:', email);

    // 查找用户并包含密码字段
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      role: user.role
    } : 'No user found');

    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    // 使用模型的方法来比较密码
    const isMatch = await user.matchPassword(password);
    console.log('Password comparison details:', {
      providedPassword: password,
      storedPasswordHash: user.password ? user.password.substring(0, 20) + '...' : 'no password',
      isMatch: isMatch
    });

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      res.status(401).json({ message: '密码错误' });
      return;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '100d' }
    );

    // 返回用户信息（不包含密码）和 token
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('Login successful for user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: '登录成功11133333333333333111',
      token,
      user: userResponse
    });
    console.log('Login successful for user11111112:');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;