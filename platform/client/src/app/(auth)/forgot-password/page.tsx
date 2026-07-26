"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Sms, Lock1 } from "iconsax-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.post("/auth/forgot-password", { email: data.email });
      setMessage(res.data.message || "Reset token generated successfully.");
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to process forgot password request.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-[var(--color-bg)]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/80 shadow-xl rounded-3xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-flame-100 text-flame-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock1 size={24} variant="Bold" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              Forgot Password?
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
              Enter your registered email address below to receive a secure 6-digit password reset code.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
              <p className="font-semibold text-center">{message}</p>
              {resetToken && (
                <div className="bg-[var(--color-card-bg)] p-3 rounded-xl border border-emerald-300 text-center font-mono text-base font-bold text-emerald-900 tracking-wider">
                  Reset Code: {resetToken}
                </div>
              )}
              <div className="pt-2 text-center">
                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold" asChild>
                  <Link href={`/reset-password?code=${resetToken || ""}`}>Proceed to Reset Password →</Link>
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[var(--color-text-primary)]">
                Email Address
              </label>
              <div className="relative">
                <Sms size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-11 h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500 text-xs"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-bold shadow-md shadow-flame-500/20"
            >
              {isLoading ? "Sending Code..." : "Send Password Reset Code"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
