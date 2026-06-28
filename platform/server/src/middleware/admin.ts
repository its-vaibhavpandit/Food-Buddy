import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { AppError } from './error.js';

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: Admin access required', 403));
  }
  next();
};
