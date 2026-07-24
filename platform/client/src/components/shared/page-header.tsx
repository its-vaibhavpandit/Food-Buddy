"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      return { label, href };
    }),
  ];

  // Schema.org BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": crumb.label,
      "item": `https://fastfoodbuddy.in${crumb.href}`,
    })),
  };

  return (
    <section
      className={cn(
        "bg-[var(--color-surface-elevated)] border-b border-[var(--color-border-val)] py-6 sm:py-8 shadow-[var(--shadow-level-1)]",
        className
      )}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-[var(--color-text-muted)]/45">/</span>}
                  {isLast ? (
                    <span className="text-[var(--color-text-primary)] font-semibold" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-flame-500 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl font-[family-name:var(--font-display)]">
              {title}
            </h1>
            {description && (
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {children && <div className="mt-4 sm:mt-0 shrink-0">{children}</div>}
        </div>
      </div>
    </section>
  );
}
