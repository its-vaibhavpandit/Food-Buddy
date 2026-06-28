import { Router } from 'express';
import { 
  getDashboardStats, 
  adminGetOrders, 
  adminUpdateOrder, 
  adminGetUsers, 
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

// Protect all admin routes
router.use(authenticate as any, authorizeAdmin as any);

router.get('/stats', getDashboardStats as any);
router.get('/users', adminGetUsers as any);

router.route('/orders')
  .get(adminGetOrders as any);

router.route('/orders/:id')
  .patch(validate(updateOrderStatusSchema), adminUpdateOrder as any);

router.route('/menu')
  .post(validate(createMenuItemSchema), adminCreateMenuItem as any);

router.route('/menu/:id')
  .patch(validate(updateMenuItemSchema), adminUpdateMenuItem as any)
  .delete(adminDeleteMenuItem as any);

router.route('/categories')
  .post(validate(createCategorySchema), adminCreateCategory as any);

router.route('/categories/:id')
  .patch(adminUpdateCategory as any)
  .delete(adminDeleteCategory as any);

export default router;
