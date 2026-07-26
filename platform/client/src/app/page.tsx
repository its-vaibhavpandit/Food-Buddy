"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Timer, ChefHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenuItems } from "@/hooks/use-menu";
import { MenuCard } from "@/components/menu/menu-card";
import { fadeUp, staggerContainer } from "@/lib/motion";


/* ─── Seed data (replaced by API in Phase 4) ──────────────── */

const POPULAR_ITEMS = [
  {
    id: "1",
    name: "Classic Cheeseburger",
    description: "Juicy patty with melted cheese, lettuce, and house sauce",
    price: 9900,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    category: "Burgers",
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Hand-tossed crust with mozzarella, basil, and tomato sauce",
    price: 25000,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    category: "Pizza",
  },
  {
    id: "3",
    name: "Hyderabadi Biryani",
    description: "Fragrant basmati rice layered with aromatic spices",
    price: 24900,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    category: "North Indian",
  },
  {
    id: "4",
    name: "Crispy Samosa",
    description: "Golden-fried pastry stuffed with spiced potato filling",
    price: 1500,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    category: "Street Food",
  },
  {
    id: "5",
    name: "Chilli Potato",
    description: "Crispy potato strips tossed in tangy chilli-garlic sauce",
    price: 8900,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    category: "Street Food",
  },
  {
    id: "6",
    name: "Steamed Momos",
    description: "Soft dumplings filled with fresh veggies, served with chutney",
    price: 4900,
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    category: "Chinese",
  },
] as const;

