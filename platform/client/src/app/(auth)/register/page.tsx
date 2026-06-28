"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Sms, User, Call } from "iconsax-react";
import axios from "axios";
import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const { register: signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Registration failed. Please check your details."
        );
      } else {
        setError("Registration failed. Please check your details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-cream-50/40">
      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-flame-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-12 h-80 w-80 rounded-full bg-sage-100/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <Card className="p-8 border-border/60 bg-white shadow-xl shadow-flame-500/5 rounded-2xl">
          <div className="text-center mb-8">
            <Badge className="bg-flame-50 text-flame-600 hover:bg-flame-50 border-flame-100 px-3 py-1 mb-3">
              ✨ Create Account
            </Badge>
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
              Join Fast Food Buddy
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create an account to start ordering delicious bites.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 mb-6 border border-destructive/20 text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500 focus-visible:border-flame-500"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Sms
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500 focus-visible:border-flame-500"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Call
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500 focus-visible:border-flame-500"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500 focus-visible:border-flame-500"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500 focus-visible:border-flame-500"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-flame-500 hover:bg-flame-600 text-white rounded-xl shadow-lg shadow-flame-500/10 font-semibold mt-4"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-flame-500 hover:text-flame-600 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
