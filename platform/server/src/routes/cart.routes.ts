import { Router, type RequestHandler } from 'express';
import { getCart, addToCart, updateCartItemQty, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartItemSchema, updateCartItemQtySchema } from '../validators/cart.validators.js';

const router = Router();

const auth = authenticate as unknown as RequestHandler;
router.use(auth);

router.route('/')
  .get(getCart as unknown as RequestHandler)
  .post(validate(cartItemSchema), addToCart as unknown as RequestHandler)
  .delete(clearCart as unknown as RequestHandler);

router.route('/items/:itemId')
  .patch(validate(updateCartItemQtySchema), updateCartItemQty as unknown as RequestHandler)
  .delete(removeFromCart as unknown as RequestHandler);

export default router;
