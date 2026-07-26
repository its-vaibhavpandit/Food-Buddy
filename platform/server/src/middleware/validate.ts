import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body;
      
      // In Express 5, req.query and req.params have only getters and are read-only.
      // We mutate the objects in-place to respect the getters while applying sanitization.
      if (parsed.query && req.query) {
        for (const key in req.query) {
          delete req.query[key];
        }
        Object.assign(req.query, parsed.query);
      }
      
      if (parsed.params && req.params) {
        for (const key in req.params) {
          delete req.params[key];
        }
        Object.assign(req.params, parsed.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors to be readable
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new AppError('Validation failed', 400, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
