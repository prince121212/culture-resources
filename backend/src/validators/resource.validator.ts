import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const resourceIdValidationRules = () => [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Invalid resource ID format');
    }
    return true;
  }),
];

export const createResourceValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('url')
      .optional()
      .trim()
      .notEmpty().withMessage('URL is required if provided')
      .matches(/^(https?):\/\//).withMessage('URL must start with http:// or https://'),
    body('link')
      .optional()
      .trim()
      .notEmpty().withMessage('Link is required if provided')
      .matches(/^(https?):\/\//).withMessage('Link must start with http:// or https://'),
    body().custom((body) => {
      if (!body.url && !body.link) {
        throw new Error('Either URL or Link field must be provided');
      }
      return true;
    }),
    body('description')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array')
      .custom((tags: string[]) => {
        if (tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
          throw new Error('All tags must be non-empty strings');
        }
        if (tags.length > 10) { // Example limit
            throw new Error('Cannot have more than 10 tags');
        }
        return true;
      }),
    body('fileType')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('File type must be between 2 and 50 characters'),
    body('thumbnailUrl')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^(https?):\/\//).withMessage('Thumbnail URL must start with http:// or https://'),
    // 'status' might be validated differently, e.g., only by admins or specific logic
  ];
};

export const updateResourceValidationRules = () => {
  return [
    // For updates, make fields optional as user might only update a subset
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Title cannot be empty if provided')
      .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('url')
      .optional()
      .trim()
      .matches(/^(https?):\/\//).withMessage('URL must start with http:// or https://'),
    body('description')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('category')
      .optional()
      .trim()
      .notEmpty().withMessage('Category cannot be empty if provided'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array')
      .custom((tags: string[]) => {
        if (tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
          throw new Error('All tags must be non-empty strings');
        }
         if (tags.length > 10) {
            throw new Error('Cannot have more than 10 tags');
        }
        return true;
      }),
    body('fileType')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('File type must be between 2 and 50 characters'),
    body('thumbnailUrl')
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^(https?):\/\//).withMessage('Thumbnail URL must start with http:// or https://'),
    body('status')
      .optional()
      .isIn(['draft', 'pending', 'approved', 'rejected', 'terminated']).withMessage('Invalid status value'),
  ];
};

// Middleware to handle validation results (can be shared with auth.validator or kept separate)
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: Record<string, string>[] = [];
  errors.array().map(err => {
    if (err.type === 'field') {
        extractedErrors.push({ [err.path]: err.msg });
    }
  });

  // It's good practice to also log the full errors array for debugging on the server
  // console.error('Validation Errors:', errors.array());

  res.status(400).json({
    message: 'Validation failed', // Generic message
    errors: extractedErrors,      // Specific field errors
  });
};
