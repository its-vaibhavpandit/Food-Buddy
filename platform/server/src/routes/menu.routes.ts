import { Router } from 'express';
import { getMenuItems, getMenuItemBySlug, getCategories, getRestaurants } from '../controllers/menu.controller.js';

const router = Router();

router.get('/items', getMenuItems);
router.get('/items/:slug', getMenuItemBySlug);
router.get('/categories', getCategories);
router.get('/restaurants', getRestaurants);

export default router;
