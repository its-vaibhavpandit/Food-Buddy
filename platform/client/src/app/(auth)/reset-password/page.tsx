"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Lock, TickCircle, ArrowLeft } from "iconsax-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const resetSchema = z.object({
  token: z.string().min(6, "Enter valid 6-digit reset code"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setValue("token", code);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", {
        token: data.token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid or expired reset token.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/80 shadow-xl rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 bg-flame-100 text-flame-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <Lock size={24} variant="Bold" />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
          Reset Your Password
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Enter your reset code and set your new password below.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {isSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <TickCircle size={32} variant="Bold" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">Password Reset Successfully!</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Redirecting to login page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="token" className="text-xs font-semibold text-[var(--color-text-primary)]">
              Reset Code
            </label>
            <Input
              id="token"
              placeholder="e.g. 481920"
              className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500 text-xs font-mono tracking-widest text-center"
              {...register("token")}
            />
            {errors.token && <p className="text-[11px] text-destructive font-medium">{errors.token.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-xs font-semibold text-[var(--color-text-primary)]">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimum 6 characters"
              className="h-11 border-[var(--color-border-val)] rounded-xl focus-visible:ring-flame-500 text-xs"
              {...register("newPassword")}
            />
            {errors.newPassword && <p className="text-[11px] text-destructive font-medium">{errors.newPassword.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-bold shadow-md shadow-flame-500/20"
          >
            {isLoading ? "Updating Password..." : "Reset Password"}
          </Button>
        </form>
      )}

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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-[var(--color-bg)]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <div className="p-8 bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/80 rounded-3xl shadow-xl text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500 mx-auto" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
