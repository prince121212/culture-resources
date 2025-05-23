import { Router } from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloadCount,
  checkResourceLink,
  batchCheckResourceLinks,
  // getResourcesByUploader, // Example for a future route
  // getResourcesByCategory, // Example for a future route
} from '../controllers/resource.controller';
import { protect, isAdmin } from '../middleware/auth.middleware';
import {
    createResourceValidationRules,
    updateResourceValidationRules,
    resourceIdValidationRules,
    validate
} from '../validators/resource.validator';
import { Request, Response } from 'express';
import Resource from '../models/resource.model'; // 导入正确的Resource模型

const router = Router();

// Public routes
router.get('/', getResources);         // Get all approved resources (with pagination, filtering)
router.get('/:id', resourceIdValidationRules(), validate, getResourceById);

// New public route for incrementing download count
router.patch('/:id/increment-download', resourceIdValidationRules(), validate, incrementDownloadCount);

// Protected routes (require authentication)
router.post(
  '/',
  protect,
  createResourceValidationRules(),
  validate,
  createResource
);

router.put(
  '/:id',
  protect,
  resourceIdValidationRules(), // Validate ID in params
  updateResourceValidationRules(), // Validate body
  validate,
  updateResource
);

router.delete(
  '/:id',
  protect,
  resourceIdValidationRules(),
  validate, // Even if no body, ID validation errors need to be handled
  deleteResource
);

// Example of more specific routes if needed in the future
// router.get('/user/:userId', getResourcesByUploader);
// router.get('/category/:categoryName', getResourcesByCategory);

// Admin routes for link checking
router.put('/:id/check-link', protect, isAdmin, resourceIdValidationRules(), validate, checkResourceLink);
router.post('/check-links', protect, isAdmin, batchCheckResourceLinks);

export default router;