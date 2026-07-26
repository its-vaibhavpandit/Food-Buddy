import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeScript } from "@/providers/theme-script";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AiAssistantWrapper } from "@/components/shared/ai-assistant-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fastfoodbuddy.in"),
  title: {
    default: "Fast Food Buddy — Fresh Street Food, Delivered Fast",
    template: "%s | Fast Food Buddy",
  },
  description:
    "Order your favorite burgers, biryani, momos, and more. Fresh street food and fast bites delivered to your doorstep in Ghazipur, Varanasi, and more cities.",
  keywords: [
    "fast food delivery",
    "street food",
    "order food online",
    "burger delivery",
    "biryani order",
    "Ghazipur food",
    "Varanasi street food",
    "food delivery India",
  ],
  authors: [{ name: "Fast Food Buddy", url: "https://fastfoodbuddy.in" }],
  creator: "Vaibhav Pandit",
  openGraph: {
    title: "Fast Food Buddy — Fresh Street Food, Delivered Fast",
    description:
      "Order your favorite burgers, biryani, momos, and more. Delivered to your doorstep.",
    type: "website",
    locale: "en_IN",
    siteName: "Fast Food Buddy",
    url: "https://fastfoodbuddy.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Food Buddy — Fresh Street Food, Delivered Fast",
    description:
      "Order your favorite burgers, biryani, momos, and more. Delivered to your doorstep.",
    creator: "@fastfoodbuddy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://fastfoodbuddy.in",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Fast Food Buddy",
  description:
    "Your go-to destination for mouthwatering street food and fast bites, delivered fresh to your doorstep.",
  url: "https://fastfoodbuddy.in",
  telephone: "+917991627368",
  address: {
    "@type": "PostalAddress",
    streetAddress: "233001",
    addressLocality: "Ghazipur",
    addressRegion: "Uttar Pradesh",
    postalCode: "233001",
    addressCountry: "IN",
  },
  servesCuisine: ["Indian", "Street Food", "Chinese", "Fast Food"],
  priceRange: "₹₹",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
};

import { PageTransition } from "@/components/shared/page-transition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <Navbar />
              <PageTransition>
                <main className="flex-1 flex flex-col">{children}</main>
              </PageTransition>
              <Footer />
              <AiAssistantWrapper />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
