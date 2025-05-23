import { Request, Response, NextFunction } from 'express';
import Setting, { ISetting, SettingType, SettingGroup } from '../models/setting.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

/**
 * @desc    获取所有设置
 * @route   GET /api/settings
 * @access  Public/Admin (根据isPublic字段)
 */
export const getSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { group } = req.query;
    const isAdmin = req.user?.role === 'admin';
    
    // 构建查询条件
    const query: any = {};
    
    // 如果指定了分组，则按分组筛选
    if (group) {
      query.group = group;
    }
    
    // 如果不是管理员，则只返回公开的设置
    if (!isAdmin) {
      query.isPublic = true;
    }
    
    const settings = await Setting.find(query).sort({ group: 1, order: 1 });
    
    // 将设置按组分类
    const groupedSettings = settings.reduce((acc: any, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = [];
      }
      acc[setting.group].push(setting);
      return acc;
    }, {});
    
    res.status(200).json(groupedSettings);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取单个设置
 * @route   GET /api/settings/:key
 * @access  Public/Admin (根据isPublic字段)
 */
export const getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: '设置不存在' });
    }
    
    // 检查是否是公开设置或用户是管理员
    const isAdmin = (req as AuthenticatedRequest).user?.role === 'admin';
    if (!setting.isPublic && !isAdmin) {
      return res.status(403).json({ message: '无权访问此设置' });
    }
    
    res.status(200).json(setting);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新设置
 * @route   PUT /api/settings/:key
 * @access  Admin
 */
export const updateSetting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: '设置不存在' });
    }
    
    // 更新设置值
    setting.value = value;
    await setting.save();
    
    res.status(200).json({
      message: '设置更新成功',
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    批量更新设置
 * @route   PUT /api/settings
 * @access  Admin
 */
export const updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ message: '无效的请求格式，settings必须是数组' });
    }
    
    const results = [];
    
    // 使用事务确保所有更新都成功或都失败
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      for (const item of settings) {
        const { key, value } = item;
        
        if (!key) {
          throw new Error('每个设置项必须包含key字段');
        }
        
        const setting = await Setting.findOne({ key }).session(session);
        
        if (!setting) {
          throw new Error(`设置 ${key} 不存在`);
        }
        
        setting.value = value;
        await setting.save({ session });
        
        results.push({
          key,
          success: true
        });
      }
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
    res.status(200).json({
      message: '设置批量更新成功',
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    初始化默认设置
 * @route   POST /api/settings/init
 * @access  Admin
 */
export const initializeSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 定义默认设置
    const defaultSettings = [
      // 网站基本设置
      {
        key: 'site_name',
        value: 'Culture Resources',
        type: SettingType.STRING,
        group: SettingGroup.GENERAL,
        label: '网站名称',
        description: '网站的名称，将显示在浏览器标题栏和网站页面上',
        defaultValue: 'Culture Resources',
        isPublic: true,
        isRequired: true,
        order: 1
      },
      {
        key: 'site_description',
        value: '一个用于存放和管理电子资源链接的网站平台',
        type: SettingType.STRING,
        group: SettingGroup.GENERAL,
        label: '网站描述',
        description: '网站的简短描述，用于SEO和网站介绍',
        defaultValue: '一个用于存放和管理电子资源链接的网站平台',
        isPublic: true,
        isRequired: true,
        order: 2
      },
      {
        key: 'site_logo',
        value: '/images/logo.png',
        type: SettingType.STRING,
        group: SettingGroup.GENERAL,
        label: '网站Logo',
        description: '网站Logo的URL地址',
        defaultValue: '/images/logo.png',
        isPublic: true,
        isRequired: false,
        order: 3
      },
      {
        key: 'site_favicon',
        value: '/favicon.ico',
        type: SettingType.STRING,
        group: SettingGroup.GENERAL,
        label: '网站图标',
        description: '浏览器标签页显示的小图标',
        defaultValue: '/favicon.ico',
        isPublic: true,
        isRequired: false,
        order: 4
      },
      
      // 注册设置
      {
        key: 'allow_registration',
        value: true,
        type: SettingType.BOOLEAN,
        group: SettingGroup.USER,
        label: '允许注册',
        description: '是否允许新用户注册',
        defaultValue: true,
        isPublic: true,
        isRequired: true,
        order: 1
      },
      {
        key: 'registration_verification',
        value: 'email',
        type: SettingType.STRING,
        group: SettingGroup.USER,
        label: '注册验证方式',
        description: '新用户注册时的验证方式',
        options: [
          { label: '无验证', value: 'none' },
          { label: '邮箱验证', value: 'email' },
          { label: '管理员审核', value: 'admin' }
        ],
        defaultValue: 'email',
        isPublic: true,
        isRequired: true,
        order: 2
      },
      
      // 资源上传设置
      {
        key: 'allowed_file_types',
        value: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif'],
        type: SettingType.ARRAY,
        group: SettingGroup.CONTENT,
        label: '允许的文件类型',
        description: '允许上传的文件类型扩展名',
        defaultValue: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif'],
        isPublic: true,
        isRequired: true,
        order: 1
      },
      {
        key: 'max_file_size',
        value: 10,
        type: SettingType.NUMBER,
        group: SettingGroup.CONTENT,
        label: '最大文件大小',
        description: '允许上传的最大文件大小（MB）',
        defaultValue: 10,
        isPublic: true,
        isRequired: true,
        order: 2
      },
      {
        key: 'require_resource_approval',
        value: true,
        type: SettingType.BOOLEAN,
        group: SettingGroup.CONTENT,
        label: '资源需要审核',
        description: '新上传的资源是否需要管理员审核',
        defaultValue: true,
        isPublic: true,
        isRequired: true,
        order: 3
      }
    ];
    
    // 检查设置是否已存在，不存在则创建
    for (const setting of defaultSettings) {
      const existingSetting = await Setting.findOne({ key: setting.key });
      
      if (!existingSetting) {
        await Setting.create(setting);
      }
    }
    
    res.status(200).json({
      message: '默认设置初始化成功',
      count: defaultSettings.length
    });
  } catch (error) {
    next(error);
  }
};
