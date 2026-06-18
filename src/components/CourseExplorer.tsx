"use client";

import { useMemo, useState, useEffect } from "react";
import type { Course } from "@/types/course";
import {
  type CourseFilters,
  filterCourses,
  uniqueSemesters,
  uniqueStages,
  uniqueSubjects
} from "@/lib/courseFilters";
import { useT } from "@/lib/i18n";
import { CourseCard } from "@/components/CourseCard";
import { CourseSearchFilters } from "@/components/CourseSearchFilters";

interface CourseExplorerProps {
  courses: Course[];
  difficultyMap?: Map<string, number>;
}

const PAGE_SIZE = 20;

const defaultFilters: CourseFilters = {
  query: "",
  subject: "all",
  semester: "all",
  stage: "all",
  examMode: "all",
  difficulty: "all",
  groupWork: "all",
  workload: "all"
};

export function CourseExplorer({ courses, difficultyMap }: CourseExplorerProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const t = useT();

  const subjects = useMemo(() => uniqueSubjects(courses), [courses]);
  const semesters = useMemo(() => uniqueSemesters(courses), [courses]);
  const stages = useMemo(() => uniqueStages(courses), [courses]);

  // Filter across ALL courses (search is not limited)
  const filteredCourses = useMemo(
    () => filterCourses(courses, filters, difficultyMap),
    [courses, filters, difficultyMap]
  );

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  // Only render visible courses
  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  return (
    <div className="space-y-6">
      <CourseSearchFilters
        filters={filters}
        subjects={subjects}
        semesters={semesters}
        stages={stages}
        onChange={setFilters}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">
          {t.courses.showing} {visibleCourses.length} {t.courses.of} {filteredCourses.length} courses
        </p>
        <button
          type="button"
          onClick={() => setFilters(defaultFilters)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-white"
        >
          {t.courses.resetFilters}
        </button>
      </div>

      {visibleCourses.length > 0 ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} difficulty={difficultyMap?.get(course.code)} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-ink hover:shadow-md"
              >
                {t.courses.loadMore} ({filteredCourses.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          {t.courses.noResults}
        </div>
      )}
    </div>
  );
}
