"use client";

import type { CourseFilters } from "@/lib/courseFilters";

interface CourseSearchFiltersProps {
  filters: CourseFilters;
  subjects: string[];
  semesters: string[];
  stages: number[];
  onChange: (filters: CourseFilters) => void;
}

export function CourseSearchFilters({
  filters,
  subjects,
  semesters,
  stages,
  onChange
}: CourseSearchFiltersProps) {
  const update = (key: keyof CourseFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Search course code or title</span>
          <input
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="BUSAN 300, INTBUS 305, marketing..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Subject</span>
          <select
            value={filters.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Semester</span>
          <select
            value={filters.semester}
            onChange={(event) => update("semester", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Stage</span>
          <select
            value={filters.stage}
            onChange={(event) => update("stage", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All stages</option>
            {stages.map((stage) => (
              <option key={stage} value={String(stage)}>
                Stage {stage}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
