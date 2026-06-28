import { z } from 'zod';

export const cartItemSchema = z.object({
  body: z.object({
    menuItem: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MenuItem ID'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  })
});

export const updateCartItemQtySchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be a positive integer'),
  })
});
