import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../validators/order.validators.js';

const router = Router();

router.use(authenticate as any);

router.route('/')
  .post(validate(createOrderSchema), createOrder as any)
  .get(getOrders as any);

router.get('/:id', getOrderById as any);

export default router;
