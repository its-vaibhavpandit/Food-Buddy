"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star1, Award, ShieldTick, Clock } from "iconsax-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    icon: ShieldTick,
    title: "Premium Quality Ingredients",
    description: "We use only fresh, locally sourced ingredients and house-made sauces prepared daily.",
  },
  {
    icon: Award,
    title: "Chef-Inspired Menus",
    description: "Our chefs bring innovation to classic fast food recipes, balancing taste and clean nutrition.",
  },
  {
    icon: Clock,
    title: "Fast, Hygienic Service",
    description: "Every order is packaged under strict sanitation guidelines and delivered in 30 minutes.",
  },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/CoAvi2rCYEef1LY3/",
    icon: (className: string) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
      </svg>
    ),
    hoverClass: "hover:bg-[#1877F2] hover:text-white hover:shadow-[0_0_15px_rgba(24,119,242,0.6)] hover:border-[#1877F2]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mr._vaibhav__69/profilecard/?igsh=MTAwMHVkdHd2bGhqcw==",
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    hoverClass: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:shadow-[0_0_15px_rgba(238,42,123,0.6)] hover:border-transparent",
  },
  {
    label: "Telegram",
    href: "https://t.me/mr_vaibhav_69",
    icon: (className: string) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.57-3.27 3.61-1.53 4.36-1.8 4.85-1.8.11 0 .35.03.5.16.13.12.17.29.18.41 0 .08-.01.23-.02.34z"/>
      </svg>
    ),
    hoverClass: "hover:bg-[#0088cc] hover:text-white hover:shadow-[0_0_15px_rgba(0,136,204,0.6)] hover:border-[#0088cc]",
  },
  {
    label: "Snapchat",
    href: "https://www.snapchat.com/add/imvaibhavpandit?share_id=YsYwoUCVdgw&locale=en-GB",
    icon: (className: string) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2c-.67 0-1.6.36-2.3 1.08-.66.68-1.06 1.48-1.28 2.05-.28-.1-.6-.18-.94-.18-.95 0-1.74.57-2.07 1.34-.14.33-.18.72-.09 1.1-.63.15-1.16.51-1.48 1.03-.45.73-.39 1.63.13 2.27.18.23.41.42.66.56-.05.15-.09.31-.09.47 0 .86.72 1.56 1.61 1.56.32 0 .61-.09.87-.25.2.49.56.9 1.01 1.18.66.42 1.48.51 2.27.24.16.48.43.91.79 1.24.8.72 1.93.98 2.92.68.4.29.89.47 1.42.47.45 0 .87-.13 1.23-.36.42.19.89.28 1.36.25 1-.06 1.83-.69 2.16-1.57.17-.46.16-.95-.03-1.39.46-.22.84-.57 1.09-1.01.37-.66.36-1.46-.03-2.11-.12-.2-.29-.37-.48-.5.1-.38.07-.79-.09-1.14-.32-.73-1.07-1.25-1.95-1.28-.3 0-.58.06-.84.15-.22-.52-.59-1.26-1.22-1.92C13.6 2.36 12.67 2 12 2zm.05 2.11c.29 0 .6.24.96.72.63.85.95 2 .95 3.44 0 .34-.14.61-.41.8-.28.18-.62.24-.95.17-.38-.08-.73-.08-1.1 0-.33.07-.67.01-.95-.17-.27-.19-.41-.46-.41-.8 0-1.44.32-2.59.95-3.44.36-.48.67-.72.96-.72.24 0 .5.16.78.48.33.37.7.83 1.1 1.37.18.24.47.38.77.38.3 0 .59-.14.77-.38.4-.54.77-1 1.1-1.37.28-.32.54-.48.78-.48zm-4.72 4.13c.27 0 .52.12.69.32.33.4.74.88 1.2 1.42.34.42.86.67 1.4.67.14 0 .28-.02.42-.05.18-.04.37-.06.56-.06s.38.02.56.06c.14.03.28.05.42.05.54 0 1.06-.25 1.4-.67.46-.54.87-1.02 1.2-1.42.17-.2.42-.32.69-.32.39 0 .7.26.79.62.08.31.02.63-.16.89-.3.43-.88 1.15-1.52 1.95-.27.34-.33.79-.16 1.18.17.39.54.66.97.7.74.07 1.5.02 2.22-.16.32-.08.66.01.9.23.24.23.33.56.24.87-.09.31-.32.56-.63.66-.63.2-1.28.32-1.94.36-.44.03-.83.25-1.07.61-.24.36-.26.81-.07 1.2.33.68.86 1.83.69 2.54-.08.32-.28.59-.57.73-.29.14-.63.14-.92.01-.33-.15-.84-.4-1.42-.68-.38-.18-.83-.18-1.21 0-.58.28-1.09.53-1.42.68-.29.13-.63.13-.92-.01-.29-.14-.49-.41-.57-.73-.17-.71.36-1.86.69-2.54.19-.39.17-.84-.07-1.2-.24-.36-.63-.58-1.07-.61-.66-.04-1.31-.16-1.94-.36-.31-.1-.54-.35-.63-.66-.09-.31 0-.64.24-.87.24-.22.58-.31.9-.23.72.18 1.48.23 2.22.16.43-.04.8-.31.97-.7.17-.39.11-.84-.16-1.18-.64-.8-1.22-1.52-1.52-1.95-.18-.26-.24-.58-.16-.89.09-.36.4-.62.79-.62z"/>
      </svg>
    ),
    hoverClass: "hover:bg-[#FFFC00] hover:text-black hover:shadow-[0_0_15px_rgba(255,252,0,0.8)] hover:border-[#FFFC00]",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/qr/6QUOH3I7LPMUA1",
    icon: (className: string) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.78 9.78 0 0 0-6.974-2.879C6.012 1.96 1.59 6.33 1.586 11.76c-.001 1.705.452 3.37 1.31 4.8l-.999 3.648 3.76-.986zm11.233-7.797c-.29-.146-1.72-.849-1.987-.946-.266-.097-.461-.146-.656.146-.195.293-.755.946-.926 1.141-.171.195-.341.219-.63.073-.29-.146-1.228-.452-2.339-1.443-.864-.771-1.447-1.724-1.618-2.016-.171-.293-.018-.452.128-.596.133-.13.29-.341.436-.512.146-.171.195-.293.293-.488.097-.195.049-.366-.024-.512-.073-.146-.656-1.581-.9-2.166-.238-.574-.479-.496-.656-.506-.171-.007-.366-.007-.56-.007-.195 0-.512.073-.78.366-.268.293-1.023 1.001-1.023 2.441 0 1.439 1.047 2.83 1.193 3.025.146.195 2.062 3.149 4.996 4.417.697.302 1.242.482 1.666.617.7.223 1.338.192 1.843.117.563-.083 1.72-.702 1.963-1.38.243-.678.243-1.261.171-1.38-.072-.119-.268-.192-.559-.339z"/>
      </svg>
    ),
    hoverClass: "hover:bg-[#25D366] hover:text-white hover:shadow-[0_0_15px_rgba(37,211,102,0.6)] hover:border-[#25D366]",
  }
];

