import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDefaultAvatarId } from '../utils/defaultAvatar';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'yourFallbackSecretKey';

// Explicitly define SignOptions
const jwtSignOptions: SignOptions = {
  expiresIn: '100d', // 将Token有效期设置为100天
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // 获取默认头像ID
    const defaultAvatarId = await getDefaultAvatarId();

    const newUser = new User({
      username,
      email,
      password,
      avatar: defaultAvatarId, // 设置默认头像
    });

    const savedUser = await newUser.save();
    const userIdString = savedUser._id.toString();

    const userResponse = {
      _id: userIdString,
      username: savedUser.username,
      email: savedUser.email,
      avatar: savedUser.avatar,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    const token = jwt.sign({ id: userIdString }, JWT_SECRET, jwtSignOptions);

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials - user not found or password not selected' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials - password mismatch' });
    }

    const userIdString = user._id.toString();

    const userResponse = {
      _id: userIdString,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = jwt.sign({ id: userIdString }, JWT_SECRET, jwtSignOptions);

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    next(error);
  }
};
