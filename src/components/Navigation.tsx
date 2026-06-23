"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT, useLang } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100 hover:text-ink"
      }`}>
      {label}
    </Link>
  );
}

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(!open)}
        className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-ink inline-flex items-center gap-1">
        {label} <span className="text-[10px]">{open ? "▴" : "▾"}</span>
      </button>
      {/* invisible bridge — covers gap between button and menu */}
      {open && <div onMouseEnter={() => setOpen(true)} className="absolute left-0 top-full z-50 h-2 w-full" />}
      {/* dropdown menu */}
      <div
        onMouseEnter={() => setOpen(true)}
        className={`absolute left-0 z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg transition-all duration-150 ${
          open ? "top-[calc(100%+8px)] opacity-100 translate-y-0 pointer-events-auto" : "top-full opacity-0 -translate-y-1 pointer-events-none"
        }`}>
        {children}
      </div>
    </div>
  );
}

function DropdownLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink">
      {label}
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const t = useT();
  const { lang } = useLang();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 overflow-x-auto">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink shrink-0">
          {t.nav.brand}
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink href="/" label={t.nav.home} active={isActive("/")} />
          <NavLink href="/courses" label={t.nav.courses} active={isActive("/courses")} />

          {/* Planning dropdown */}
          <Dropdown label={lang === "zh" ? "规划" : "Planning"}>
            <DropdownLink href="/planner" label={t.nav.planner} />
            <DropdownLink href="/roadmap" label={lang === "zh" ? "学位路线图" : "Degree Roadmap"} />
          </Dropdown>

          <NavLink href="/recommender" label={lang === "zh" ? "🤖 AI推荐" : "🤖 AI Recommender"} active={isActive("/recommender")} />

          {/* My dropdown */}
          <Dropdown label={lang === "zh" ? "我的" : "My"}>
            <DropdownLink href="/plan" label={t.nav.myPlan} />
            <DropdownLink href="/compare" label={t.nav.compare} />
            <DropdownLink href="/favorites" label={lang === "zh" ? "收藏课程" : "Favorite Courses"} />
            <DropdownLink href="/recent" label={lang === "zh" ? "最近浏览" : "Recently Viewed"} />
          </Dropdown>

          <NavLink href="/about" label={t.nav.about} active={isActive("/about")} />

          <div className="ml-1 border-l border-slate-200 pl-3">
            <LanguageToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
