"use client";

import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { FeedbackButton } from "@/components/FeedbackButton";
import { useT } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT();

  return (
    <>
      <Navigation />
      {children}
      <FeedbackButton />
      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-12">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs leading-5 text-slate-500">
          <p className="font-semibold text-slate-600">
            {t.footer.independent}
          </p>
          <p className="mt-1">
            {t.footer.sourceNote}
          </p>
          <p className="mt-2 text-slate-400">{t.footer.analytics}</p>
          <p className="mt-1 text-slate-400">{t.footer.dataFreshness}</p>
          <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="/privacy" className="underline decoration-dotted underline-offset-2 hover:text-ink">{t.footer.privacy}</a>
            <a href="/terms" className="underline decoration-dotted underline-offset-2 hover:text-ink">{t.footer.terms}</a>
            <a href="/disclaimer" className="underline decoration-dotted underline-offset-2 hover:text-ink">{t.footer.disclaimer}</a>
          </p>
        </div>
      </footer>
    </>
  );
}
