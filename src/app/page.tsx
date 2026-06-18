"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();

  const valueCards = [
    { title: t.home.card1Title, body: t.home.card1Body },
    { title: t.home.card2Title, body: t.home.card2Body },
    { title: t.home.card3Title, body: t.home.card3Body }
  ];

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.home.badge}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {t.home.browseCourses}
            </Link>
            <Link
              href="/planner"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              {t.home.smartPlanner}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
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

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-xl font-bold text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{t.home.coursesAvailable}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{t.home.courseCount}</p>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {t.home.disclaimer}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
