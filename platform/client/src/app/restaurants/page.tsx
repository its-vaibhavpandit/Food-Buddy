"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Timer, MapPin, ArrowRight, Search, Building } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FEATURED_RESTAURANTS = [
  {
    id: "rst-1",
    name: "Fast Food Buddy — LPU Campus Express",
    cuisine: "Fast Food, Street Food, Shakes, Burgers",
    rating: 4.9,
    deliveryTime: "15-20 min",
    priceForTwo: "₹200 for two",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    city: "Phagwara",
    address: "Block 38, LPU Campus, Phagwara, Punjab",
    tag: "Campus Special",
  },
  {
    id: "rst-2",
    name: "Fast Food Buddy — Model Town Central",
    cuisine: "North Indian, Chinese, Fast Food",
    rating: 4.8,
    deliveryTime: "20-25 min",
    priceForTwo: "₹250 for two",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    city: "Jalandhar",
    address: "Model Town Main Market, Jalandhar, Punjab",
    tag: "Top Rated",
  },
  {
    id: "rst-3",
    name: "Fast Food Buddy — Connaught Place Flagship",
    cuisine: "Premium Burgers, Pizzas, Gourmet Street Food",
    rating: 4.9,
    deliveryTime: "25-30 min",
    priceForTwo: "₹400 for two",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80",
    city: "Delhi",
    address: "Inner Circle, E-Block, Connaught Place, New Delhi",
    tag: "Flagship Outlet",
  },
  {
    id: "rst-4",
    name: "Fast Food Buddy — Hazratganj Royal Lounge",
    cuisine: "Mughlai Rolls, Kebabs, Fast Bites",
    rating: 4.8,
    deliveryTime: "25-30 min",
    priceForTwo: "₹350 for two",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    city: "Lucknow",
    address: "MG Marg, Hazratganj, Lucknow, Uttar Pradesh",
    tag: "Royal Kitchen",
  },
  {
    id: "rst-5",
    name: "Fast Food Buddy — Station Road Hub",
    cuisine: "Samosa, Chaat, Chowmein, Rolls",
    rating: 4.7,
    deliveryTime: "15-20 min",
    priceForTwo: "₹180 for two",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    city: "Ghazipur",
    address: "Station Road, Near Tanki Ghat, Ghazipur, Uttar Pradesh",
    tag: "Local Favorite",
  },
  {
    id: "rst-6",
    name: "Fast Food Buddy — BHU Lanka Junction",
    cuisine: "Street Food, Biryani, Momos, Beverages",
    rating: 4.9,
    deliveryTime: "20-25 min",
    priceForTwo: "₹220 for two",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    city: "Varanasi",
    address: "Opp. BHU Gate, Lanka, Varanasi, Uttar Pradesh",
    tag: "Student Favorite",
  },
  {
    id: "rst-7",
    name: "Fast Food Buddy — Sector 17 Plaza",
    cuisine: "Loaded Fries, Shakes, Continental Snacks",
    rating: 4.8,
    deliveryTime: "20-30 min",
    priceForTwo: "₹300 for two",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
    city: "Chandigarh",
    address: "Main Commercial Plaza, Sector 17C, Chandigarh",
    tag: "Trendy Spot",
  },
  {
    id: "rst-8",
    name: "Fast Food Buddy — Sector 18 Express",
    cuisine: "Indo-Chinese, Pasta, Wraps",
    rating: 4.7,
    deliveryTime: "20-25 min",
    priceForTwo: "₹280 for two",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&auto=format&fit=crop&q=80",
    city: "Noida",
    address: "Near Atta Market, Sector 18, Noida, Uttar Pradesh",
    tag: "Fast Delivery",
  },
  {
    id: "rst-9",
    name: "Fast Food Buddy — Cyber City Hub",
    cuisine: "Artisan Burgers, Healthy Bowls, Cold Brews",
    rating: 4.8,
    deliveryTime: "25-30 min",
    priceForTwo: "₹450 for two",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
    city: "Gurgaon",
    address: "DLF Cyber City, Phase 2, Gurgaon, Haryana",
    tag: "Corporate Choice",
  },
  {
    id: "rst-10",
    name: "Fast Food Buddy — Civil Lines Bistro",
    cuisine: "North Indian, Street Snacks, Shakes",
    rating: 4.8,
    deliveryTime: "20-25 min",
    priceForTwo: "₹250 for two",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    city: "Prayagraj",
    address: "Tashkent Marg, Civil Lines, Prayagraj, Uttar Pradesh",
    tag: "Highest Rated",
  },
  {
    id: "rst-11",
    name: "Fast Food Buddy — Bandra West Studio",
    cuisine: "Gourmet Sliders, Craft Pizzas, Thick Shakes",
    rating: 4.9,
    deliveryTime: "25-35 min",
    priceForTwo: "₹500 for two",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    city: "Mumbai",
    address: "Hill Road, Bandra West, Mumbai, Maharashtra",
    tag: "Hotspot",
  },
  {
    id: "rst-12",
    name: "Fast Food Buddy — Indiranagar 100ft Kitchen",
    cuisine: "Fusion Burgers, Momos, Specialty Drinks",
    rating: 4.8,
    deliveryTime: "25-30 min",
    priceForTwo: "₹400 for two",
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80",
    city: "Bangalore",
    address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka",
    tag: "Chef's Special",
  },
];

