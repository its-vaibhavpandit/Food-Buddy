"use client";

import Link from "next/link";
import { ArrowRight, Ticket } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Cart } from "@/types";

interface CartSummaryProps {
  cart: Cart;
  isCheckout?: boolean;
}

export function CartSummary({ cart, isCheckout = false }: CartSummaryProps) {
  // Calculate subtotal
  const subtotal = cart.items.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0
  );

  // GST 5% for restaurants
  const tax = Math.round(subtotal * 0.05);

  // Delivery fee: ₹40, free for orders above ₹500 (50000 paise)
  const deliveryFee = subtotal >= 50000 || subtotal === 0 ? 0 : 4000;

  const total = subtotal + tax + deliveryFee;

  const formatCurrency = (val: number) => {
    return (val / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
        Order Summary
      </h3>

      <div className="space-y-3.5 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(subtotal)}</span>
        </div>

        {/* GST */}
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>GST (5%)</span>
          <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(tax)}</span>
        </div>

        {/* Delivery */}
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Delivery Partner Fee</span>
          {deliveryFee === 0 ? (
            <span className="font-semibold text-green-600">FREE</span>
          ) : (
            <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(deliveryFee)}</span>
          )}
        </div>

        {subtotal > 0 && subtotal < 50000 && (
          <p className="text-[11px] text-flame-500 font-medium bg-flame-50/50 p-2 rounded-lg text-center">
            🎉 Add {formatCurrency(50000 - subtotal)} more for FREE delivery!
          </p>
        )}

        <Separator className="bg-border/60" />

        {/* Total */}
        <div className="flex justify-between text-base font-bold text-[var(--color-text-primary)] pt-1.5">
          <span>Grand Total</span>
          <span className="text-flame-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Promocode Placeholder */}
      {!isCheckout && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Promo Code"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[var(--color-border-val)]/80 rounded-xl bg-[var(--color-bg)] focus:outline-none focus:border-flame-400 font-medium"
            />
          </div>
          <Button variant="outline" className="text-xs rounded-xl h-9 hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]">
            Apply
          </Button>
        </div>
      )}

      {/* Action Button */}
      {!isCheckout && (
        <Button
          className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl py-6 text-sm font-semibold flex items-center justify-center gap-2 group shadow-sm shadow-flame-500/10"
          asChild
          disabled={cart.items.length === 0}
        >
          <Link href="/checkout">
            Proceed to Checkout
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      )}
    </Card>
  );
}
