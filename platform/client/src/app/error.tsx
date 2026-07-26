"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Refresh2, Home } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { scaleIn } from "@/lib/motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 bg-[var(--color-bg)]">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="max-w-md text-center space-y-6"
      >
        <div className="relative mx-auto h-28 w-28 flex items-center justify-center rounded-full bg-red-100/60 border border-red-200">
          <span className="text-5xl">⚠️</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
            500 — Server Error
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Something unexpected went wrong while fetching your request. Our engineering team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-bold gap-2"
          >
            <Refresh2 size={16} /> Try Again
          </Button>
          <Button variant="outline" className="rounded-xl h-11 text-xs font-bold gap-2" asChild>
            <Link href="/">
              <Home size={16} /> Return to Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