// Map static list to MenuItem look-alike if fallback is needed
const FALLBACK_ITEMS = POPULAR_ITEMS.map((item) => ({
  _id: item.id,
  name: item.name,
  slug: item.name.toLowerCase().replace(/ /g, "-"),
  description: item.description,
  price: item.price,
  image: item.image,
  isVeg: item.isVeg,
  isAvailable: true,
  tags: [item.category.toLowerCase()],
  category: {
    _id: item.id,
    name: item.category,
    slug: item.category.toLowerCase(),
    sortOrder: 1,
    isActive: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const CATEGORIES = [
  { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80", slug: "chinese" },
  { name: "North Indian", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80", slug: "north-indian" },
  { name: "Street Food", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80", slug: "street-food" },
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", slug: "burgers" },
  { name: "Drinks", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80", slug: "drinks" },
  { name: "Rolls", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80", slug: "rolls" },
] as const;

const VALUE_PROPS = [
  {
    icon: Timer,
    title: "30-Minute Delivery",
    description: "Piping hot food at your door — fast, every single time.",
  },
  {
    icon: ChefHat,
    title: "Chef-Crafted Quality",
    description:
      "Fresh ingredients, house-made sauces, and recipes perfected over years.",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "No hidden fees on orders above ₹299. What you see is what you pay.",
  },
] as const;

/* ─── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  const { data: menuItems, isLoading: itemsLoading } = useMenuItems();
  const [activeCity, setActiveCity] = useState("Varanasi");

  useEffect(() => {
    const syncCity = () => {
      setActiveCity(localStorage.getItem("selectedCity") || "Varanasi");
    };
    syncCity();
    window.addEventListener("location-changed", syncCity);
    return () => window.removeEventListener("location-changed", syncCity);
  }, []);

  const popularItems = useMemo(() => {
    return menuItems && menuItems.length > 0 ? menuItems.slice(0, 6) : FALLBACK_ITEMS;
  }, [menuItems]);

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-flame-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-sage-200/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 pb-16 pt-20 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:pb-24 lg:pt-28">
          {/* Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div custom={0} variants={fadeUp}>
              <Badge className="mb-4 bg-flame-100/80 text-flame-700 hover:bg-flame-100 border-flame-200/60 font-medium px-3 py-1">
                🔥 Now serving in 7 cities
              </Badge>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl font-[family-name:var(--font-display)]"
            >
              Crave it.{" "}
              <span className="text-flame-500">Order it.</span>
              <br />
              Love every bite.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-5 max-w-lg text-base text-[var(--color-text-secondary)] sm:text-lg mx-auto lg:mx-0"
            >
              From crispy samosas to loaded burgers — your favorite street food
              and fast bites, delivered fresh and fast to your doorstep.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-flame-500 hover:bg-flame-600 text-white text-base px-8 h-12 rounded-xl shadow-lg shadow-flame-500/20"
                asChild
              >
                <Link href="/menu">
                  Explore Menu
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl text-base"
                asChild
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              custom={4}
              variants={fadeUp}
              className="mt-8 flex items-center justify-center gap-6 text-sm text-[var(--color-text-secondary)] lg:justify-start"
            >
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="font-medium">4.8 Rating</span>
              </div>
              <div className="h-4 w-px bg-[var(--color-border-val)]" />
              <span>2,500+ Orders</span>
              <div className="h-4 w-px bg-[var(--color-border-val)]" />
              <span>30 min avg.</span>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative flex-1 max-w-lg w-full lg:max-w-xl"
          >
            <div className="relative aspect-square w-full">
              {/* Glow behind image */}
              <div className="absolute inset-4 rounded-full bg-flame-400/15 blur-3xl" />
              <div className="relative z-10 w-full h-full overflow-hidden rounded-[15px] border border-[var(--color-border-val)] bg-[var(--color-glass)] backdrop-blur-md shadow-[var(--shadow-level-3)] group">
                <Image
                  src="/images/chef-burger.png"
                  alt="Delicious burger with fresh ingredients"
                  fill
                  priority
                  className="object-cover drop-shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-sm font-medium uppercase tracking-widest text-flame-500"
            >
              What are you craving?
            </motion.p>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="mt-2 text-3xl font-bold tracking-tight font-[family-name:var(--font-display)] text-[var(--color-text-primary)] sm:text-4xl"
            >
              Browse by Category
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} custom={i} variants={fadeUp}>
                <Link
                  href={`/menu?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-[var(--color-surface)] transition-all group-hover:shadow-[var(--shadow-hover)] group-hover:scale-105 sm:h-24 sm:w-24">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      sizes="96px"
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-primary)] sm:text-sm">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Popular Items ─────────────────────────────────── */}
      <section className="bg-[var(--color-surface-elevated)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="flex items-end justify-between"
          >
            <div>
              <motion.p
                custom={0}
                variants={fadeUp}
                className="text-sm font-medium uppercase tracking-widest text-flame-500"
              >
                Customer favorites
              </motion.p>
              <motion.h2
                custom={1}
                variants={fadeUp}
                className="mt-2 text-3xl font-bold tracking-tight font-[family-name:var(--font-display)] text-[var(--color-text-primary)] sm:text-4xl"
              >
                Popular Right Now
              </motion.h2>
            </div>
            <motion.div custom={2} variants={fadeUp}>
              <Button
                variant="outline"
                className="hidden sm:flex"
                asChild
              >
                <Link href="/menu">
                  View All
                  <ArrowRight size={16} className="ml-1.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {itemsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-[var(--color-border-val)]/50 rounded-2xl p-4 bg-[var(--color-card-bg)] space-y-4 animate-pulse">
                  <div className="h-44 w-full bg-[var(--color-skeleton)] rounded-xl" />
                  <div className="h-6 w-3/4 bg-[var(--color-skeleton)] rounded" />
                  <div className="h-4 w-full bg-[var(--color-skeleton)] rounded" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-1/4 bg-[var(--color-skeleton)] rounded" />
                    <div className="h-9 w-1/3 bg-[var(--color-skeleton)] rounded-xl" />
                  </div>
                </div>
              ))
            ) : (
              popularItems.map((item, i) => (
                <motion.div key={item._id} custom={i} variants={fadeUp}>
                  <MenuCard item={item} selectedCity={activeCity} />
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Mobile CTA */}
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/menu">
                View Full Menu
                <ArrowRight size={16} className="ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Value Propositions ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--color-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid gap-8 sm:grid-cols-3"
          >
            {VALUE_PROPS.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <motion.div
                  key={prop.title}
                  custom={i}
                  variants={fadeUp}
                  className="group text-center flex flex-col items-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-flame-50/60 border border-flame-100/40 shadow-[var(--shadow-level-1)] transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-7 w-7 text-flame-500" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {prop.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
                    {prop.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="bg-[var(--color-surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-flame-500 to-flame-700 p-8 sm:p-12 lg:p-16"
          >
            {/* Decorative */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-card-bg)]/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left lg:justify-between">
              <div>
                <motion.h2
                  custom={0}
                  variants={fadeUp}
                  className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl font-[family-name:var(--font-display)]"
                >
                  Hungry? Your food is just
                  <br className="hidden sm:block" /> a few taps away.
                </motion.h2>
                <motion.p
                  custom={1}
                  variants={fadeUp}
                  className="mt-3 text-base text-white/80 max-w-md mx-auto lg:mx-0"
                >
                  Browse our full menu, customize your order, and get it
                  delivered in 30 minutes or less.
                </motion.p>
              </div>
              <motion.div custom={2} variants={fadeUp} className="shrink-0">
                <Button
                  size="lg"
                  className="bg-[var(--color-card-bg)] text-flame-600 hover:bg-[var(--color-card-bg)]/90 h-12 px-8 rounded-xl text-base font-semibold shadow-lg"
                  asChild
                >
                  <Link href="/menu">
                    Order Now
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
