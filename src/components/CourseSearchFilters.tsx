"use client";

import type { CourseFilters } from "@/lib/courseFilters";
import { useT, useLang } from "@/lib/i18n";
import { translateSemester } from "@/lib/courseDisplay";

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
  const t = useT();
  const { lang } = useLang();

  const update = (key: keyof CourseFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="block">
          <span className="text-sm font-semibold text-ink">{t.courses.search}</span>
          <input
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="BUSAN 300, INTBUS 305, marketing..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">{t.courses.subject}</span>
          <select
            value={filters.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">{t.courses.allSubjects}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">{t.courses.semester}</span>
          <select
            value={filters.semester}
            onChange={(event) => update("semester", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">{t.courses.allSemesters}</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {translateSemester(semester, lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">{t.courses.stage}</span>
          <select
            value={filters.stage}
            onChange={(event) => update("stage", event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-fern focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">{t.courses.allStages}</option>
            {stages.map((stage) => (
              <option key={stage} value={String(stage)}>
                Stage {stage}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-ink">{t.courses.examS1}</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            { value: "all", label: t.courses.all },
            { value: "has-exam", label: t.courses.hasFinalExam },
            { value: "no-exam", label: t.courses.noFinalExam },
            { value: "A", label: "Mode A" },
            { value: "B", label: "Mode B" },
            { value: "C", label: "Mode C" },
            { value: "D", label: "Mode D" }
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.examMode === opt.value
                  ? "border-fern bg-fern/10 text-fern"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="examMode"
                value={opt.value}
                checked={filters.examMode === opt.value}
                onChange={(event) => update("examMode", event.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-ink">{t.courses.difficulty}</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            { value: "all", label: t.courses.all },
            { value: "1", label: "★ 1" },
            { value: "2", label: "★★ 2" },
            { value: "3", label: "★★★ 3" },
            { value: "4", label: "★★★★ 4" },
            { value: "5", label: "★★★★★ 5" }
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.difficulty === opt.value
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={opt.value}
                checked={filters.difficulty === opt.value}
                onChange={(event) => update("difficulty", event.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-ink">{t.courses.groupWork}</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            { value: "all", label: t.courses.all },
            { value: "has-group", label: `👥 ${t.courses.hasGroupWork}` },
            { value: "no-group", label: `🚫 ${t.courses.noGroupWork}` }
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.groupWork === opt.value
                  ? "border-fern bg-fern/10 text-fern"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="groupWork"
                value={opt.value}
                checked={filters.groupWork === opt.value}
                onChange={(event) => update("groupWork", event.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-ink">{t.courses.workload}</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            { value: "all", label: t.courses.all },
            { value: "low", label: `🟢 ${t.courses.low}` },
            { value: "medium", label: `🟡 ${t.courses.medium}` },
            { value: "high", label: `🔴 ${t.courses.high}` }
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filters.workload === opt.value
                  ? "border-fern bg-fern/10 text-fern"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="workload"
                value={opt.value}
                checked={filters.workload === opt.value}
                onChange={(event) => update("workload", event.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
