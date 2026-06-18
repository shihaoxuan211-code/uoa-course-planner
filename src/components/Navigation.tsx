"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Navigation() {
  const pathname = usePathname();
  const t = useT();

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/courses", label: t.nav.courses },
    { href: "/plan", label: t.nav.myPlan },
    { href: "/planner", label: t.nav.planner },
    { href: "/compare", label: t.nav.compare }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold tracking-normal text-ink">
          {t.nav.brand}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-1 border-l border-slate-200 pl-3">
            <LanguageToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
