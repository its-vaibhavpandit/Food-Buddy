import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Cart } from "@/types";

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { cart: Cart } }>("/cart");
      return data.data.cart;
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time for smooth browsing
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItem, quantity }: { menuItem: string; quantity: number }) => {
      const { data } = await api.post<{ status: string; data: { cart: Cart } }>("/cart", {
        menuItem,
        quantity,
      });
      return data.data.cart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(["cart"], newCart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, quantity }: { menuItemId: string; quantity: number }) => {
      const { data } = await api.patch<{ status: string; data: { cart: Cart } }>(
        `/cart/items/${menuItemId}`,
        { quantity }
      );
      return data.data.cart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(["cart"], newCart);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const { data } = await api.delete<{ status: string; data: { cart: Cart } }>(
        `/cart/items/${menuItemId}`
      );
      return data.data.cart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(["cart"], newCart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ status: string; data: { cart: Cart } }>("/cart");
      return data.data.cart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(["cart"], newCart);
    },
  });
}
