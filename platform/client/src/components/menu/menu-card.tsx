"use client";

import Image from "next/image";
import { ShoppingCart, Add, Minus } from "iconsax-react";
import type { MenuItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  selectedCity?: string;
}

export function MenuCard({ item, onAddToCart, selectedCity }: MenuCardProps) {
  const { isAuthenticated } = useAuth();
  const { data: cart } = useCart(isAuthenticated);
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const isFamousInSelectedCity = selectedCity && item.cityFame?.includes(selectedCity.toLowerCase().substring(0, 3));

  const cartItem = isAuthenticated ? cart?.items.find((i) => i.menuItem._id === item._id) : null;
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (onAddToCart) {
      onAddToCart(item);
    }
    addToCartMutation.mutate({ menuItem: item._id, quantity: 1 });
  };

  const handleIncrement = () => {
    if (updateCartItemMutation.isPending) return;
    updateCartItemMutation.mutate({ menuItemId: item._id, quantity: quantity + 1 });
  };

  const handleDecrement = () => {
    if (updateCartItemMutation.isPending || removeFromCartMutation.isPending) return;
    if (quantity > 1) {
      updateCartItemMutation.mutate({ menuItemId: item._id, quantity: quantity - 1 });
    } else {
      removeFromCartMutation.mutate(item._id);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-[var(--color-border-val)]/60 bg-[var(--color-card-bg)] transition-all hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 duration-500 rounded-2xl">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-[var(--color-skeleton)]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Veg/Non-Veg Badge */}
        <div className="absolute right-3.5 top-3.5 z-10">
          <div
            className={item.isVeg ? "veg-badge" : "nonveg-badge"}
            title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
          />
        </div>

        {/* City Fame Badge */}
        {isFamousInSelectedCity && (
          <Badge className="absolute left-3 top-3 bg-flame-500 hover:bg-flame-600 text-white font-medium text-[11px] px-2 py-0.5 shadow-md">
            ⭐ Famous in {selectedCity}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--color-text-primary)] text-base group-hover:text-flame-500 transition-colors line-clamp-1">
            {item.name}
          </h3>
        </div>

        <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] line-clamp-2 min-h-[32px]">
          {item.description}
        </p>

        {/* Nutritional Information Tracker */}
        {item.nutrition && (
          <div className="mt-3.5 pt-3 border-t border-dashed border-[var(--color-border-val)]/60 flex items-center justify-between gap-1 text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface)]/40 px-2 py-1.5 rounded-lg">
            <span className="font-medium text-[var(--color-text-primary)]">{item.nutrition.calories} kCal</span>
            <span>•</span>
            <span>P: {item.nutrition.protein}g</span>
            <span>•</span>
            <span>C: {item.nutrition.carbs}g</span>
            <span>•</span>
            <span>F: {item.nutrition.fat}g</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-lg font-extrabold text-flame-600">
            {formatPrice(item.price)}
          </span>

          {quantity > 0 ? (
            <div className="flex items-center border border-[var(--color-border-val)] rounded-xl bg-[var(--color-surface)]/30 h-9">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none rounded-l-xl"
                onClick={handleDecrement}
                disabled={updateCartItemMutation.isPending || removeFromCartMutation.isPending}
              >
                <Minus size={12} className="text-[var(--color-text-secondary)]" />
              </Button>
              <span className="w-8 text-center text-xs font-semibold text-[var(--color-text-primary)] select-none">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none rounded-r-xl"
                onClick={handleIncrement}
                disabled={updateCartItemMutation.isPending}
              >
                <Add size={12} className="text-[var(--color-text-secondary)]" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addToCartMutation.isPending}
              className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-9 px-4 gap-1.5 shadow-md shadow-flame-500/10 transition-all font-semibold cursor-pointer"
            >
              <ShoppingCart size={14} variant="Bold" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
