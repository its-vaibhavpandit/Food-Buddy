"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, SearchNormal1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { scaleIn } from "@/lib/motion";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 bg-[var(--color-bg)]">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="max-w-md text-center space-y-6"
      >
        <div className="relative mx-auto h-32 w-32 flex items-center justify-center rounded-full bg-flame-100/50 border border-flame-200/60">
          <span className="text-6xl">🍔</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
            404 — Page Not Found
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Oops! It seems like this dish isn&apos;t on our menu or the link has moved. Let&apos;s get you back to hot, delicious food!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl h-11 text-xs font-bold gap-2" asChild>
            <Link href="/">
              <Home size={16} variant="Bold" /> Return Home
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl h-11 text-xs font-bold gap-2" asChild>
            <Link href="/menu">
              <SearchNormal1 size={16} /> Explore Menu
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
