"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
      open: () => void;
    };
  }
}

interface CreateRazorpayOrderPayload {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function useRazorpay() {
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openRazorpayCheckout = useCallback(
    async (
      payload: CreateRazorpayOrderPayload,
      user: { name: string; email: string; phone?: string },
      onSuccess: (orderId: string) => void,
      onError: (errorMsg: string) => void
    ) => {
      try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          onError("Razorpay SDK failed to load. Please check your network connection.");
          return;
        }

        // 1. Create Razorpay order on server
        const { data } = await api.post("/payment/create-order", payload);
        const { orderId, razorpayOrderId, amount, currency, keyId } = data.data;

        // 2. Configure Razorpay options
        const options = {
          key: keyId || "rzp_test_fastfoodbuddy2026",
          amount,
          currency: currency || "INR",
          name: "Fast Food Buddy",
          description: "Food Delivery Order Payment",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop&q=80",
          order_id: razorpayOrderId,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || "",
          },
          theme: {
            color: "#FF6B35",
          },
          handler: async (response: RazorpayResponse) => {
            try {
              // 3. Verify HMAC signature on backend
              await api.post("/payment/verify-signature", {
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              onSuccess(orderId);
            } catch (err: unknown) {
              const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Payment signature verification failed.";
              onError(msg);
            }
          },
          modal: {
            ondismiss: async () => {
              try {
                await api.post("/payment/failure", {
                  orderId,
                  razorpayOrderId,
                  errorDetails: { description: "Payment window closed by user" },
                });
              } catch {
                /* ignore */
              }
              onError("Payment was cancelled.");
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", async (response: { error?: { description?: string } }) => {
          try {
            await api.post("/payment/failure", {
              orderId,
              razorpayOrderId,
              errorDetails: response.error,
            });
          } catch {
            /* ignore */
          }
          onError(response?.error?.description || "Payment failed at bank gateway.");
        });

        razorpayInstance.open();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to initiate payment. Please try again.";
        onError(msg);
      }
    },
    [loadRazorpayScript]
  );

  return { openRazorpayCheckout };
}
