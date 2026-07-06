"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SearchNormal1, FilterSearch, ArrowRight } from "iconsax-react";
import { useMenuItems, useCategories } from "@/hooks/use-menu";
import { MenuCard } from "@/components/menu/menu-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [category, setCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [activeCity, setActiveCity] = useState("Varanasi");
  
  useEffect(() => {
    setActiveCity(localStorage.getItem("selectedCity") || "Varanasi");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: menuItems, isLoading: itemsLoading } = useMenuItems({
    category: category || undefined,
    search: debouncedSearch || undefined,
  });

  const handleCategorySelect = (slug: string) => {
    setCategory(category === slug ? "" : slug);
  };

  // Client-side sorting and veg filtering
  const filteredAndSortedItems = menuItems
    ? menuItems
        .filter((item) => !vegOnly || item.isVeg)
        .sort((a, b) => {
          if (sortBy === "price_asc") return a.price - b.price;
          if (sortBy === "price_desc") return b.price - a.price;
          if (sortBy === "name") return a.name.localeCompare(b.name);
          return 0; // Default
        })
    : [];

  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      <PageHeader title="Our Delicious Menu" description="Order your favorite street food and trace your orders." />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* Category horizontal scrolling bar */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Select Category
          </h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
            <Button
              variant={category === "" ? "default" : "outline"}
              onClick={() => setCategory("")}
              className={`rounded-xl h-10 px-5 shrink-0 ${
                category === "" ? "bg-flame-500 hover:bg-flame-600 text-white border-0" : "border-border text-foreground hover:bg-cream-100/60"
              }`}
            >
              All Items
            </Button>
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-xl shrink-0" />
                ))
              : categories?.map((cat) => (
                  <Button
                    key={cat.slug}
                    variant={category === cat.slug ? "default" : "outline"}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`rounded-xl h-10 px-5 shrink-0 transition-all ${
                      category === cat.slug
                        ? "bg-flame-500 hover:bg-flame-600 text-white border-0 shadow-md shadow-flame-500/10"
                        : "border-border text-foreground hover:bg-cream-100/60"
                    }`}
                  >
                    {cat.name}
                  </Button>
                ))}
          </div>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-border/60 shadow-sm mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchNormal1
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search dishes, snacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 border-border rounded-xl focus-visible:ring-flame-500"
            />
          </div>

          {/* Filtering options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Veg Only Toggle Button */}
            <Button
              variant={vegOnly ? "default" : "outline"}
              onClick={() => setVegOnly(!vegOnly)}
              className={`h-11 rounded-xl px-4 text-xs font-semibold ${
                vegOnly
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  : "border-border text-foreground hover:bg-cream-100/60"
              }`}
            >
              <div
                className={`w-3 h-3 border rounded-[3px] flex items-center justify-center mr-2 ${
                  vegOnly ? "bg-white border-emerald-700" : "bg-transparent border-muted-foreground"
                }`}
              >
                {vegOnly && <div className="w-1.5 h-1.5 bg-emerald-600 rounded-sm" />}
              </div>
              Veg Only
            </Button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 border border-border rounded-xl px-4 pr-8 text-xs font-semibold bg-white text-foreground cursor-pointer focus:outline-none appearance-none hover:bg-cream-100/60"
                aria-label="Sort dishes"
              >
                <option value="default">Default Sorting</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <FilterSearch
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Famous Food City recommendation display banner */}
        {activeCity && (
          <div className="bg-flame-50/50 border border-flame-100/60 text-flame-700 rounded-2xl px-5 py-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-flame-500 text-white rounded-xl p-2 font-bold text-sm">
                ⭐
              </div>
              <div>
                <p className="text-sm font-bold">Special delicacies highlighted for {activeCity}!</p>
                <p className="text-xs text-flame-600">Try these local favorites highly rated by people in your area.</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-flame-500 animate-pulse hidden sm:block" />
          </div>
        )}

        {/* Menu items display grid */}
        {itemsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border/50 rounded-2xl p-4 bg-white space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/4 rounded" />
                  <Skeleton className="h-9 w-1/3 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedItems.length > 0 ? (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredAndSortedItems.map((item) => (
              <motion.div 
                key={item._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <MenuCard
                  item={item}
                  selectedCity={activeCity}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title="No items found"
            description="We couldn't find any dishes matching your parameters. Try a different category or search term."
            actionLabel="View all items"
            onAction={() => {
              setCategory("");
              setSearch("");
              setVegOnly(false);
              setSortBy("default");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-cream-50/20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-flame-200 border-t-flame-500" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