export default function RestaurantsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  const cities = ["All", ...Array.from(new Set(FEATURED_RESTAURANTS.map((r) => r.city)))];

  const filteredRestaurants = FEATURED_RESTAURANTS.filter((rst) => {
    const matchesCity = selectedCity === "All" || rst.city === selectedCity;
    const matchesSearch =
      rst.name.toLowerCase().includes(search.toLowerCase()) ||
      rst.city.toLowerCase().includes(search.toLowerCase()) ||
      rst.address.toLowerCase().includes(search.toLowerCase()) ||
      rst.cuisine.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pb-16">
      <PageHeader
        title="Fast Food Buddy Store Locations"
        description="Explore 10+ official Fast Food Buddy outlets across top cities — serving hot, fresh delicacies!"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-card-bg)] p-4 rounded-2xl border border-[var(--color-border-val)]/60 shadow-xs mb-8">
          <div className="relative flex-1 w-full max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              type="text"
              placeholder="Search outlet by city, area, or campus (e.g. LPU, Phagwara, Delhi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                onClick={() => setSelectedCity(city)}
                className={`rounded-xl h-9 text-xs font-semibold px-4 shrink-0 ${
                  selectedCity === city ? "bg-flame-500 hover:bg-flame-600 text-white border-0" : ""
                }`}
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((rst, i) => (
            <motion.div
              key={rst.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden bg-[var(--color-card-bg)] border border-[var(--color-border-val)]/60 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden shrink-0">
                  <Image
                    src={rst.image}
                    alt={rst.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <Badge className="absolute top-3 left-3 bg-flame-500 text-white font-bold text-[10px] px-3 py-1 shadow-md">
                    {rst.tag}
                  </Badge>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span>{rst.rating}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 text-white text-[11px] font-semibold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    📍 {rst.city}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-flame-500 transition-colors line-clamp-1">
                      {rst.name}
                    </h3>

                    <div className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
                      <Building size={14} className="text-flame-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{rst.address}</span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{rst.cuisine}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border-val)]/40 font-medium">
                      <div className="flex items-center gap-1">
                        <Timer size={14} className="text-flame-500" />
                        <span>{rst.deliveryTime}</span>
                      </div>
                      <span>{rst.priceForTwo}</span>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <MapPin size={14} />
                        <span>Open Now</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[var(--color-surface)] hover:bg-flame-500 hover:text-white text-[var(--color-text-primary)] rounded-xl h-10 text-xs font-bold gap-1.5 transition-all cursor-pointer"
                      asChild
                    >
                      <Link href={`/menu`}>
                        Order From This Outlet
                        <ArrowRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-16 bg-[var(--color-card-bg)] rounded-3xl border border-[var(--color-border-val)]/60 p-8 space-y-3">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No Outlets Found</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Try searching for a different city or location name.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSelectedCity("All");
              }}
              className="rounded-xl text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
