import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse our delicious menu — burgers, biryani, pizza, momos, Chinese, rolls, and more. Order online for fast delivery in Ghazipur, Varanasi, Lucknow.",
  openGraph: {
    title: "Our Menu — Fast Food Buddy",
    description: "Explore 100+ dishes from burgers to biryani. Fresh, fast, and affordable.",
    url: "/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
