import { Response, NextFunction } from 'express';
import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { deliveryAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    // Verify item availability and calculate subtotal
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
        quantity: item.quantity
      });
    }

    // Apply charges:
    // Tax = 5% GST
    const tax = Math.round(subtotal * 0.05);
    // Delivery fee = ₹40 (free if subtotal > ₹500)
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      notes
    });

    // Clear cart after placing order successfully
    cart.items = [] as any;
    await cart.save();

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user.id });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
