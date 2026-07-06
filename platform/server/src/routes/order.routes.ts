import { Router, type RequestHandler } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../validators/order.validators.js';

const router = Router();

const auth = authenticate as unknown as RequestHandler;
router.use(auth);

router.route('/')
  .post(validate(createOrderSchema), createOrder as unknown as RequestHandler)
  .get(getOrders as unknown as RequestHandler);

router.get('/:id', getOrderById as unknown as RequestHandler);

export default router;
