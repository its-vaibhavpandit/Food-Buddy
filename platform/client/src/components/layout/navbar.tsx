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
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
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
import { useTheme } from "@/providers/theme-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { LocationModal } from "@/components/shared/location-modal";
import { navIndicatorTransition } from "@/lib/motion";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home2 },
  { href: "/menu", label: "Menu", icon: Book1 },
  { href: "/restaurants", label: "Restaurants", icon: ShoppingBag },
  { href: "/about", label: "About", icon: InfoCircle },
  { href: "/contact", label: "Contact", icon: CallCalling },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>(() => {
    if (typeof window === "undefined") return "Select Location";
    return localStorage.getItem("selectedCity") || "Select Location";
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      const savedCity = localStorage.getItem("selectedCity");
      setLocationLabel(savedCity || "Select Location");
    };

    window.addEventListener("location-changed", handleLocationChange);
    return () => window.removeEventListener("location-changed", handleLocationChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render navbar on admin pages — they have their own sidebar
  if (pathname.startsWith("/admin")) return null;

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full glass border-b transition-all duration-300",
          scrolled
            ? "shadow-[var(--shadow-level-2)] border-[var(--navbar-border)]"
            : "border-transparent"
        )}
      >
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
            <span className="hidden text-lg font-black tracking-tight text-[var(--color-text-primary)] sm:block font-[family-name:var(--font-display)]">
              Fast Food
              <span className="text-flame-500"> Buddy</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--color-surface)]/60 border border-[var(--color-border-val)]/50 rounded-full px-1.5 py-1.5 shadow-[var(--shadow-level-1)]">
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
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-[var(--color-surface-elevated)] rounded-full shadow-[var(--shadow-level-1)] border border-[var(--color-border-val)]/40 -z-10"
                      transition={navIndicatorTransition}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Interactive Location Picker Button — Desktop */}
            <div className="hidden lg:flex items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border-val)]/80 transition-all max-w-[180px] shadow-xs cursor-pointer"
                title="Choose delivery location on map"
              >
                <Location size={16} variant="Bold" className="text-flame-500 shrink-0" />
                <span className="truncate">{locationLabel}</span>
                <ChevronDown size={14} className="text-[var(--color-text-muted)] shrink-0 ml-0.5" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label={`Switch theme (current: ${theme})`}
            >
              <ThemeIcon size={18} />
            </Button>

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
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
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
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
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
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
                  className="md:hidden text-[var(--color-text-secondary)]"
                  aria-label="Open menu"
                >
                  <HambergerMenu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-[var(--color-surface-elevated)] p-0">
                <SheetHeader className="border-b border-[var(--color-border-val)] px-5 py-4">
                  <SheetTitle className="text-left font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
                    Fast Food <span className="text-flame-500">Buddy</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col px-3 py-4">
                  {/* Location picker button — mobile */}
                  <div className="px-3 mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        setLocationModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between gap-2 text-xs font-semibold text-[var(--color-text-primary)] border border-[var(--color-border-val)] rounded-xl py-2 px-3"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Location size={16} variant="Bold" className="text-flame-500 shrink-0" />
                        <span className="truncate">{locationLabel}</span>
                      </div>
                      <span className="text-[10px] text-flame-500 font-bold bg-flame-50 dark:bg-flame-950/40 px-2 py-0.5 rounded-full shrink-0">
                        Map
                      </span>
                    </Button>
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
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <Icon size={18} variant={isActive ? "Bold" : "Linear"} />
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Theme toggle — mobile */}
                  <div className="mt-4 px-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                      Appearance
                    </p>
                    <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-xl p-1">
                      {(["light", "dark", "system"] as const).map((t) => {
                        const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                        return (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                              theme === t
                                ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-[var(--shadow-level-1)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                            )}
                            aria-label={`Switch to ${t} theme`}
                          >
                            <Icon size={14} />
                            <span className="capitalize">{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

      {/* Interactive Location Picker Modal */}
      <LocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
      />
    </>
  );
}
