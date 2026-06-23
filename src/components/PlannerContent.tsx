"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { generateRecommendations } from "@/lib/majorPlanner";
import type { StudentYear, StudentMajor } from "@/lib/studentProfile";
import { YEAR_LABELS, MAJOR_LABELS } from "@/lib/studentProfile";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";
import type { GoalType, WorkloadPref, PrefSemester, Recommendation } from "@/lib/majorPlanner";
import { useT, useLang } from "@/lib/i18n";
import { PrerequisiteWarningModal } from "@/components/PrerequisiteWarningModal";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const r = localStorage.getItem(key); if (!r) return new Set(); const a = JSON.parse(r); return new Set(Array.isArray(a) ? a.filter((s): s is string => typeof s === "string") : []); } catch { return new Set(); }
}

const GOAL_LABELS: Record<string, Record<GoalType, string>> = {
  en: { "easy-gpa": "Easy GPA", "major-progression": "Major Progression", "avoid-exams": "Avoid Final Exams", "practical-skills": "Practical Skills", balanced: "Balanced" },
  zh: { "easy-gpa": "提高GPA", "major-progression": "专业进阶", "avoid-exams": "避免期末考", "practical-skills": "实用技能", balanced: "均衡发展" }
};
const WORKLOAD_LABELS: Record<string, Record<WorkloadPref, string>> = {
  en: { light: "Light", balanced: "Balanced", heavy: "Heavy" },
  zh: { light: "轻松", balanced: "适中", heavy: "繁重" }
};
const SEMESTER_OPTIONS: PrefSemester[] = ["Semester 1", "Semester 2", "Summer School", "any"];

interface PlannerContentProps { allCourses: Course[] }

export function PlannerContent({ allCourses }: PlannerContentProps) {
  const t = useT();
  const { lang } = useLang();
  const [year, setYear] = useState<StudentYear>("second");
  const [major, setMajor] = useState<StudentMajor>("undecided");
  const [semester, setSemester] = useState<PrefSemester>("Semester 1");
  const [workload, setWorkload] = useState<WorkloadPref>("balanced");
  const [goal, setGoal] = useState<GoalType>("major-progression");
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Warning modal state
  const [modalCourse, setModalCourse] = useState<{ id: string; code: string; missing: string[] } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const completedCodes = useMemo(() => mounted ? readSet("uoa-course-planner:completed-courses") : new Set<string>(), [refreshKey, mounted]);
  const plannedCodes = useMemo(() => mounted ? readSet("uoa-course-planner:plan") : new Set<string>(), [refreshKey, mounted]);
  const assumedCodes = useMemo(() => mounted ? readSet("uoa-course-planner:assumed-courses") : new Set<string>(), [refreshKey, mounted]);

  const goalLabels = GOAL_LABELS[lang] ?? GOAL_LABELS.en;
  const workloadLabels = WORKLOAD_LABELS[lang] ?? WORKLOAD_LABELS.en;

  const result = useMemo(() =>
    generateRecommendations({ year, major, preferredSemester: semester, workload, goal, completedCodes, plannedCodes, assumedCodes, allCourses }),
    [year, major, semester, workload, goal, completedCodes, plannedCodes, assumedCodes, allCourses]
  );

  const addToPlan = useCallback((courseId: string) => {
    const current = readSet("uoa-course-planner:plan");
    if (current.has(courseId)) return;
    current.add(courseId);
    localStorage.setItem("uoa-course-planner:plan", JSON.stringify([...current]));
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.planner.badge}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{t.planner.heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {t.planner.subtitle}
        </p>
      </div>

      {/* Controls */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.planner.year}</label>
            <select value={year} onChange={(e) => setYear(e.target.value as StudentYear)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(YEAR_LABELS) as [StudentYear, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.planner.major}</label>
            <select value={major} onChange={(e) => setMajor(e.target.value as StudentMajor)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(MAJOR_LABELS) as [StudentMajor, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.planner.semester}</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value as PrefSemester)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {SEMESTER_OPTIONS.map((s) => (<option key={s} value={s}>{s === "any" ? t.planner.any : s}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.planner.workload}</label>
            <select value={workload} onChange={(e) => setWorkload(e.target.value as WorkloadPref)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(workloadLabels) as [WorkloadPref, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.planner.goal}</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(goalLabels) as [GoalType, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
        </div>
      </section>

      {/* Ready Recommendations */}
      <section>
        <h2 className="text-xl font-bold text-ink">{t.planner.recommended} ({result.recommendations.length})</h2>
        {result.recommendations.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.recommendations.slice(0, 12).map((rec) => (
              <div key={rec.course.id} className="flex flex-col rounded-lg border border-emerald-200 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/courses/${rec.course.id}`} className="text-sm font-bold text-fern hover:underline">{rec.course.code}</Link>
                    <p className="text-sm font-semibold text-ink line-clamp-1">{rec.course.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{translateStage(rec.course.stage, lang)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatPoints(rec.course.points)} pts | {translateSemesters(rec.course.semesters, lang)}</p>
                {rec.reasons.length > 0 && (
                  <ul className="mt-2 space-y-0.5 border-t border-slate-100 pt-2">
                    {rec.reasons.map((r, i) => (<li key={i} className="text-xs text-slate-600">• {r}</li>))}
                  </ul>
                )}
                <button type="button" onClick={() => addToPlan(rec.course.id)}
                  className="mt-3 w-full rounded-lg bg-fern px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700">{t.planner.addToMyPlan}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              {t.planner.noCoursesMatch}
            </p>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
              {t.planner.profileHint}
            </p>
          </div>
        )}
      </section>

      {/* Not Ready Yet */}
      {result.notReady.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-amber-700">{t.planner.notReadyYet} ({result.notReady.length})</h2>
          <p className="mt-1 text-sm text-slate-600">{t.planner.notReadySubtitle}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.notReady.slice(0, 6).map((rec) => (
              <div key={rec.course.id} className="flex flex-col rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/courses/${rec.course.id}`} className="text-sm font-bold text-amber-800 hover:underline">{rec.course.code}</Link>
                    <p className="text-sm font-semibold text-ink line-clamp-1">{rec.course.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{translateStage(rec.course.stage, lang)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatPoints(rec.course.points)} pts | {translateSemesters(rec.course.semesters, lang)}</p>
                <div className="mt-2 rounded bg-white p-2 text-xs">
                  <p className="font-semibold text-amber-800">{t.planner.missing}</p>
                  <p className="mt-0.5 text-amber-700">{rec.missingPrereqs.join(", ")}</p>
                  {rec.missingPrereqs.length > 0 && <p className="mt-1 text-amber-600">Take {rec.missingPrereqs[0]} {t.planner.takeFirst}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setModalCourse({ id: rec.course.id, code: rec.course.code, missing: rec.missingPrereqs })}
                  className="mt-3 w-full rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  {t.planner.addToMyPlan}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prerequisite Warning Modal */}
      {modalCourse && (
        <PrerequisiteWarningModal
          courseCode={modalCourse.code}
          missingCodes={modalCourse.missing}
          onCancel={() => setModalCourse(null)}
          onConfirm={() => {
            addToPlan(modalCourse.id);
            setModalCourse(null);
          }}
        />
      )}
    </main>
  );
}
