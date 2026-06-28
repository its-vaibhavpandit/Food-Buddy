import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MenuItem, Category } from "@/types";

interface GetMenuItemsParams {
  category?: string;
  search?: string;
}

export function useMenuItems({ category, search }: GetMenuItemsParams = {}) {
  return useQuery({
    queryKey: ["menuItems", { category, search }],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { menuItems: MenuItem[] } }>("/menu/items", {
        params: { category, search },
      });
      return data.data.menuItems;
    },
  });
}

export function useMenuItemBySlug(slug: string) {
  return useQuery({
    queryKey: ["menuItem", slug],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { menuItem: MenuItem } }>(`/menu/items/${slug}`);
      return data.data.menuItem;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { categories: Category[] } }>("/menu/categories");
      return data.data.categories;
    },
  });
}
