"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TickCircle, CloseCircle, Copy, Timer1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { renderQRToCanvas, generateUPILink } from "@/lib/qr-generator";

interface UpiPaymentProps {
  amount: number;
  upiId: string;
  merchantName: string;
  onPaymentConfirm: (transactionId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UpiPayment({
  amount,
  upiId,
  merchantName,
  onPaymentConfirm,
  onCancel,
  isLoading = false,
}: UpiPaymentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transactionId, setTransactionId] = useState("");
  const [step, setStep] = useState<"scan" | "confirm" | "success" | "error">("scan");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const amountInRupees = amount / 100;

  useEffect(() => {
    if (canvasRef.current) {
      const upiLink = generateUPILink({
        pa: upiId,
        pn: merchantName,
        am: amountInRupees,
        tn: `Fast Food Buddy Order Payment`,
      });

      renderQRToCanvas(canvasRef.current, upiLink, {
        size: 280,
        darkColor: "#1a1a1a",
        lightColor: "#ffffff",
        margin: 3,
      });
    }
  }, [upiId, merchantName, amountInRupees]);

  useEffect(() => {
    if (step !== "scan" && step !== "confirm") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep("error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleConfirmPayment = () => {
    if (transactionId.trim().length < 6) return;
    setStep("success");
    setTimeout(() => {
      onPaymentConfirm(transactionId.trim());
    }, 1500);
  };

  return (
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
              <h3 className="font-extrabold text-sm tracking-tight">UPI Payment</h3>
              <p className="text-[10px] text-gray-400">Secure • Instant • Free</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-bold">
              <Timer1 size={10} className="mr-1" />
              {formatTime(timeLeft)}
            </Badge>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white rounded-full p-1"
            >
              <CloseCircle size={20} variant="Bold" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {step === "scan" && (
            <>
              {/* Amount */}
              <div className="bg-cream-50/50 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    PAY AMOUNT
                  </span>
                  <p className="text-xl font-black text-foreground mt-0.5">
                    {formatPrice(amount)}
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">
                  UPI
                </Badge>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <Card className="p-4 bg-white border-2 border-flame-100 rounded-2xl shadow-lg shadow-flame-500/5">
                  <canvas ref={canvasRef} className="w-[280px] h-[280px]" />
                </Card>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                  Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
              </div>

              {/* UPI ID */}
              <div className="flex items-center gap-2 bg-cream-50/50 p-3 rounded-xl border border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    UPI ID
                  </p>
                  <p className="text-sm font-bold text-foreground truncate">{upiId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUPI}
                  className="rounded-xl border-flame-200 text-flame-600 hover:bg-flame-50 text-[10px] font-bold h-8 gap-1"
                >
                  <Copy size={12} />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground">How to Pay:</h4>
                <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal pl-4">
                  <li>Open any UPI app on your phone</li>
                  <li>Scan the QR code above or enter the UPI ID manually</li>
                  <li>Complete the payment of <strong className="text-foreground">{formatPrice(amount)}</strong></li>
                  <li>Copy the UPI Transaction / Reference ID</li>
                </ol>
              </div>

              <Button
                onClick={() => setStep("confirm")}
                className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-bold"
              >
                I have Paid — Enter Transaction ID
              </Button>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="text-center space-y-2">
                <h4 className="text-base font-bold text-foreground">Confirm Your Payment</h4>
                <p className="text-xs text-muted-foreground">
                  Enter the UPI Transaction ID / Reference Number from your payment app.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  UPI Transaction / Reference ID
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 426851234567 or UPI ref number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-12 border-border rounded-xl focus-visible:ring-flame-500 text-center text-sm font-bold tracking-wider"
                  autoFocus
                />
                {transactionId.length > 0 && transactionId.length < 6 && (
                  <p className="text-[10px] text-destructive font-medium">
                    Transaction ID must be at least 6 characters
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("scan")}
                  className="rounded-xl h-11 text-xs font-bold"
                >
                  Back to QR
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={transactionId.trim().length < 6 || isLoading}
                  className="bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl h-11 text-xs font-bold"
                >
                  {isLoading ? "Verifying..." : "Confirm Payment"}
                </Button>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"
              >
                <TickCircle size={40} variant="Bold" />
              </motion.div>
              <div>
                <h4 className="text-base font-extrabold text-foreground">Payment Confirmed!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Transaction ID: <strong>{transactionId}</strong>
                  <br />
                  Placing your order...
                </p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <CloseCircle size={40} variant="Bold" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-foreground">Payment Timed Out</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  The payment window has expired. Please try again.
                </p>
              </div>
              <Button
                onClick={() => {
                  setStep("scan");
                  setTimeLeft(300);
                }}
                className="bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl h-10 text-xs font-bold"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
