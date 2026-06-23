"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { getRecentCourses } from "@/lib/courseSearch";
import { CourseCard } from "@/components/CourseCard";

interface RecentPageClientProps {
  courses: Course[];
  difficultyMap: Map<string, number>;
}

export function RecentPageClient({ courses, difficultyMap }: RecentPageClientProps) {
  const [recent, setRecent] = useState<Course[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecent(getRecentCourses(courses));
    setLoaded(true);
  }, [courses]);

  if (!loaded) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Recent</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Recently Viewed</h1>
      </div>

      {recent.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((c) => (
            <CourseCard key={c.id} course={c} difficulty={difficultyMap.get(c.code)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-3xl">🕐</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">No recently viewed courses yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            <Link href="/courses" className="text-fern hover:underline">Browse courses</Link> to get started.
          </p>
        </div>
      )}
    </main>
  );
}
