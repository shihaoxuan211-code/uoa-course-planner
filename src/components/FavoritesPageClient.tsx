"use client";

import type { Course } from "@/types/course";
import { useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/useFavorites";
import { CourseCard } from "@/components/CourseCard";

interface FavoritesPageClientProps {
  courses: Course[];
  difficultyMap: Map<string, number>;
}

export function FavoritesPageClient({ courses, difficultyMap }: FavoritesPageClientProps) {
  const t = useT();
  const { favorites } = useFavorites();
  const favCourses = favorites.map((id) => courses.find((c) => c.id === id)).filter(Boolean) as Course[];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Favorites</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Favorite Courses</h1>
      </div>

      {favCourses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favCourses.map((c) => (
            <CourseCard key={c.id} course={c} difficulty={difficultyMap.get(c.code)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-3xl">♡</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">No favorite courses yet.</p>
          <p className="mt-1 text-xs text-slate-400">Click the heart icon on any course card to save it here.</p>
        </div>
      )}
    </main>
  );
}
