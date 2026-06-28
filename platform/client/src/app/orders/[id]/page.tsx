"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TickSquare,
  Clock,
  Location,
  Call,
  Card,
  Wallet3,
  Routing,
  InfoCircle,
  CloseCircle,
} from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useOrder } from "@/hooks/use-order";
import { Card as FlowCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

// Steps list for delivery tracking timeline
const STEPS: { status: OrderStatus; title: string; desc: string }[] = [
  { status: "pending", title: "Order Placed", desc: "Received and awaiting confirmation" },
  { status: "confirmed", title: "Confirmed", desc: "Restaurant accepted your order" },
  { status: "preparing", title: "Preparing", desc: "Chef is crafting your delicious meal" },
  { status: "out_for_delivery", title: "Out for Delivery", desc: "Rider is dashing to your location" },
  { status: "delivered", title: "Delivered", desc: "Enjoy your hot fast food!" },
];

function getStatusIndex(status: OrderStatus): number {
  const indexes: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    out_for_delivery: 3,
    delivered: 4,
    cancelled: -1,
  };
  return indexes[status] ?? 0;
}

function getRemainingMinutes(createdAt: string, status: OrderStatus, tick: number): number {
  if (tick < 0) return 0;
  const inProgress = ["pending", "confirmed", "preparing", "out_for_delivery"].includes(status);
  if (!inProgress) return 0;

  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const totalEstMap: Record<string, number> = {
    pending: 40,
    confirmed: 35,
    preparing: 25,
    out_for_delivery: 15,
  };
  const baseEst = totalEstMap[status] || 30;
  return Math.max(1, baseEst - elapsedMins);
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Real-time status simulation: poll every 15 seconds for mock tracking simulation
  const { data: order, isLoading: orderLoading, refetch } = useOrder(id, isAuthenticated);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Setup auto-refetch polling and ticking during active delivery
  useEffect(() => {
    if (!order) return;
    const inProgress = ["pending", "confirmed", "preparing", "out_for_delivery"].includes(order.status);
    if (!inProgress) return;

    const poll = setInterval(() => {
      refetch();
    }, 15000); // check database status updates every 15s

    const ticker = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000); // tick every 30s to update elapsed minutes

    return () => {
      clearInterval(poll);
      clearInterval(ticker);
    };
  }, [order, refetch]);

  const simulatedMinutes = order ? getRemainingMinutes(order.createdAt, order.status, tick) : 0;

  if (authLoading || orderLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50/20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md mt-16 p-8 text-center bg-white border border-border/50 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          The requested order details could not be found. Check your history.
        </p>
        <Button className="mt-6 bg-flame-500 hover:bg-flame-600 text-white rounded-xl" asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-border/60 py-8 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to your orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-foreground font-[family-name:var(--font-display)]">
                  Order Tracking
                </h1>
                <Badge className="bg-flame-50 text-flame-600 border border-flame-100 hover:bg-flame-50 font-bold text-[10px] sm:text-xs px-2.5 py-0.5">
                  #{order._id.substring(order._id.length - 8).toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            {order.status !== "delivered" && !isCancelled && (
              <div className="flex items-center gap-2.5 bg-flame-50 text-flame-700 px-4 py-3 rounded-2xl border border-flame-100">
                <Clock size={20} variant="Bold" className="animate-pulse" />
                <div>
                  <p className="text-[10px] font-bold text-flame-600 uppercase tracking-wide leading-none">
                    ESTIMATED DELIVERY
                  </p>
                  <p className="text-sm font-black mt-0.5">~{simulatedMinutes} Mins Remaining</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          
          {/* Left Columns - Stepper timeline and maps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Timeline Tracker */}
            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm">
              <h2 className="text-base font-bold font-[family-name:var(--font-display)] text-foreground pb-4 border-b border-border/60 mb-6">
                Delivery Progress Timeline
              </h2>

              {isCancelled ? (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3">
                  <CloseCircle size={20} variant="Bold" className="shrink-0" />
                  <div>
                    <h3 className="font-bold text-xs">Order Cancelled</h3>
                    <p className="text-[10px] text-red-600 mt-0.5">
                      This order was cancelled. Please browse our menu to place a new order.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-cream-100">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={step.status} className="relative flex gap-4 items-start text-left">
                        {/* Bullet Icon marker */}
                        <div
                          className={`absolute -left-[18px] sm:-left-[20px] top-0 h-[20px] w-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-flame-500 border-flame-500 text-white"
                              : isActive
                              ? "bg-white border-flame-500 shadow-md shadow-flame-500/10"
                              : "bg-white border-cream-200 text-cream-200"
                          }`}
                        >
                          {isCompleted ? (
                            <TickSquare size={10} variant="Bold" />
                          ) : isActive ? (
                            <div className="h-2 w-2 rounded-full bg-flame-500 animate-ping" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-cream-200" />
                          )}
                        </div>

                        {/* Title details */}
                        <div className="pl-4">
                          <h3
                            className={`text-xs font-bold ${
                              isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </FlowCard>

            {/* Delivery address details and map mock */}
            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Delivery Details
                </h3>
                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex gap-2.5 items-start">
                    <Location size={18} className="text-flame-500 shrink-0" variant="Bold" />
                    <div>
                      <p className="font-semibold text-foreground">Delivery Address</p>
                      <p className="mt-0.5 leading-relaxed text-[11px]">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="flex gap-2.5 items-start">
                      <InfoCircle size={18} className="text-flame-500 shrink-0" variant="Bold" />
                      <div>
                        <p className="font-semibold text-foreground">Driver Instructions</p>
                        <p className="mt-0.5 leading-relaxed text-[11px] italic font-medium">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5 items-start">
                    <Call size={18} className="text-flame-500 shrink-0" variant="Bold" />
                    <div>
                      <p className="font-semibold text-foreground">Support Helpline</p>
                      <p className="mt-0.5 text-[11px]">+91 79916273680 (Fast Food Support)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* simulated Live Map tracking view */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-border bg-cream-50 flex items-center justify-center">
                {/* Simulated grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-35" />
                
                {/* Rider Path */}
                {order.status === "out_for_delivery" ? (
                  <div className="absolute h-[2px] w-2/3 bg-dashed bg-flame-500 animate-pulse left-10 top-1/2 -translate-y-1/2" />
                ) : null}

                {/* Simulated Marker */}
                <div className="relative z-10 flex flex-col items-center gap-1 text-center bg-white/90 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-border shadow-xs">
                  <Routing size={22} className="text-flame-500 animate-bounce" variant="Bold" />
                  <p className="font-extrabold text-[10px] text-foreground">
                    {order.status === "delivered" ? "Rider Reached!" : "Rider in Transit"}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-none">
                    Ghazipur City Area
                  </p>
                </div>
              </div>
            </FlowCard>

          </div>

          {/* Right Column - Cost and invoice items */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Cost Summary card */}
            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-5">
              <h2 className="text-base font-bold font-[family-name:var(--font-display)] text-foreground pb-3 border-b border-border/60">
                Invoice Breakdown
              </h2>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Purchased dishes
                  </p>
                  <div className="space-y-2 text-xs">
                    {order.items.map((item) => (
                      <div key={item.menuItem} className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground flex-1 min-w-0 truncate pr-2">
                          {item.name} <span className="font-bold text-foreground">x{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-foreground shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (5%)</span>
                    <span className="font-medium text-foreground">{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Partner Fee</span>
                    <span className="font-medium text-foreground">
                      {order.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                  <Separator className="my-2 bg-border/40" />
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="text-xs text-foreground">Amount Paid</span>
                    <span className="text-base font-extrabold text-flame-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                <div className="text-[10px] text-muted-foreground flex items-center gap-2 bg-cream-50/20 p-2.5 rounded-lg border border-border/30">
                  {order.paymentMethod === "online" ? (
                    <>
                      <Card size={14} className="text-emerald-500" variant="Bold" />
                      <span>Online transaction verified. Thank you!</span>
                    </>
                  ) : (
                    <>
                      <Wallet3 size={14} className="text-amber-500" variant="Bold" />
                      <span>Pay by Cash or UPI on delivery partner arrival.</span>
                    </>
                  )}
                </div>
              </div>
            </FlowCard>

            {/* AI Assistant helper advice */}
            <FlowCard className="p-5 border-border/50 bg-white rounded-2xl shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <h4 className="text-xs font-bold text-foreground">Buddy AI Assistant Advice</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Need to change the delivery instructions or check if your rider is carrying cutlery? Ask me directly by clicking the floating assistant button in the bottom right!
              </p>
            </FlowCard>

          </div>

        </div>
      </div>
    </div>
  );
}
