"use client";

import Image from "next/image";
import { Trash, Add, Minus } from "iconsax-react";
import { Button } from "@/components/ui/button";
import type { CartItem as CartItemType } from "@/types";
import { useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
  isReadOnly?: boolean;
}

export function CartItem({ item, isReadOnly = false }: CartItemProps) {
  const updateQty = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleIncrement = () => {
    if (updateQty.isPending) return;
    updateQty.mutate({
      menuItemId: item.menuItem._id,
      quantity: item.quantity + 1,
    });
  };

  const handleDecrement = () => {
    if (updateQty.isPending || item.quantity <= 1) return;
    updateQty.mutate({
      menuItemId: item.menuItem._id,
      quantity: item.quantity - 1,
    });
  };

  const handleRemove = () => {
    if (removeItem.isPending) return;
    removeItem.mutate(item.menuItem._id);
  };

  const formattedPrice = (item.menuItem.price / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const formattedItemTotal = ((item.menuItem.price * item.quantity) / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex gap-4 border-b border-border/60 py-4 last:border-0 items-center justify-between">
      {/* Product Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/40">
        <Image
          src={item.menuItem.image}
          alt={item.menuItem.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <h4 className="truncate text-sm font-semibold text-foreground">
            {item.menuItem.name}
          </h4>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{formattedPrice} each</p>

        {/* Mobile controls */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 mt-2.5 sm:hidden">
            <div className="flex items-center border border-border/80 rounded-lg bg-cream-50/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={handleDecrement}
                disabled={item.quantity <= 1 || updateQty.isPending}
              >
                <Minus size={12} className="text-muted-foreground" />
              </Button>
              <span className="w-8 text-center text-xs font-semibold text-foreground">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={handleIncrement}
                disabled={updateQty.isPending}
              >
                <Add size={12} className="text-muted-foreground" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg"
              onClick={handleRemove}
              disabled={removeItem.isPending}
            >
              <Trash size={14} variant="Bold" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop controls */}
      {!isReadOnly && (
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center border border-border/80 rounded-lg bg-cream-50/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || updateQty.isPending}
            >
              <Minus size={14} className="text-muted-foreground" />
            </Button>
            <span className="w-8 text-center text-xs font-semibold text-foreground">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={handleIncrement}
              disabled={updateQty.isPending}
            >
              <Add size={14} className="text-muted-foreground" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            onClick={handleRemove}
            disabled={removeItem.isPending}
          >
            <Trash size={16} variant="Bold" />
          </Button>
        </div>
      )}

      {/* Item Total */}
      <div className="text-right pl-2">
        <span className="text-sm font-semibold text-foreground">{formattedItemTotal}</span>
      </div>
    </div>
  );
}
