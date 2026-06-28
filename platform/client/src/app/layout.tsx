import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AiAssistant } from "@/components/shared/ai-assistant";

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
  ],
  authors: [{ name: "Fast Food Buddy" }],
  openGraph: {
    title: "Fast Food Buddy — Fresh Street Food, Delivered Fast",
    description:
      "Order your favorite burgers, biryani, momos, and more. Delivered to your doorstep.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AiAssistant />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
