import { Router, type RequestHandler } from 'express';
import {
  getDashboardStats,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetUsers,
  adminGetRestaurants,
  adminCreateRestaurant,
  adminUpdateRestaurant,
  adminDeleteRestaurant,
  adminGetTransactions,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';
import { createMenuItemSchema, updateMenuItemSchema, createCategorySchema } from '../validators/menu.validators.js';
import { updateOrderStatusSchema } from '../validators/order.validators.js';

const router = Router();

const auth = authenticate as unknown as RequestHandler;
const admin = authorizeAdmin as unknown as RequestHandler;
router.use(auth, admin);

router.get('/stats', getDashboardStats as unknown as RequestHandler);
router.get('/users', adminGetUsers as unknown as RequestHandler);

router.route('/orders')
  .get(adminGetOrders as unknown as RequestHandler);

router.route('/orders/:id')
  .patch(validate(updateOrderStatusSchema), adminUpdateOrderStatus as unknown as RequestHandler);

router.route('/restaurants')
  .get(adminGetRestaurants as unknown as RequestHandler)
  .post(adminCreateRestaurant as unknown as RequestHandler);

router.route('/restaurants/:id')
  .patch(adminUpdateRestaurant as unknown as RequestHandler)
  .delete(adminDeleteRestaurant as unknown as RequestHandler);

router.get('/transactions', adminGetTransactions as unknown as RequestHandler);

router.route('/menu')
  .post(validate(createMenuItemSchema), adminCreateMenuItem as unknown as RequestHandler);

router.route('/menu/:id')
  .patch(validate(updateMenuItemSchema), adminUpdateMenuItem as unknown as RequestHandler)
  .delete(adminDeleteMenuItem as unknown as RequestHandler);

router.route('/categories')
  .post(validate(createCategorySchema), adminCreateCategory as unknown as RequestHandler);

router.route('/categories/:id')
  .patch(adminUpdateCategory as unknown as RequestHandler)
  .delete(adminDeleteCategory as unknown as RequestHandler);

export default router;
