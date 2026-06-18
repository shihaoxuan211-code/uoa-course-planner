"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();

  const valueCards = [
    { title: t.home.card1Title, body: t.home.card1Body, icon: "🔍" },
    { title: t.home.card2Title, body: t.home.card2Body, icon: "📊" },
    { title: t.home.card3Title, body: t.home.card3Body, icon: "📋" }
  ];

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-fern/10 px-3 py-1 text-xs font-bold uppercase tracking-normal text-fern ring-1 ring-inset ring-fern/20">
            {t.home.badge}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
            >
              {t.home.browseCourses}
            </Link>
            <Link
              href="/planner"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-ink hover:shadow-md"
            >
              {t.home.smartPlanner}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md">
          <Image
            src="/planner-visual.png"
            alt="Course planning board illustration"
            width={1200}
            height={850}
            priority
            className="h-full min-h-72 w-full object-cover"
          />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-md">
              <span className="text-2xl">{card.icon}</span>
              <h2 className="mt-3 text-lg font-bold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Stats + Disclaimer */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{t.home.coursesAvailable}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{t.home.courseCount}</p>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {t.home.disclaimer}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
