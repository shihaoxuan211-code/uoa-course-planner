"use client";

import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/types/course";
import { useT } from "@/lib/i18n";
import { COMPLETED_COURSES_KEY } from "@/lib/storageKeys";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { PlanSummary } from "@/components/PlanSummary";
import { StudentProfilePanel } from "@/components/StudentProfilePanel";

interface MyPlanClientProps {
  courses: Course[];
}

function readCompletedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(COMPLETED_COURSES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : []);
  } catch { return new Set(); }
}

function CompletedCoursesSection() {
  const t = useT();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCompleted(readCompletedSet());
    setLoaded(true);
  }, []);

  const removeCompleted = useCallback((code: string) => {
    const next = new Set(completed);
    next.delete(code);
    setCompleted(next);
    try {
      localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify([...next]));
    } catch { /* ignore */ }
  }, [completed]);

  if (!loaded) return null;
  if (completed.size === 0) return null;

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-card">
      <h2 className="text-lg font-bold text-emerald-700">
        ✓ {t.prereqWarning.completedCourses} ({completed.size})
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {[...completed].sort().map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
          >
            {code}
            <button
              type="button"
              onClick={() => removeCompleted(code)}
              className="ml-0.5 text-emerald-400 hover:text-rose-600 transition"
              title={t.plan.remove}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Completed courses count toward prerequisite satisfaction but are not automatically added to your plan credits.
      </p>
    </section>
  );
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

      <CompletedCoursesSection />

      <PlanSummary courses={courses} />
    </main>
  );
}
