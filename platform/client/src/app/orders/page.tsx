"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Calendar, Card, Wallet3, Routing } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/hooks/use-order";
import { Card as FlowCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" };
    case "confirmed":
      return { label: "Confirmed", className: "bg-blue-50 text-blue-700 border-blue-200" };
    case "preparing":
      return { label: "Preparing", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "out_for_delivery":
      return { label: "Out for Delivery", className: "bg-purple-50 text-purple-700 border-purple-200 animate-pulse" };
    case "delivered":
      return { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" };
    default:
      return { label: "Unknown", className: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders(isAuthenticated);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || ordersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Your Orders"
        description="Track your active deliveries and review your culinary history with us."
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
        {!orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FlowCard className="p-8 text-center border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg)] text-cream-600">
                <ShoppingBag size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
                  No Orders Found
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-[280px] mx-auto leading-relaxed">
                  Looks like you haven&apos;t ordered anything yet. Head to our menu and grab some spicy deals!
                </p>
              </div>
              <Button className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl" asChild>
                <Link href="/menu">Browse Our Menu</Link>
              </Button>
            </FlowCard>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => {
              const statusConfig = getStatusConfig(order.status);
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <FlowCard className="p-6 border-[var(--color-border-val)]/60 bg-[var(--color-card-bg)] hover:shadow-md transition-shadow rounded-2xl space-y-5">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-val)]/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--color-text-primary)]">
                            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </span>
                          <Badge className={`${statusConfig.className} font-semibold text-[10px] px-2 py-0.5 border`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                          <Calendar size={12} />
                          <span>{orderDate}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-flame-200 text-flame-600 hover:bg-flame-50 text-xs font-semibold gap-1.5 self-start sm:self-center h-9"
                        asChild
                      >
                        <Link href={`/orders/${order._id}`}>
                          <Routing size={14} variant="Bold" />
                          Track Order
                          <ArrowRight size={12} />
                        </Link>
                      </Button>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-3 text-xs">
                      {/* Items Summaries */}
                      <div className="sm:col-span-2 space-y-2">
                        <p className="font-semibold text-[var(--color-text-secondary)] uppercase text-[10px] tracking-wider">
                          Items ordered
                        </p>
                        <div className="text-[var(--color-text-primary)] font-medium space-y-1">
                          {order.items.map((item) => (
                            <p key={item.menuItem}>
                              • {item.name} <span className="text-[var(--color-text-secondary)] text-[11px] font-normal">x{item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Payment/Price Summaries */}
                      <div className="space-y-3 sm:border-l sm:border-[var(--color-border-val)]/60 sm:pl-6">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--color-text-secondary)] uppercase text-[10px] tracking-wider">
                            Payment method
                          </p>
                          <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                            {order.paymentMethod === "online" ? (
                              <>
                                <Card size={14} className="text-flame-500" />
                                <span>Paid Online</span>
                              </>
                            ) : (
                              <>
                                <Wallet3 size={14} className="text-flame-500" />
                                <span>Cash on Delivery</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-semibold text-[var(--color-text-secondary)] uppercase text-[10px] tracking-wider">
                            Total amount
                          </p>
                          <p className="text-base font-extrabold text-flame-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </FlowCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
