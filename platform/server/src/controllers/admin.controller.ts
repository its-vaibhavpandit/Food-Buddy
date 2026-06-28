import { Response, NextFunction } from 'express';
import { Order } from '../models/order.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { Category } from '../models/category.model.js';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

// Helper to convert strings to slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// Dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalMenuItems = await MenuItem.countDocuments();
    
    // Aggregation for sales
    const salesAggregation = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalSales: { $sum: '$total' }, totalOrders: { $sum: 1 } } }
    ]);

    const totalOrders = await Order.countDocuments();

    const totalSales = salesAggregation[0]?.totalSales || 0;
    const completedOrders = salesAggregation[0]?.totalOrders || 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    // Sales by category aggregation
    const salesByCategory = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuDetail'
        }
      },
      { $unwind: '$menuDetail' },
      {
        $lookup: {
          from: 'categories',
          localField: 'menuDetail.category',
          foreignField: '_id',
          as: 'categoryDetail'
        }
      },
      { $unwind: '$categoryDetail' },
      {
        $group: {
          _id: '$categoryDetail.name',
          value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalMenuItems,
          totalOrders,
          completedOrders,
          totalSales,
        },
        recentOrders,
        salesByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin)
export const adminGetOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin)
export const adminUpdateOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin)
export const adminGetUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Menu Item CRUD
export const adminCreateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, image, category, isVeg, isAvailable, tags } = req.body;

    const slug = slugify(name);
    const existingItem = await MenuItem.findOne({ slug });
    if (existingItem) {
      throw new AppError('Menu item with this name already exists', 400);
    }

    const menuItem = await MenuItem.create({
      name,
      slug,
      description,
      price,
      image,
      category,
      isVeg: isVeg ?? true,
      isAvailable: isAvailable ?? true,
      tags: tags ?? []
    });

    res.status(201).json({
      status: 'success',
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    const menuItem = await MenuItem.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
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

export const adminDeleteMenuItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      throw new AppError('Menu item not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Category CRUD
export const adminCreateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, image, sortOrder, isActive } = req.body;

    const slug = slugify(name);
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 400);
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true
    });

    res.status(201).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    const category = await Category.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if category has menu items before deleting
    const hasItems = await MenuItem.exists({ category: id });
    if (hasItems) {
      throw new AppError('Cannot delete category: It has active menu items', 400);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
