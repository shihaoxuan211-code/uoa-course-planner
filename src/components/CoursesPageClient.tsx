"use client";

import type { Course } from "@/types/course";
import { useT } from "@/lib/i18n";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { CourseExplorer } from "@/components/CourseExplorer";

interface CoursesPageClientProps {
  courses: Course[];
  difficultyMap: Map<string, number>;
  dataSource: string;
}

export function CoursesPageClient({ courses, difficultyMap, dataSource }: CoursesPageClientProps) {
  const t = useT();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.courses.badge}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.courses.heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {t.courses.subtitle}
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {t.courses.dataSource} {dataSource === "imported" ? t.courses.dataSourceImported : "Mock fallback data"}
        </p>
      </div>
      <div className="mb-6">
        <DisclaimerBox>
          <p>{t.courses.disclaimerBody}</p>
        </DisclaimerBox>
      </div>
      <CourseExplorer courses={courses} difficultyMap={difficultyMap} />
    </main>
  );
}
