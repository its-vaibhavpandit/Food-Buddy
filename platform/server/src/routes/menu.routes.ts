import { Router } from 'express';
import { getMenuItems, getMenuItemBySlug, getCategories } from '../controllers/menu.controller.js';

const router = Router();

router.get('/items', getMenuItems);
router.get('/items/:slug', getMenuItemBySlug);
router.get('/categories', getCategories);

export default router;
