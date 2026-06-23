"use client";

import Link from "next/link";
import type { Course } from "@/types/course";
import { getSimilarCourses } from "@/lib/courseSearch";
import { useT } from "@/lib/i18n";
import { translateStage } from "@/lib/courseDisplay";

interface SimilarCoursesProps {
  course: Course;
  allCourses: Course[];
  difficultyMap?: Map<string, number>;
}

function StarsMini({ value }: { value: number }) {
  return <span className="inline-flex gap-px text-amber-400 text-[10px]">{"★".repeat(value)}{"☆".repeat(5-value)}</span>;
}

export function SimilarCourses({ course, allCourses, difficultyMap }: SimilarCoursesProps) {
  const t = useT();
  const similar = getSimilarCourses(course, allCourses, 6);

  if (similar.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">{t.courseDetail.similarCourses}</h2>
        <p className="mt-3 text-sm text-slate-400">{t.courseDetail.noSimilar}</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-lg font-bold text-ink">{t.courseDetail.similarCourses}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((c) => {
          const diff = difficultyMap?.get(c.code);
          return (
            <Link key={c.id} href={`/courses/${c.id}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-400 hover:shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">{c.code}</p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{c.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{translateStage(c.stage, "en" as any)}</span>
                  <span>·</span>
                  <span>{c.points} pts</span>
                  {diff ? <><span>·</span><StarsMini value={diff} /></> : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
