import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// 资源模型
const Resource = mongoose.model('Resource', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  isPublic: { type: Boolean, default: true }
}));

// 搜索资源
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  const { query, type, category, tags } = req.query;
  const filter: any = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  if (type) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (tags) {
    filter.tags = { $in: tags };
  }

  const resources = await Resource.find(filter);
  res.json(resources);
});

export default router; 