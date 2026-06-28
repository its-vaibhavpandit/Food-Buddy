import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/menu-item.model.js';
import { Category } from '../models/category.model.js';
import { AppError } from '../middleware/error.js';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search } = req.query;

    const query: any = { isAvailable: true };

    if (category) {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        // If category is invalid, we return empty list
        res.status(200).json({ status: 'success', data: { menuItems: [] } });
        return;
      }
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const menuItems = await MenuItem.find(query).populate('category');

    res.status(200).json({
      status: 'success',
      data: { menuItems }
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const menuItem = await MenuItem.findOne({ slug, isAvailable: true }).populate('category');

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');

    res.status(200).json({
      status: 'success',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};
