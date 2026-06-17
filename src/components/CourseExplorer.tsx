"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/types/course";
import {
  type CourseFilters,
  filterCourses,
  uniqueSemesters,
  uniqueStages,
  uniqueSubjects
} from "@/lib/courseFilters";
import { CourseCard } from "@/components/CourseCard";
import { CourseSearchFilters } from "@/components/CourseSearchFilters";

interface CourseExplorerProps {
  courses: Course[];
  difficultyMap?: Map<string, number>;
}

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

  const subjects = useMemo(() => uniqueSubjects(courses), [courses]);
  const semesters = useMemo(() => uniqueSemesters(courses), [courses]);
  const stages = useMemo(() => uniqueStages(courses), [courses]);

  const filteredCourses = useMemo(
    () => filterCourses(courses, filters, difficultyMap),
    [courses, filters, difficultyMap]
  );

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
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        <button
          type="button"
          onClick={() => setFilters(defaultFilters)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-white"
        >
          Reset filters
        </button>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} difficulty={difficultyMap?.get(course.code)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No sample courses match your current search and filters.
        </div>
      )}
    </div>
  );
}
