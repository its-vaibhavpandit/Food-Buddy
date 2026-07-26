"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Trash } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart, useClearCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart(isAuthenticated);
  const clearCartMutation = useClearCart();

  const handleClearCart = () => {
    if (clearCartMutation.isPending) return;
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCartMutation.mutate();
    }
  };

  const cartItemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Your Cart"
        description="Review your selected items and customize quantities before checkout."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {!isAuthenticated ? (
          /* Guest View */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="max-w-md mx-auto p-8 text-center border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg)] text-cream-600">
                <ShoppingCart size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
                  Log In to View Your Cart
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  We sync your cart items dynamically to your profile so you can place orders seamlessly across all your devices.
                </p>
              </div>
              <Button className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl py-5" asChild>
                <Link href="/login">Sign In & Continue</Link>
              </Button>
            </Card>
          </motion.div>
        ) : isLoading ? (
          /* Loading View Skeletons */
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((n) => (
                <Card key={n} className="p-4 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl flex gap-4 items-center animate-pulse">
                  <div className="h-16 w-16 bg-[var(--color-surface)] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-[var(--color-surface)] rounded" />
                    <div className="h-3 w-1/4 bg-[var(--color-surface)] rounded" />
                  </div>
                  <div className="h-4 w-16 bg-[var(--color-surface)] rounded" />
                </Card>
              ))}
            </div>
            <div className="h-48 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/50 rounded-2xl animate-pulse" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty Cart View */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="max-w-md mx-auto p-8 text-center border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg)] text-cream-400">
                <ShoppingCart size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
                  Your Cart is Empty
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Looks like you haven&apos;t added any yummy bites to your cart yet. Head to our menu to discover our famous special recipes!
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl py-5" asChild>
                  <Link href="/menu">Explore Menu</Link>
                </Button>
                <Button variant="ghost" className="w-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-xl" asChild>
                  <Link href="/" className="flex items-center justify-center gap-1.5">
                    <ArrowLeft size={16} /> Back to Home
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Cart Grid Content */
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-val)]/60">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Selected Dishes ({cartItemCount})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 rounded-lg text-xs font-semibold px-2.5"
                    onClick={handleClearCart}
                    disabled={clearCartMutation.isPending}
                  >
                    <Trash size={14} variant="Bold" />
                    Clear All
                  </Button>
                </div>

                <div className="divide-y divide-border/60">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Continue Shopping CTA */}
              <div className="text-left">
                <Button variant="ghost" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] gap-1.5 rounded-xl px-0" asChild>
                  <Link href="/menu">
                    <ArrowLeft size={16} /> Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-1 sticky top-24">
              <CartSummary cart={cart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
