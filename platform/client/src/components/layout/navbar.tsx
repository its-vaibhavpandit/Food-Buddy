"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HambergerMenu,
  User as UserIcon,
  SearchNormal1,
  Location,
  Home2,
  Book1,
  InfoCircle,
  CallCalling,
  LogoutCurve,
  ShoppingBag,
  Setting2,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";
import { CartSheet } from "@/components/cart/cart-sheet";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home2 },
  { href: "/menu", label: "Menu", icon: Book1 },
  { href: "/about", label: "About", icon: InfoCircle },
  { href: "/contact", label: "Contact", icon: CallCalling },
] as const;

const CITIES = [
  "Ghazipur",
  "Varanasi",
  "Balia",
  "Bhadohi",
  "Mau",
  "Prayagraj",
  "Lucknow",
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("selectedCity", selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render navbar on admin pages — they have their own sidebar
  if (pathname.startsWith("/admin")) return null;


  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-transparent transition-all duration-300",
      scrolled && "shadow-sm border-border/80"
    )}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-flame-50/50 border border-flame-100/40 p-1 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
            <Image
              src="/images/logo.svg"
              alt="Fast Food Buddy Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="hidden text-lg font-black tracking-tight text-foreground sm:block font-[family-name:var(--font-display)]">
            Fast Food
            <span className="text-flame-500"> Buddy</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-muted/50 border border-border/50 rounded-full px-1.5 py-1.5 shadow-sm">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-1.5 text-sm font-semibold transition-all rounded-full z-10",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-border/40 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* City Selector — Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Location size={16} variant="Bold" className="text-flame-500" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground cursor-pointer focus:outline-none"
              aria-label="Select delivery city"
            >
              <option value="">Select City</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Search menu"
          >
            <SearchNormal1 size={20} />
          </Button>

          {/* Cart */}
          <CartSheet />

          {/* Auth / Profile */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="User menu"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-flame-200 shadow-sm transition-transform hover:scale-105 duration-300 bg-flame-50/50">
                    <Image
                      src="/images/avatar.svg"
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserIcon size={16} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <ShoppingBag size={16} className="mr-2" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Setting2 size={16} className="mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogoutCurve size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="bg-flame-500 hover:bg-flame-600 text-white" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground"
                aria-label="Open menu"
              >
                <HambergerMenu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-left font-[family-name:var(--font-display)]">
                  Fast Food <span className="text-flame-500">Buddy</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col px-3 py-4">
                {/* City selector — mobile */}
                <div className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-muted-foreground">
                  <Location size={16} variant="Bold" className="text-flame-500" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground cursor-pointer focus:outline-none flex-1"
                    aria-label="Select delivery city"
                  >
                    <option value="">Select City</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nav links */}
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-flame-50 text-flame-600"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={18} variant={isActive ? "Bold" : "Linear"} />
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile auth buttons */}
                {!isAuthenticated && (
                  <div className="mt-6 flex flex-col gap-2 px-3">
                    <Button variant="outline" asChild>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                      >
                        Log in
                      </Link>
                    </Button>
                    <Button
                      className="bg-flame-500 hover:bg-flame-600 text-white"
                      asChild
                    >
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
