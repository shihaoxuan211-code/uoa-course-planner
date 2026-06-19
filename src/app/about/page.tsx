"use client";

import { useT } from "@/lib/i18n";

export default function AboutPage() {
  const t = useT();

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      {/* Header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.about.heading}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.about.heading}</h1>
      </div>

      {/* Who Built This */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.about.whoTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t.about.whoBody}</p>
      </section>

      {/* Features */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.about.featuresTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.about.featureCards.map((card) => (
            <div key={card.title} className="rounded-lg bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.about.dataTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t.about.dataBody}</p>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t.about.disclaimer}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.about.contactTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t.about.contactBody}</p>
      </section>
    </main>
  );
}
