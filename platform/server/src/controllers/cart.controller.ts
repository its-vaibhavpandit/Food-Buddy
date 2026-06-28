import { Response, NextFunction } from 'express';
import { Cart } from '../models/cart.model.js';
import { MenuItem } from '../models/menu-item.model.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { menuItem, quantity } = req.body;

    const itemExists = await MenuItem.findById(menuItem);
    if (!itemExists) {
      throw new AppError('Menu item not found', 404);
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItemIdx = cart.items.findIndex(
      (item) => item.menuItem.toString() === menuItem
    );

    if (existingItemIdx > -1) {
      cart.items[existingItemIdx].quantity += quantity;
    } else {
      cart.items.push({ menuItem, quantity });
    }

    await cart.save();
    await cart.populate('items.menuItem');

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { itemId } = req.params; // This is the menuItem ID
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
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
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { itemId } = req.params; // This is the menuItem ID

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter((item) => item.menuItem.toString() !== itemId) as any;
    await cart.save();
    await cart.populate('items.menuItem');

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [] as any;
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};
