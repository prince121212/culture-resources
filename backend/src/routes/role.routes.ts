import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// 角色模型
const Role = mongoose.model('Role', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// 添加角色
router.post('/roles', async (req: Request, res: Response): Promise<void> => {
  const { name, permissions } = req.body;
  const role = new Role({
    name,
    permissions,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await role.save();
  res.status(201).json({ message: '角色添加成功' });
});

// 获取所有角色
router.get('/roles', async (req: Request, res: Response): Promise<void> => {
  const roles = await Role.find();
  res.json(roles);
});

export default router; 