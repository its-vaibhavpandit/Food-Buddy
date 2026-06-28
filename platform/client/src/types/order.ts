import type { Address } from "./user";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: OrderAddress;
  paymentMethod: "cod" | "online";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  deliveryAddress: OrderAddress;
  paymentMethod: "cod" | "online";
  notes?: string;
}
