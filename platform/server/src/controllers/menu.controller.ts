import { Request, Response } from 'express';
import { MenuItem } from '../models/menu-item.model.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';

/** Escape regex special characters to prevent ReDoS */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getMenuItems = catchAsync(async (req: Request, res: Response) => {
  const { category, search } = req.query;

  const query: Record<string, unknown> = { isAvailable: true };

  if (category) {
    const foundCategory = await Category.findOne({ slug: category }).lean();
    if (foundCategory) {
      query.category = foundCategory._id;
    } else {
      res.status(200).json({ status: 'success', data: { menuItems: [] } });
      return;
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  const menuItems = await MenuItem.find(query).populate('category').lean();

  res.status(200).json({
    status: 'success',
    data: { menuItems },
  });
});

export const getMenuItemBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const menuItem = await MenuItem.findOne({ slug, isAvailable: true }).populate('category').lean();

  if (!menuItem) throw new AppError('Menu item not found', 404);

  res.status(200).json({
    status: 'success',
    data: { menuItem },
  });
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder').lean();

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});
