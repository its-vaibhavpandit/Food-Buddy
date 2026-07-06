import { Response } from 'express';
import { Cart } from '../models/cart.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { catchAsync } from '../middleware/async-handler.js';

export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
  let cart = await Cart.findOne({ user: req.user!.id }).populate('items.menuItem');
  if (!cart) {
    cart = await Cart.create({ user: req.user!.id, items: [] });
  }

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

export const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const { menuItem, quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 1 || quantity > 20) {
    throw new AppError('Quantity must be between 1 and 20', 400);
  }

  const itemExists = await MenuItem.exists({ _id: menuItem });
  if (!itemExists) {
    throw new AppError('Menu item not found', 404);
  }

  let cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) {
    cart = new Cart({ user: req.user!.id, items: [] });
  }

  const existingItemIdx = cart.items.findIndex(
    (item) => item.menuItem.toString() === menuItem
  );

  if (existingItemIdx > -1) {
    const newQty = cart.items[existingItemIdx].quantity + quantity;
    if (newQty > 20) {
      throw new AppError('Cannot add more than 20 of the same item', 400);
    }
    cart.items[existingItemIdx].quantity = newQty;
  } else {
    if (cart.items.length >= 50) {
      throw new AppError('Cart cannot contain more than 50 unique items', 400);
    }
    cart.items.push({ menuItem, quantity });
  }

  await cart.save();
  await cart.populate('items.menuItem');

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

export const updateCartItemQty = catchAsync(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 1 || quantity > 20) {
    throw new AppError('Quantity must be between 1 and 20', 400);
  }

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const itemIdx = cart.items.findIndex(
    (item) => item.menuItem.toString() === itemId
  );

  if (itemIdx === -1) {
    throw new AppError('Item not found in cart', 404);
  }

  cart.items[itemIdx].quantity = quantity;
  await cart.save();
  await cart.populate('items.menuItem');

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

export const removeFromCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.items = cart.items.filter((item) => item.menuItem.toString() !== itemId) as any;
  await cart.save();
  await cart.populate('items.menuItem');

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});

export const clearCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { items: [] } },
    { new: true, upsert: true }
  );

  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});
