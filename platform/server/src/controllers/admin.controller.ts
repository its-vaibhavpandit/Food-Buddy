import { Request, Response } from 'express';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { Category } from '../models/category.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Transaction } from '../models/transaction.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';
import { slugify } from '../utils/slugify.js';

/** Escape regex special characters to prevent ReDoS */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Dashboard Stats (Enhanced) ──────────────────────────────

export const getDashboardStats = catchAsync(async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 7-day range for trend data
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalUsers,
    totalMenuItems,
    totalOrders,
    todayOrders,
    revenueResult,
    todayRevenueResult,
    recentOrders,
    statusCounts,
    totalRestaurants,
    activeRestaurants,
    totalTransactions,
    capturedTransactions,
    revenueByPaymentMethod,
    dailyOrders,
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
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email phone').lean(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ isOpen: true }),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: 'captured' }),
    Order.aggregate([
      { $group: { _id: '$paymentMethod', total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const todayRevenue = todayRevenueResult[0]?.total || 0;
  const ordersByStatus = Object.fromEntries(
    statusCounts.map((s: any) => [s._id, s.count])
  );
  const paymentMethodBreakdown = Object.fromEntries(
    revenueByPaymentMethod.map((p: any) => [p._id, { total: p.total, count: p.count }])
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
      totalRestaurants,
      activeRestaurants,
      totalTransactions,
      capturedTransactions,
      paymentMethodBreakdown,
      dailyOrders,
    },
  });
});

// ─── Orders (Enhanced with search + date range) ──────────────

export const adminGetOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const search = req.query.search as string;
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;

  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') filter.status = status;
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    filter.createdAt = dateFilter;
  }

  // If search is provided, find matching user IDs first
  let userIds: string[] | undefined;
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    const matchingUsers = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).select('_id').lean();
    userIds = matchingUsers.map((u: any) => u._id);
    filter.user = { $in: userIds };
  }

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

// ─── Update Order Status ─────────────────────────────────────

import { emitOrderStatusUpdate } from '../config/socket.js';

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

  // Broadcast live Socket.IO update to customer tracking room and admin dashboard
  emitOrderStatusUpdate(id as string, status, order.updatedAt?.toISOString());

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

// ─── Users (Enhanced — all roles + search) ───────────────────

export const adminGetUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const role = req.query.role as string;
  const search = req.query.search as string;

  const filter: Record<string, unknown> = {};
  if (role && role !== 'all') filter.role = role;
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-__v').sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    data: { users },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ─── Restaurants (Scoped Access Control) ──────────────────────

export const adminGetRestaurants = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const city = req.query.city as string;
  const scope = req.query.scope as string; // 'my' or 'all'

  const currentUserId = (req as AuthRequest).user?.id;
  const filter: Record<string, unknown> = {};

  if (scope === 'my' && currentUserId) {
    filter.owner = currentUserId;
  }
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: regex }, { 'address.city': regex }];
  }
  if (city && city !== 'all') {
    filter['address.city'] = new RegExp(escapeRegex(city.trim()), 'i');
  }

  const [rawRestaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email')
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  const restaurants = rawRestaurants.map((r: any) => {
    const ownerId = r.owner?._id ? r.owner._id.toString() : r.owner ? r.owner.toString() : "";
    return {
      ...r,
      isOwner: ownerId === currentUserId,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { restaurants },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const adminCreateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as AuthRequest).user?.id;
  if (!req.body.owner && currentUserId) {
    req.body.owner = currentUserId;
  }
  if (req.body.name && !req.body.slug) {
    req.body.slug = slugify(req.body.name);
  }
  const restaurant = await Restaurant.create(req.body);
  await restaurant.populate('owner', 'name email');

  res.status(201).json({
    status: 'success',
    data: { restaurant },
  });
});

export const adminUpdateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = (req as AuthRequest).user?.id;

  const existing = await Restaurant.findById(id);
  if (!existing) throw new AppError('Restaurant not found', 404);

  // Scoped authorization check: only the assigned owner can edit this restaurant
  if (existing.owner && existing.owner.toString() !== currentUserId) {
    throw new AppError(`Forbidden: You do not have permission to manage "${existing.name}". It is assigned to another admin owner.`, 403);
  }

  const restaurant = await Restaurant.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email');

  res.status(200).json({
    status: 'success',
    data: { restaurant },
  });
});

export const adminDeleteRestaurant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = (req as AuthRequest).user?.id;

  const existing = await Restaurant.findById(id);
  if (!existing) throw new AppError('Restaurant not found', 404);

  // Scoped authorization check: only the assigned owner can delete this restaurant
  if (existing.owner && existing.owner.toString() !== currentUserId) {
    throw new AppError(`Forbidden: You do not have permission to delete "${existing.name}". It is assigned to another admin owner.`, 403);
  }

  await Restaurant.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Restaurant deleted successfully',
  });
});

// ─── Transactions ────────────────────────────────────────────

export const adminGetTransactions = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') filter.status = status;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('order', 'total status')
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    data: { transactions },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ─── Menu CRUD ────────────────────────────────────────────

export const adminCreateMenuItem = catchAsync(async (req: Request, res: Response) => {
  if (!req.body.slug && req.body.name) {
    req.body.slug = `${slugify(req.body.name)}-${Date.now().toString().slice(-4)}`;
  }
  const menuItem = await MenuItem.create(req.body);
  await menuItem.populate('category');

  res.status(201).json({
    status: 'success',
    data: { menuItem },
  });
});

export const adminUpdateMenuItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.body.name && !req.body.slug) {
    req.body.slug = `${slugify(req.body.name)}-${Date.now().toString().slice(-4)}`;
  }
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
  if (!req.body.slug && req.body.name) {
    req.body.slug = slugify(req.body.name);
  }
  const category = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

export const adminUpdateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.body.name && !req.body.slug) {
    req.body.slug = slugify(req.body.name);
  }
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
