import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    deliveryAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(5, 'Zip code must be at least 5 digits'),
    }),
    paymentMethod: z.enum(['cod', 'online', 'upi']).default('cod'),
    upiTransactionId: z.string().min(6, 'UPI Transaction ID must be at least 6 characters').optional(),
    notes: z.string().optional(),
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  })
});
