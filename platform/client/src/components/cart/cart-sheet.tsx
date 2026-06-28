"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";

export function CartSheet() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Only query cart when user is authenticated and the sheet is open or we need cart badge
  const { data: cart, isLoading } = useCart(isAuthenticated);

  const cartItemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const subtotal = cart?.items.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0
  ) || 0;

  const formattedSubtotal = (subtotal / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-cream-100/40 rounded-xl"
          aria-label={`Open mini-cart with ${cartItemCount} items`}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-flame-500 p-0 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background"
            >
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-white rounded-l-3xl">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-flame-50 text-flame-500">
              <ShoppingCart size={18} variant="Bold" />
            </div>
            <SheetTitle className="font-bold text-lg text-foreground font-[family-name:var(--font-display)]">
              Your Order
            </SheetTitle>
            {cartItemCount > 0 && (
              <Badge className="bg-flame-50 text-flame-600 border border-flame-100 hover:bg-flame-50 text-xs font-semibold px-2 py-0.5">
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Review your dishes and proceed to get them delivered hot.
          </SheetDescription>
        </SheetHeader>

        {/* Guest View */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-50 text-cream-600">
              <ShoppingCart size={32} />
            </div>
            <h4 className="text-base font-semibold text-foreground">Login Required</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
              Please sign in to your Fast Food Buddy account to build your cart and place orders.
            </p>
            <Button
              className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl px-6"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/login">Log In to Continue</Link>
            </Button>
          </div>
        ) : isLoading ? (
          // Loading View
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          // Empty View
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-50 text-cream-400">
              <ShoppingCart size={32} />
            </div>
            <h4 className="text-base font-semibold text-foreground">Your cart is empty</h4>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Looks like you haven&apos;t added any delicious food items yet.
            </p>
            <Button
              variant="outline"
              className="border-flame-200 text-flame-600 hover:bg-flame-50 hover:text-flame-700 rounded-xl"
              onClick={() => setOpen(false)}
              asChild
            >
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          // Cart Items List
          <ScrollArea className="flex-1 px-6 py-2">
            <div className="space-y-1">
              {cart.items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer summary */}
        {isAuthenticated && cart && cart.items.length > 0 && (
          <div className="p-6 border-t border-border/60 bg-cream-50/20 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formattedSubtotal}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Taxes, discounts, and delivery partner fees calculated during checkout.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-xl py-5 border-border hover:bg-cream-50 hover:text-foreground text-xs font-semibold"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/cart">View Cart</Link>
              </Button>
              
              <Button
                className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl py-5 text-xs font-semibold flex items-center justify-center gap-1 group shadow-sm shadow-flame-500/10"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/checkout">
                  Checkout
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
