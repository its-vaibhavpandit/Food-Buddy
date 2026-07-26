import type { MenuItem } from "./menu";

export interface CartItem {
  _id: string;
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: string;
}

export interface AddToCartPayload {
  menuItem: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
