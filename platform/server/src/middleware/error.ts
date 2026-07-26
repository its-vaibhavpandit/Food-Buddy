import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  errors?: ValidationError[];

  constructor(message: string, statusCode: number, errors?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError & { name?: string; code?: number; keyValue?: Record<string, unknown>; path?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values((err as unknown as Record<string, any>).errors as Record<string, { message: string }>).map(
      (el) => ({ field: '', message: el.message })
    );
  }

  if (err.code === 11000) {
    statusCode = 400;
    const key = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${key.charAt(0).toUpperCase() + key.slice(1)} already exists`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'Origin not allowed by CORS';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
