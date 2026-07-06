import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Fast Food Buddy. Reach us by phone, email, or visit us in Ghazipur. We're here to help with your orders and feedback.",
  openGraph: {
    title: "Contact Fast Food Buddy",
    description: "Reach out to us for orders, feedback, or partnership inquiries.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
