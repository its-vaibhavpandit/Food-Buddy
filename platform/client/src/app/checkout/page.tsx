"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Location, Wallet3, Card, TickCircle, CloseCircle, ArrowRight } from "iconsax-react";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-order";
import { Button } from "@/components/ui/button";
import { Card as FlowCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { formatPrice } from "@/lib/utils";

// Local schema for validation matching the server requirement
const checkoutSchema = z.object({
  street: z.string().min(5, "Enter a complete street address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5,6}$/, "Enter a valid 5 or 6 digit ZIP/PIN code"),
  paymentMethod: z.enum(["cod", "online"]),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart(isAuthenticated);
  const createOrderMutation = useCreateOrder();

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Simulated Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<CheckoutFormData | null>(null);

  // Card details mock form
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "cod",
      notes: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Redirect guest users
  useEffect(() => {
    if (!cartLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, cartLoading, router]);

  // Handle GPS location fetching
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim Free Reverse Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const address = data.address;
            
            // Extract details
            const road = address.road || address.suburb || address.neighbourhood || "";
            const house = address.house_number ? `${address.house_number}, ` : "";
            const streetAddress = `${house}${road}`.trim();
            const city = address.city || address.town || address.village || address.county || "";
            const state = address.state || "";
            const postcode = address.postcode || "";

            setValue("street", streetAddress || "GPS Location");
            setValue("city", city);
            setValue("state", state);
            if (postcode) {
              setValue("zipCode", postcode.replace(/\s/g, ""));
            }
          } else {
            setGpsError("Failed to parse address from GPS coordinates.");
          }
        } catch {
          setGpsError("Failed to connect to location services.");
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        let msg = "Could not fetch GPS coordinates.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow access in browser settings.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePlaceOrderSubmit = async (data: CheckoutFormData) => {
    if (data.paymentMethod === "online") {
      // Open simulated payment gateway modal
      setPaymentFormData(data);
      setShowPaymentModal(true);
    } else {
      // Cash on Delivery
      try {
        const order = await createOrderMutation.mutateAsync({
          deliveryAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
          paymentMethod: "cod",
          notes: data.notes,
        });
        router.push(`/orders/${order._id}?status=created`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSimulatedPayment = async () => {
    if (!paymentFormData) return;
    setPaymentLoading(true);
    setPaymentSuccess(null);

    // Simulate payment authorization delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple mockup validation
    if (cardNumber.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setPaymentSuccess(false);
      setPaymentLoading(false);
      return;
    }

    setPaymentSuccess(true);
    setPaymentLoading(false);

    // Short delay to show the green checkmark before creating the order
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const order = await createOrderMutation.mutateAsync({
        deliveryAddress: {
          street: paymentFormData.street,
          city: paymentFormData.city,
          state: paymentFormData.state,
          zipCode: paymentFormData.zipCode,
        },
        paymentMethod: "online",
        notes: paymentFormData.notes,
      });
      setShowPaymentModal(false);
      router.push(`/orders/${order._id}?status=paid`);
    } catch (err) {
      console.error(err);
      setPaymentSuccess(false);
    }
  };

  // Math totals matching backend
  const subtotal = cart?.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0) || 0;
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 50000 || subtotal === 0 ? 0 : 4000; // in paise (₹40.00 / free above ₹500)
  const total = subtotal + tax + deliveryFee;

  if (cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50/20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-cream-50/30 min-h-screen pb-16">
        <PageHeader title="Checkout" description="Order details and delivery address details." />
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white border border-border/50 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-foreground">Your Cart is Empty</h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Please add some hot items to your cart before proceeding to checkout!
          </p>
          <Button className="mt-6 bg-flame-500 hover:bg-flame-600 text-white rounded-xl" asChild>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      <PageHeader
        title="Secure Checkout"
        description="Verify your delivery details and choose your preferred payment option."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <form onSubmit={handleSubmit(handlePlaceOrderSubmit)} className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Left Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                    1. Delivery Address
                  </h2>
                  <p className="text-xs text-muted-foreground">Specify where we should send your steaming hot meal.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGPSLocation}
                  disabled={gpsLoading}
                  className="rounded-xl border-flame-200 text-flame-600 hover:bg-flame-50 shrink-0 gap-2 text-xs font-semibold h-10 shadow-sm"
                >
                  <Location size={16} variant="Bold" className={gpsLoading ? "animate-bounce" : ""} />
                  {gpsLoading ? "Locating..." : "Locate Me via GPS"}
                </Button>
              </div>

              {gpsError && (
                <div className="bg-amber-50 text-amber-700 text-xs rounded-xl p-3 border border-amber-100 font-medium">
                  ⚠️ {gpsError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="street" className="text-xs font-semibold text-foreground">
                    Street Address / House Name
                  </label>
                  <Input
                    id="street"
                    placeholder="e.g. Flat 302, Agro Birds Residency, Road No 2"
                    className="h-11 border-border rounded-xl focus-visible:ring-flame-500"
                    {...register("street")}
                  />
                  {errors.street && <p className="text-[11px] text-destructive font-medium">{errors.street.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-semibold text-foreground">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="e.g. Ghazipur"
                    className="h-11 border-border rounded-xl focus-visible:ring-flame-500"
                    {...register("city")}
                  />
                  {errors.city && <p className="text-[11px] text-destructive font-medium">{errors.city.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-xs font-semibold text-foreground">
                    State
                  </label>
                  <Input
                    id="state"
                    placeholder="e.g. Uttar Pradesh"
                    className="h-11 border-border rounded-xl focus-visible:ring-flame-500"
                    {...register("state")}
                  />
                  {errors.state && <p className="text-[11px] text-destructive font-medium">{errors.state.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="zipCode" className="text-xs font-semibold text-foreground">
                    ZIP / PIN Code
                  </label>
                  <Input
                    id="zipCode"
                    placeholder="e.g. 233001"
                    className="h-11 border-border rounded-xl focus-visible:ring-flame-500"
                    {...register("zipCode")}
                  />
                  {errors.zipCode && <p className="text-[11px] text-destructive font-medium">{errors.zipCode.message}</p>}
                </div>
              </div>
            </FlowCard>

            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                  2. Payment Method
                </h2>
                <p className="text-xs text-muted-foreground">Select how you want to pay for your delicious order.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === "cod"
                      ? "border-flame-500 bg-flame-50/20 shadow-sm"
                      : "border-border hover:bg-cream-100/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "cod" ? "bg-flame-100 text-flame-600" : "bg-muted text-muted-foreground"}`}>
                      <Wallet3 size={20} variant="Bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-muted-foreground">Pay with cash at your doorstep.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    value="cod"
                    className="h-4 w-4 text-flame-500 focus:ring-flame-500 accent-flame-500 cursor-pointer"
                    {...register("paymentMethod")}
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    paymentMethod === "online"
                      ? "border-flame-500 bg-flame-50/20 shadow-sm"
                      : "border-border hover:bg-cream-100/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "online" ? "bg-flame-100 text-flame-600" : "bg-muted text-muted-foreground"}`}>
                      <Card size={20} variant="Bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Pay Online</p>
                      <p className="text-[11px] text-muted-foreground">Stripe/Razorpay simulated gateway.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    value="online"
                    className="h-4 w-4 text-flame-500 focus:ring-flame-500 accent-flame-500 cursor-pointer"
                    {...register("paymentMethod")}
                  />
                </label>
              </div>
            </FlowCard>

            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                  3. Cooking / Delivery Instructions
                </h2>
                <p className="text-xs text-muted-foreground">Optional notes for our chef or delivery driver.</p>
              </div>
              <textarea
                placeholder="e.g. Make it extra spicy, please ring bell once, leave at security gate..."
                rows={3}
                className="flex w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500"
                {...register("notes")}
              />
            </FlowCard>
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <FlowCard className="p-6 border-border/50 bg-white rounded-2xl shadow-sm space-y-5">
              <h2 className="text-base font-bold font-[family-name:var(--font-display)] text-foreground pb-3 border-b border-border/60">
                Order Items
              </h2>

              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3.5 divide-y divide-border/40 scrollbar-thin">
                {cart.items.map((item, index) => (
                  <div key={item._id} className={`flex items-center justify-between gap-3 ${index > 0 ? "pt-3.5" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.menuItem.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Qty: {item.quantity} • {formatPrice(item.menuItem.price)} each
                      </p>
                    </div>
                    <span className="text-xs font-bold text-foreground shrink-0">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>

                <Separator className="my-2 bg-border/60" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-black text-flame-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-semibold gap-1.5 shadow-md shadow-flame-500/10 transition-all"
              >
                {createOrderMutation.isPending ? (
                  "Processing Order..."
                ) : (
                  <>
                    Confirm & Place Order
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </FlowCard>
          </div>
        </form>
      </div>

      {/* Simulated Premium Payment Gateway Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border border-border/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#111827] to-[#1f2937] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-flame-500 text-white font-bold text-sm">
                    F
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">Fast Food Buddy Checkout</h3>
                    <p className="text-[10px] text-gray-400">Secure Bank Sandbox Payment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-white rounded-full p-1"
                >
                  <CloseCircle size={20} variant="Bold" />
                </button>
              </div>

              {/* Status or Details Body */}
              <div className="p-6 space-y-6">
                {paymentSuccess === null ? (
                  <>
                    {/* Amount Info */}
                    <div className="bg-cream-50/50 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          PAYMENT AMOUNT
                        </span>
                        <p className="text-xl font-black text-foreground mt-0.5">{formatPrice(total)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full">
                          TEST MODE
                        </span>
                      </div>
                    </div>

                    {/* Card inputs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-foreground">Enter Card Details</h4>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Card Number</label>
                        <div className="relative">
                          <Card size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="4111 1111 1111 1111 (Demo Card)"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiry Date</label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                            className="h-11 border-border rounded-xl focus-visible:ring-flame-500 text-center"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">CVV</label>
                          <Input
                            type="password"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={3}
                            className="h-11 border-border rounded-xl focus-visible:ring-flame-500 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSimulatedPayment}
                      disabled={paymentLoading}
                      className="w-full bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl h-12 text-xs font-bold gap-2 mt-4"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Authorizing Card...
                        </>
                      ) : (
                        `Pay Securely ${formatPrice(total)}`
                      )}
                    </Button>
                  </>
                ) : paymentSuccess === true ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
                    >
                      <TickCircle size={40} variant="Bold" />
                    </motion.div>
                    <div>
                      <h4 className="text-base font-extrabold text-foreground">Payment Successful</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your transaction was authorized. Redirecting to place your order...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                      <CloseCircle size={40} variant="Bold" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-foreground">Payment Failed</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        The bank rejected the transaction. Please enter valid demo credentials:<br />
                        <span className="font-semibold text-foreground">Card Number: 16 digits, Expiry: 5 chars, CVV: 3 digits.</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => setPaymentSuccess(null)}
                      className="w-28 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl h-10 text-xs font-bold"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
