import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Order, CreateOrderPayload } from "@/types";

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { orders: Order[] } }>("/orders");
      return data.data.orders;
    },
    enabled,
    retry: false,
  });
}

export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { order: Order } }>(`/orders/${id}`);
      return data.data.order;
    },
    enabled: enabled && !!id,
    retry: false,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post<{ status: string; data: { order: Order } }>("/orders", payload);
      return data.data.order;
    },
    onSuccess: (newOrder) => {
      // Invalidate both orders lists and current cart since checkout empties the cart
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.setQueryData(["order", newOrder._id], newOrder);
    },
  });
}
