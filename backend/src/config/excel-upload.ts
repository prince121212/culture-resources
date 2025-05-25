import multer from 'multer';
import { Request } from 'express';

// Excel文件过滤器
export const excelFileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('只允许上传Excel文件 (.xlsx, .xls)') as any);
  }
};

// 配置Excel文件上传的Multer中间件
export const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: excelFileFilter
});
