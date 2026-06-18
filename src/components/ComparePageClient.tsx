"use client";

import type { Course } from "@/types/course";
import { useT } from "@/lib/i18n";
import { ComparisonTable } from "@/components/ComparisonTable";
import { DisclaimerBox } from "@/components/DisclaimerBox";

interface ComparePageClientProps {
  courses: Course[];
}

export function ComparePageClient({ courses }: ComparePageClientProps) {
  const t = useT();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.compare.badge}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.compare.heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {t.compare.subtitle}
        </p>
      </div>

      <DisclaimerBox>
        <p>{t.courses.disclaimerBody}</p>
      </DisclaimerBox>

      <ComparisonTable courses={courses} />
    </main>
  );
}
