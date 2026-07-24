"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet3, Card, TickCircle, ArrowRight, ShieldSecurity } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-order";
import { useRazorpay } from "@/hooks/use-razorpay";
import { Button } from "@/components/ui/button";
import { Card as FlowCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { formatPrice } from "@/lib/utils";
import { LocationPicker } from "@/components/checkout/location-picker";
import { UpiPayment } from "@/components/checkout/upi-payment";

const checkoutSchema = z.object({
  street: z.string().min(2, "Enter a complete street address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
  paymentMethod: z.enum(["cod", "online", "upi"]),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart(isAuthenticated);
  const createOrderMutation = useCreateOrder();
  const { openRazorpayCheckout } = useRazorpay();

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CheckoutFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: "Main Station Road, Near Central Plaza",
      city: "Ghazipur",
      state: "Uttar Pradesh",
      zipCode: "233001",
      paymentMethod: "online",
      notes: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (!cartLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, cartLoading, router]);

  const handleLocationPicked = (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    const finalStreet = address.street === "Picked Location" || !address.street || address.street.length < 3
      ? "Main Station Road, Near Central Plaza"
      : address.street;
    const finalCity = address.city === "Selected Area" || !address.city ? "Ghazipur" : address.city;
    const finalState = address.state || "Uttar Pradesh";
    const finalZip = address.zipCode || "233001";

    setValue("street", finalStreet, { shouldValidate: true });
    setValue("city", finalCity, { shouldValidate: true });
    setValue("state", finalState, { shouldValidate: true });
    setValue("zipCode", finalZip, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: CheckoutFormData) => {
    setPaymentError(null);
    setIsProcessing(true);

    const deliveryAddress = {
      street: data.street,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    };

    if (data.paymentMethod === "online") {
      // Initiate Razorpay Online Checkout Flow
      openRazorpayCheckout(
        { deliveryAddress, notes: data.notes },
        { name: user?.name || "Customer", email: user?.email || "", phone: user?.phone },
        (orderId) => {
          setIsProcessing(false);
          router.push(`/orders/${orderId}?status=paid&method=razorpay`);
        },
        (errorMsg) => {
          setIsProcessing(false);
          setPaymentError(errorMsg);
        }
      );
    } else if (data.paymentMethod === "upi") {
      setPendingFormData(data);
      setShowUpiModal(true);
      setIsProcessing(false);
    } else {
      // Cash on Delivery
      try {
        const order = await createOrderMutation.mutateAsync({
          deliveryAddress,
          paymentMethod: "cod",
          notes: data.notes,
        });
        setIsProcessing(false);
        router.push(`/orders/${order._id}?status=created`);
      } catch (err: unknown) {
        setIsProcessing(false);
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to place COD order.";
        setPaymentError(errorMsg);
      }
    }
  };

  const handleUpiConfirm = async (transactionId: string) => {
    if (!pendingFormData) return;
    setIsProcessing(true);
    try {
      const order = await createOrderMutation.mutateAsync({
        deliveryAddress: {
          street: pendingFormData.street,
          city: pendingFormData.city,
          state: pendingFormData.state,
          zipCode: pendingFormData.zipCode,
        },
        paymentMethod: "upi",
        upiTransactionId: transactionId,
        notes: pendingFormData.notes,
      });
      setShowUpiModal(false);
      setIsProcessing(false);
      router.push(`/orders/${order._id}?status=paid&method=upi`);
    } catch (err: unknown) {
      setIsProcessing(false);
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to confirm UPI order.";
      setPaymentError(errorMsg);
    }
  };

  const subtotal = cart?.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0) || 0;
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 50000 || subtotal === 0 ? 0 : 4000;
  const total = subtotal + tax + deliveryFee;

  if (cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[var(--color-bg)] min-h-screen pb-16">
        <PageHeader title="Checkout" description="Order details and delivery address details." />
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/50 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Your Cart is Empty</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            Please add items to your cart before proceeding to checkout!
          </p>
          <Button className="mt-6 bg-flame-500 hover:bg-flame-600 text-white rounded-xl" asChild>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Secure Checkout"
        description="Verify delivery address and select verified payment gateway."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center justify-between"
          >
            <span>⚠️ {paymentError}</span>
            <button onClick={() => setPaymentError(null)} className="text-red-500 hover:text-red-800 font-bold">
              ✕
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <LocationPicker onLocationSelect={handleLocationPicked} />

            <FlowCard className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-6">
              <div className="pb-4 border-b border-[var(--color-border-val)]/60">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  1. Delivery Address
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Adjust address fields manually if needed.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="street" className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Street Address / Flat / Building
                  </label>
                  <Input
                    id="street"
                    placeholder="e.g. Flat 302, Agro Birds Residency, Road No 2"
                    className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500"
                    {...register("street")}
                  />
                  {errors.street && <p className="text-[11px] text-destructive font-medium">{errors.street.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-semibold text-[var(--color-text-primary)]">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="e.g. Varanasi"
                    className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500"
                    {...register("city")}
                  />
                  {errors.city && <p className="text-[11px] text-destructive font-medium">{errors.city.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-xs font-semibold text-[var(--color-text-primary)]">
                    State
                  </label>
                  <Input
                    id="state"
                    placeholder="e.g. Uttar Pradesh"
                    className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500"
                    {...register("state")}
                  />
                  {errors.state && <p className="text-[11px] text-destructive font-medium">{errors.state.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="zipCode" className="text-xs font-semibold text-[var(--color-text-primary)]">
                    ZIP / PIN Code
                  </label>
                  <Input
                    id="zipCode"
                    placeholder="e.g. 221001"
                    className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500"
                    {...register("zipCode")}
                  />
                  {errors.zipCode && <p className="text-[11px] text-destructive font-medium">{errors.zipCode.message}</p>}
                </div>
              </div>
            </FlowCard>

            <FlowCard className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                    2. Payment Gateway
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Select how you want to pay securely.</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                  <ShieldSecurity size={14} variant="Bold" /> 256-bit SSL Encrypted
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === "online"
                      ? "border-flame-500 bg-flame-50/20 shadow-sm"
                      : "border-[var(--color-border-val)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "online" ? "bg-flame-100 text-flame-600" : "bg-muted text-[var(--color-text-secondary)]"}`}>
                      <Card size={20} variant="Bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">Razorpay</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Card / UPI / NetBanking</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    value="online"
                    className="h-4 w-4 text-flame-500 focus:ring-flame-500 accent-flame-500 cursor-pointer"
                    {...register("paymentMethod")}
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === "upi"
                      ? "border-flame-500 bg-flame-50/20 shadow-sm"
                      : "border-[var(--color-border-val)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "upi" ? "bg-flame-100 text-flame-600" : "bg-muted text-[var(--color-text-secondary)]"}`}>
                      <TickCircle size={20} variant="Bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">Direct UPI QR</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Scan & Pay Instant</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    value="upi"
                    className="h-4 w-4 text-flame-500 focus:ring-flame-500 accent-flame-500 cursor-pointer"
                    {...register("paymentMethod")}
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === "cod"
                      ? "border-flame-500 bg-flame-50/20 shadow-sm"
                      : "border-[var(--color-border-val)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "cod" ? "bg-flame-100 text-flame-600" : "bg-muted text-[var(--color-text-secondary)]"}`}>
                      <Wallet3 size={20} variant="Bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">COD</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Cash on delivery</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    value="cod"
                    className="h-4 w-4 text-flame-500 focus:ring-flame-500 accent-flame-500 cursor-pointer"
                    {...register("paymentMethod")}
                  />
                </label>
              </div>
            </FlowCard>

            <FlowCard className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                  3. Cooking & Delivery Notes
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Optional instructions for restaurant chef or delivery rider.</p>
              </div>
              <textarea
                placeholder="e.g. Make it extra spicy, please ring bell once, leave at security gate..."
                rows={3}
                className="flex w-full rounded-2xl border border-[var(--color-border-val)] bg-transparent px-4 py-3 text-xs shadow-sm placeholder:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500"
                {...register("notes")}
              />
            </FlowCard>
          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <FlowCard className="p-6 border-[var(--color-border-val)]/50 bg-[var(--color-card-bg)] rounded-2xl shadow-sm space-y-5">
              <h2 className="text-base font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)] pb-3 border-b border-[var(--color-border-val)]/60">
                Order Summary
              </h2>

              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3.5 divide-y divide-border/40 scrollbar-thin">
                {cart.items.map((item, index) => (
                  <div key={item._id} className={`flex items-center justify-between gap-3 ${index > 0 ? "pt-3.5" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{item.menuItem.name}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                        Qty: {item.quantity} • {formatPrice(item.menuItem.price)} each
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-primary)] shrink-0">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>

                <Separator className="my-2 bg-border/60" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">Grand Total</span>
                  <span className="text-lg font-black text-flame-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || createOrderMutation.isPending}
                className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-12 text-xs font-bold gap-1.5 shadow-md shadow-flame-500/20 transition-all cursor-pointer"
              >
                {isProcessing || createOrderMutation.isPending ? (
                  "Processing Secure Payment..."
                ) : (
                  <>
                    Proceed to Pay {formatPrice(total)}
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </FlowCard>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showUpiModal && (
          <UpiPayment
            amount={total}
            upiId="7991627968@mbk"
            merchantName="Fast Food Buddy"
            onPaymentConfirm={handleUpiConfirm}
            onCancel={() => setShowUpiModal(false)}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
