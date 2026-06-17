"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { generateRecommendations } from "@/lib/majorPlanner";
import type { StudentYear, StudentMajor } from "@/lib/studentProfile";
import { YEAR_LABELS, MAJOR_LABELS } from "@/lib/studentProfile";
import { formatPoints, formatSemesters } from "@/lib/courseDisplay";
import type { GoalType, WorkloadPref, PrefSemester, Recommendation } from "@/lib/majorPlanner";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const r = localStorage.getItem(key); if (!r) return new Set(); const a = JSON.parse(r); return new Set(Array.isArray(a) ? a.filter((s): s is string => typeof s === "string") : []); } catch { return new Set(); }
}

const GOAL_LABELS: Record<GoalType, string> = { "easy-gpa": "Easy GPA", "major-progression": "Major Progression", "avoid-exams": "Avoid Final Exams", "practical-skills": "Practical Skills", balanced: "Balanced" };
const WORKLOAD_LABELS: Record<WorkloadPref, string> = { light: "Light", balanced: "Balanced", heavy: "Heavy" };
const SEMESTER_OPTIONS: PrefSemester[] = ["Semester 1", "Semester 2", "Summer School", "any"];

interface PlannerContentProps { allCourses: Course[] }

export function PlannerContent({ allCourses }: PlannerContentProps) {
  const [year, setYear] = useState<StudentYear>("second");
  const [major, setMajor] = useState<StudentMajor>("undecided");
  const [semester, setSemester] = useState<PrefSemester>("Semester 1");
  const [workload, setWorkload] = useState<WorkloadPref>("balanced");
  const [goal, setGoal] = useState<GoalType>("major-progression");
  const [refreshKey, setRefreshKey] = useState(0);

  const completedCodes = useMemo(() => readSet("uoa-course-planner:completed-courses"), [refreshKey]);
  const plannedCodes = useMemo(() => readSet("uoa-course-planner:plan"), [refreshKey]);
  const assumedCodes = useMemo(() => readSet("uoa-course-planner:assumed-courses"), [refreshKey]);

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
        <p className="text-sm font-bold uppercase tracking-normal text-fern">Smart Major Planner</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">Plan Your Semester</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Select your year, major, and preferences. We&apos;ll recommend courses that fit your degree pathway.
        </p>
      </div>

      {/* Controls */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-semibold text-slate-500">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value as StudentYear)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(YEAR_LABELS) as [StudentYear, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Major</label>
            <select value={major} onChange={(e) => setMajor(e.target.value as StudentMajor)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(MAJOR_LABELS) as [StudentMajor, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value as PrefSemester)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {SEMESTER_OPTIONS.map((s) => (<option key={s} value={s}>{s === "any" ? "Any" : s}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Workload</label>
            <select value={workload} onChange={(e) => setWorkload(e.target.value as WorkloadPref)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(WORKLOAD_LABELS) as [WorkloadPref, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value as GoalType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern">
              {(Object.entries(GOAL_LABELS) as [GoalType, string][]).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </div>
        </div>
      </section>

      {/* Ready Recommendations */}
      <section>
        <h2 className="text-xl font-bold text-ink">Recommended ({result.recommendations.length})</h2>
        {result.recommendations.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.recommendations.slice(0, 12).map((rec) => (
              <div key={rec.course.id} className="flex flex-col rounded-lg border border-emerald-200 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/courses/${rec.course.id}`} className="text-sm font-bold text-fern hover:underline">{rec.course.code}</Link>
                    <p className="text-sm font-semibold text-ink line-clamp-1">{rec.course.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Stage {rec.course.stage}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatPoints(rec.course.points)} pts | {formatSemesters(rec.course)}</p>
                {rec.reasons.length > 0 && (
                  <ul className="mt-2 space-y-0.5 border-t border-slate-100 pt-2">
                    {rec.reasons.map((r, i) => (<li key={i} className="text-xs text-slate-600">• {r}</li>))}
                  </ul>
                )}
                <button type="button" onClick={() => addToPlan(rec.course.id)}
                  className="mt-3 w-full rounded-lg bg-fern px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700">+ Add to My Plan</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              No courses match your current criteria.
            </p>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
              💡 Set your year and major in the Student Profile (My Plan page) to get better prerequisite checks and course recommendations.
            </p>
          </div>
        )}
      </section>

      {/* Not Ready Yet */}
      {result.notReady.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-amber-700">Not Ready Yet ({result.notReady.length})</h2>
          <p className="mt-1 text-sm text-slate-600">These fit your pathway but prerequisites are not yet satisfied.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.notReady.slice(0, 6).map((rec) => (
              <div key={rec.course.id} className="flex flex-col rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/courses/${rec.course.id}`} className="text-sm font-bold text-amber-800 hover:underline">{rec.course.code}</Link>
                    <p className="text-sm font-semibold text-ink line-clamp-1">{rec.course.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Stage {rec.course.stage}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatPoints(rec.course.points)} pts | {formatSemesters(rec.course)}</p>
                <div className="mt-2 rounded bg-white p-2 text-xs">
                  <p className="font-semibold text-amber-800">Missing:</p>
                  <p className="mt-0.5 text-amber-700">{rec.missingPrereqs.join(", ")}</p>
                  {rec.missingPrereqs.length > 0 && <p className="mt-1 text-amber-600">Take {rec.missingPrereqs[0]} first.</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
