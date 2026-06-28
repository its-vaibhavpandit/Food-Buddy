import { Router } from 'express';
import { getCart, addToCart, updateCartItemQty, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartItemSchema, updateCartItemQtySchema } from '../validators/cart.validators.js';

const router = Router();

router.use(authenticate as any);

router.route('/')
  .get(getCart as any)
  .post(validate(cartItemSchema), addToCart as any)
  .delete(clearCart as any);

router.route('/items/:itemId')
  .patch(validate(updateCartItemQtySchema), updateCartItemQty as any)
  .delete(removeFromCart as any);

export default router;