export default function AboutPage() {
  return (
    <div className="bg-cream-50/30 min-h-screen pb-16">
      <PageHeader
        title="About Fast Food Buddy"
        description="Learn more about our mission, values, and our culinary journey."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {/* Story Section */}
        <section className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-flame-50 text-flame-600 hover:bg-flame-50 border-flame-100 px-3 py-1 mb-4">
              🌱 Our Origins
            </Badge>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-foreground sm:text-4xl">
              Fresh, Flavorful, Fast
            </h2>
            <h3 className="text-lg font-medium text-flame-500 mt-2">
              Crafting Unforgettable Food Moments
            </h3>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              At Fast Food Buddy, our journey started with a simple passion: to create food that brings people together. 
              We wanted to break the stereotype of greasy, unhealthy fast food. 
              By incorporating fresh, locally sourced farm produce, balanced nutrients, and chef-level expertise, we recreate classics you love without compromising your health.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether it’s a classic chicken cheeseburger, fresh spring rolls, or our signature aromatic biryani, every single item in our catalog is engineered to order and crafted with love and care.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4 relative"
          >
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/burger.jpg"
                  alt="Delicious gourmet burger"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/biryani.jpg"
                  alt="Aromatic rice dish"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative h-60 w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/pizza.png"
                  alt="Freshly baked pizza"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/soda.png"
                  alt="Cold carbonated drinks"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-foreground">
              What Sets Us Apart
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We stand for quality, nutrition transparency, and lightning-fast customer delivery.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="p-6 text-center border-border/50 bg-white hover:shadow-lg transition-shadow rounded-2xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-flame-50 text-flame-500">
                      <Icon size={24} variant="Bold" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base">
                      {val.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                      {val.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="mt-20 bg-white border border-border/60 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-flame-50/50 blur-2xl" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 px-3 py-1 mb-5">
              🏆 Customers&apos; Choice
            </Badge>
            <p className="text-lg sm:text-xl font-medium italic text-foreground leading-relaxed">
              “I can&apos;t say enough about how amazing my experience has been with Fast Food Buddy! 
              The burgers are juicy, flavorful, and cooked to perfection. The built-in AI nutritionist and calorie tracker in their menu page makes it so easy to keep check of what I eat. Service is lightning fast!”
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Star1 size={16} variant="Bold" className="text-amber-500" />
              <Star1 size={16} variant="Bold" className="text-amber-500" />
              <Star1 size={16} variant="Bold" className="text-amber-500" />
              <Star1 size={16} variant="Bold" className="text-amber-500" />
              <Star1 size={16} variant="Bold" className="text-amber-500" />
            </div>
            <p className="mt-4 font-bold text-foreground text-sm">
              Vaibhav Pandit
            </p>
            <p className="text-xs text-muted-foreground">Regular Customer</p>
          </div>
        </section>

        {/* Connect With Us Section */}
        <section className="mt-20 text-center">
          <Badge className="bg-flame-50 text-flame-600 hover:bg-flame-50 border-flame-100 px-3 py-1 mb-4">
            💬 Get In Touch
          </Badge>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Connect With Us
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            Follow our social channels to stay updated on special chef recommendations, seasonal items, and exclusive discounts.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-110 active:scale-95 ${social.hoverClass}`}
              >
                {social.icon("w-6 h-6 transition-transform duration-300")}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="bg-flame-500 hover:bg-flame-600 text-white rounded-xl shadow-md"
            asChild
          >
            <Link href="/menu">Order Now & Try Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
