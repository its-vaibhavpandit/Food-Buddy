"use client";

import { useState } from "react";
import { Shop, Notification, Setting2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export default function RestaurantDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Restaurant Partner Portal"
        description="Manage live orders, menu stock availability, and outlet settings in real-time."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Restaurant Outlet Header */}
        <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-flame-100 text-flame-600 rounded-2xl flex items-center justify-center font-bold">
              <Shop size={32} variant="Bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Agro Birds Kitchen</h2>
                <Badge className={isOpen ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                  {isOpen ? "ONLINE & ACCEPTING ORDERS" : "OUTLET CLOSED"}
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Varanasi Central • Outlet ID: #RST-8829</p>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={isOpen ? "bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold" : "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"}
          >
            {isOpen ? "Pause Taking Orders" : "Open Outlet Now"}
          </Button>
        </Card>

        {/* Live Kitchen Order Stream */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-val)]/60">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Notification size={18} className="text-flame-500" variant="Bold" /> Live Kitchen Orders (2 Active)
              </h3>
              <span className="text-xs font-bold text-flame-600 animate-pulse">● Auto Refresh Live</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[var(--color-bg)]/50 border border-flame-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] font-mono">#ORD-991201</span>
                  <Badge className="bg-amber-100 text-amber-800 font-bold text-[10px]">PREPARING (12 mins remaining)</Badge>
                </div>
                <div className="text-xs space-y-1 text-[var(--color-text-primary)]">
                  <p>• 2x Classic Cheeseburger (Extra Cheese)</p>
                  <p>• 1x Hyderabadi Biryani</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-val)]/40">
                  <span className="text-xs font-bold text-flame-600">₹447.00 • Paid via Razorpay</span>
                  <Button size="sm" className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-xs font-bold">
                    Mark Ready for Pickup
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-[var(--color-bg)]/50 border border-[var(--color-border-val)]/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] font-mono">#ORD-991198</span>
                  <Badge className="bg-blue-100 text-blue-800 font-bold text-[10px]">OUT FOR DELIVERY</Badge>
                </div>
                <div className="text-xs space-y-1 text-[var(--color-text-primary)]">
                  <p>• 1x Margherita Pizza</p>
                  <p>• 2x Cold Soda</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-val)]/40">
                  <span className="text-xs font-bold text-emerald-600">₹320.00 • Paid via UPI</span>
                  <Badge className="bg-emerald-50 text-emerald-700 font-bold text-[10px]">Rider Assigned (Rajesh K.)</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stock Controls */}
          <Card className="p-6 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Setting2 size={18} className="text-flame-500" variant="Bold" /> Quick Item Stock Toggles
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                <span className="font-semibold text-[var(--color-text-primary)]">Classic Cheeseburger</span>
                <span className="text-emerald-600 font-bold">IN STOCK</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                <span className="font-semibold text-[var(--color-text-primary)]">Hyderabadi Biryani</span>
                <span className="text-emerald-600 font-bold">IN STOCK</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                <span className="font-semibold text-[var(--color-text-primary)]">Steamed Momos</span>
                <span className="text-amber-600 font-bold">LOW STOCK</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
