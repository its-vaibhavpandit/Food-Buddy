import { Request, Response } from 'express';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { Category } from '../models/category.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';

export const getDashboardStats = catchAsync(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Parallelize all independent queries
  const [
    totalUsers,
    totalMenuItems,
    totalOrders,
    todayOrders,
    revenueResult,
    todayRevenueResult,
    recentOrders,
    statusCounts,
  ] = await Promise.all([
    User.countDocuments(),
    MenuItem.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email').lean(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const todayRevenue = todayRevenueResult[0]?.total || 0;
  const ordersByStatus = Object.fromEntries(
    statusCounts.map((s: any) => [s._id, s.count])
  );

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalMenuItems,
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      ordersByStatus,
      recentOrders,
    },
  });
});

export const adminGetOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('user', 'name email phone').lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    data: { orders },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const adminUpdateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone');

  if (!order) throw new AppError('Order not found', 404);

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

export const adminGetUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ role: 'customer' }).select('-__v').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments({ role: 'customer' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { users },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ─── Menu CRUD ────────────────────────────────────────────

export const adminCreateMenuItem = catchAsync(async (req: Request, res: Response) => {
  const menuItem = await MenuItem.create(req.body);
  await menuItem.populate('category');

  res.status(201).json({
    status: 'success',
    data: { menuItem },
  });
});

export const adminUpdateMenuItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const menuItem = await MenuItem.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!menuItem) throw new AppError('Menu item not found', 404);

  res.status(200).json({
    status: 'success',
    data: { menuItem },
  });
});

export const adminDeleteMenuItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const menuItem = await MenuItem.findByIdAndDelete(id);

  if (!menuItem) throw new AppError('Menu item not found', 404);

  res.status(200).json({
    status: 'success',
    message: 'Menu item deleted',
  });
});

// ─── Category CRUD ────────────────────────────────────────

export const adminCreateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

export const adminUpdateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) throw new AppError('Category not found', 404);

  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

export const adminDeleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);

  if (!category) throw new AppError('Category not found', 404);

  res.status(200).json({
    status: 'success',
    message: 'Category deleted',
  });
});
