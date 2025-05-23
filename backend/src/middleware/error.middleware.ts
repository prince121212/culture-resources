import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  // Add any other custom error properties if needed
  // e.g., code?: string; errors?: any[];
}

export const errorHandler = (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction) => {
  console.error("--- Error Handler ---");
  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("StatusCode:", err.statusCode);
  // console.error("Stack:", err.stack); // Uncomment for detailed stack trace during development

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const castError = err as any; // Cast to access path and value
    message = `Resource not found. Invalid: ${castError.path} - ${castError.value}`;
    statusCode = 404;
  }

  // Mongoose Duplicate Key (code 11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0]; // Check for MongoError code
    message = `当前本站已有相同链接，请勿重复上传！ ${field}`;
    statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const validationError = err as any; // Cast to access errors
    const messages = Object.values(validationError.errors).map((val: any) => val.message);
    message = messages.join(', ');
    statusCode = 400;
  }

  // JWT Authentication Error (JsonWebTokenError)
  if (err.name === 'JsonWebTokenError') {
    message = 'JSON Web Token is invalid. Please log in again.';
    statusCode = 401;
  }

  // JWT Token Expired Error (TokenExpiredError)
  if (err.name === 'TokenExpiredError') {
    message = 'JSON Web Token is expired. Please log in again.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optionally send stack in dev
  });
}; 