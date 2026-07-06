import Link from "next/link";
import Image from "next/image";
import {
  CallCalling,
  Clock,
  Location,
} from "iconsax-react";

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

const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#1a1a1a] text-cream-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/5 shadow-inner">
                <Image
                  src="/images/logo.svg"
                  alt="Fast Food Buddy Logo"
                  width={24}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-[family-name:var(--font-display)]">
                Fast Food
                <span className="text-flame-400"> Buddy</span>
              </span>
            </div>
            <p className="text-sm text-cream-300/70 leading-relaxed">
              Your go-to destination for mouthwatering street food and fast
              bites, delivered fresh to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream-200">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-300/70 transition-colors hover:text-flame-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream-200">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-cream-300/70">
                <Location
                  size={16}
                  variant="Bold"
                  className="mt-0.5 shrink-0 text-flame-400"
                />
                <span>233001, Ghazipur, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-cream-300/70">
                <CallCalling
                  size={16}
                  variant="Bold"
                  className="shrink-0 text-flame-400"
                />
                <a
                  href="tel:+917991627368"
                  className="transition-colors hover:text-flame-400"
                >
                  +91 79916 27368
                </a>
              </li>
            </ul>
          </div>

          {/* Hours & Social */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream-200">
              Hours
            </h4>
            <ul className="space-y-2 text-sm text-cream-300/70">
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-flame-400" />
                Mon – Fri: 8:00 AM – 10:00 PM
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-flame-400" />
                Sat – Sun: 8:00 AM – 8:00 PM
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cream-200 transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95 ${social.hoverClass}`}
                >
                  {social.icon("w-5 h-5 transition-transform duration-300")}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream-300/50">
          © {new Date().getFullYear()} Fast Food Buddy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
