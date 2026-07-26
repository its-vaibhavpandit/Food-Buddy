import { z } from 'zod';

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    price: z.number().positive('Price must be positive'),
    image: z.string().url('Image must be a valid URL or path').or(z.string().min(1, 'Image path is required')),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    price: z.number().positive().optional(),
    image: z.string().optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })
});
