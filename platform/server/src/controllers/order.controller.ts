import { Response } from 'express';
import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { deliveryAddress, paymentMethod, upiTransactionId, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user!.id }).populate('items.menuItem');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  if (paymentMethod === 'upi' && !upiTransactionId) {
    throw new AppError('UPI Transaction ID is required for UPI payments', 400);
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const menuItem: any = item.menuItem;
    if (!menuItem.isAvailable) {
      throw new AppError(`Item "${menuItem.name}" is no longer available`, 400);
    }

    const itemTotal = menuItem.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    });
  }

  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;

  const order = await Order.create({
    user: req.user!.id,
    items: orderItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    deliveryAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    upiTransactionId: paymentMethod === 'upi' ? upiTransactionId : undefined,
    notes,
  });

  // Clear cart after order placement
  cart.items = [] as any;
  await cart.save();

  res.status(201).json({
    status: 'success',
    data: { order },
  });
});

export const getOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!.id }).sort('-createdAt').skip(skip).limit(limit).lean(),
    Order.countDocuments({ user: req.user!.id }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { orders },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id, user: req.user!.id }).lean();

  if (!order) throw new AppError('Order not found', 404);

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});
