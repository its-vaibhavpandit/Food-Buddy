import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Fast Food Buddy — our mission to deliver the freshest street food and fast bites right to your doorstep in Ghazipur, Varanasi, and more cities across India.",
  openGraph: {
    title: "About Fast Food Buddy",
    description: "Our story, values, and commitment to delivering the best street food experience.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
