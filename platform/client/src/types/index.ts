export type { User, Address, AuthResponse, LoginPayload, RegisterPayload } from "./user";
export type { Category, MenuItem, MenuFilters } from "./menu";
export type { Cart, CartItem, AddToCartPayload, UpdateCartItemPayload } from "./cart";
export type {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderPayload,
} from "./order";

/** Standard API response wrapper from the backend */
export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  status: "success" | "error";
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
