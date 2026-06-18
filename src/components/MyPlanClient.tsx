"use client";

import type { Course } from "@/types/course";
import { useT } from "@/lib/i18n";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { PlanSummary } from "@/components/PlanSummary";
import { StudentProfilePanel } from "@/components/StudentProfilePanel";

interface MyPlanClientProps {
  courses: Course[];
}

export function MyPlanClient({ courses }: MyPlanClientProps) {
  const t = useT();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.plan.badge}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.plan.heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {t.plan.subtitle}
        </p>
      </div>

      <DisclaimerBox>
        <p>{t.courses.disclaimerBody}</p>
      </DisclaimerBox>

      <StudentProfilePanel />

      <PlanSummary courses={courses} />
    </main>
  );
}
