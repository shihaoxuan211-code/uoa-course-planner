"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { formatPoints, formatSemesters, translateSemesters, translateStage } from "@/lib/courseDisplay";
import { PLAN_STORAGE_KEY, COMPLETED_COURSES_KEY, ASSUMED_COURSES_KEY, STUDENT_YEAR_KEY, STUDENT_MAJOR_KEY } from "@/lib/storageKeys";
import { getAssumedReason, YEAR_LABELS, MAJOR_LABELS } from "@/lib/studentProfile";
import type { StudentYear, StudentMajor } from "@/lib/studentProfile";
import { useLocalStorageList } from "@/lib/useLocalStorageList";
import { checkPrerequisites } from "@/lib/prerequisites";
import type { PrerequisiteCheck, PrerequisiteStatus } from "@/lib/prerequisites";
import { useT, useLang } from "@/lib/i18n";

interface PlanSummaryProps {
  courses: Course[];
}

function groupCourses(courses: Course[], getKey: (course: Course) => string) {
  return courses.reduce<Record<string, Course[]>>((acc, course) => {
    const key = getKey(course);
    const existing = acc[key];
    if (existing) {
      existing.push(course);
    } else {
      acc[key] = [course];
    }
    return acc;
  }, {});
}

function readLocalStorageSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((s): s is string => typeof s === "string"));
  } catch { return new Set(); }
}

function PrereqBadge({ status, t }: { status: PrerequisiteStatus; t: { met: string; assumed: string; missing: string } }) {
  if (status === "met") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        ✓ {t.met}
      </span>
    );
  }
  if (status === "assumed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        ⚠ {t.assumed}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
      ✗ {t.missing}
    </span>
  );
}

function PrereqDetail({
  check,
  course,
  expanded,
  onToggle,
  t,
}: {
  check: PrerequisiteCheck;
  course: Course;
  expanded: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useT>["plan"] & ReturnType<typeof useT>["prereq"];
}) {
  if (check.status === "met" && check.description === "No prerequisites") return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="text-xs font-medium text-slate-500 underline decoration-dotted underline-offset-2 transition hover:text-ink"
      >
        {expanded ? "Hide details" : "View details"}
      </button>
      {expanded && (
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs">
          {check.status === "met" && check.metBy.length > 0 && (
            <div>
              <p className="font-semibold text-emerald-700">{t.metBy}</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-emerald-700">
                {check.metBy.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}
          {check.status === "assumed" && (
            <div>
              {check.metBy.length > 0 && (
                <div className="mb-2">
                  <p className="font-semibold text-emerald-700">Already satisfied:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-emerald-700">
                    {check.metBy.map((code) => (
                      <li key={code}>{code}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="font-semibold text-amber-800">{t.assumedFromProfile}</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-700">
                {check.assumedBy.map((code) => {
                  const storedYear = (typeof window !== "undefined"
                    ? (localStorage.getItem(STUDENT_YEAR_KEY) as StudentYear) || "first"
                    : "first") as StudentYear;
                  const storedMajor = (typeof window !== "undefined"
                    ? (localStorage.getItem(STUDENT_MAJOR_KEY) as StudentMajor) || "undecided"
                    : "undecided") as StudentMajor;
                  const reason = getAssumedReason(code, storedYear, storedMajor);
                  return (
                    <li key={code}>{code} — {reason}</li>
                  );
                })}
              </ul>
            </div>
          )}
          {check.status === "missing" && (
            <div>
              <p className="font-semibold text-rose-800">{t.notSatisfied}</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-rose-700">
                {check.missingCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
              {check.metBy.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">{t.partiallySatisfied} {check.metBy.join(", ")}</p>
              )}
            </div>
          )}
          {!check.parseable && (
            <p className="text-slate-500">{check.description}</p>
          )}
          <p className="mt-2 text-slate-400">{t.source} {course.prerequisites}</p>
        </div>
      )}
    </div>
  );
}

export function PlanSummary({ courses }: PlanSummaryProps) {
  const t = useT();
  const { lang } = useLang();
  const plan = useLocalStorageList(PLAN_STORAGE_KEY);
  const plannedCourses = courses.filter((course) => plan.items.includes(course.id));
  const totalPoints = plannedCourses.reduce((sum, course) => sum + course.points, 0);
  const bySemester = groupCourses(plannedCourses, (course) => formatSemesters(course).replaceAll(", ", " / "));
  const byStage = groupCourses(plannedCourses, (course) => `Stage ${course.stage}`);

  const [expandedPrereqs, setExpandedPrereqs] = useState<Set<string>>(new Set());
  const [profileReady, setProfileReady] = useState(false);
  const [prereqRefreshKey, setPrereqRefreshKey] = useState(0);

  useEffect(() => { setProfileReady(true); }, []);

  const togglePrereq = (courseId: string) => {
    setExpandedPrereqs((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  // Quick-confirm: mark a course code as completed
  const markCompleted = (code: string) => {
    const current = readLocalStorageSet(COMPLETED_COURSES_KEY);
    current.add(code);
    try {
      localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify([...current]));
    } catch { /* ignore */ }
    setPrereqRefreshKey((k) => k + 1);
  };

  const completedCodes = profileReady ? readLocalStorageSet(COMPLETED_COURSES_KEY) : new Set<string>();
  const assumedCodes = profileReady ? readLocalStorageSet(ASSUMED_COURSES_KEY) : new Set<string>();
  const plannedCodes = new Set(plannedCourses.map((c) => c.code));

  const prereqChecks = new Map<string, PrerequisiteCheck>();
  if (profileReady) {
    plannedCourses.forEach((course) => {
      prereqChecks.set(
        course.id,
        checkPrerequisites(course, completedCodes, assumedCodes, plannedCodes)
      );
    });
  }

  const prereqMet = profileReady ? plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.status === "met"
  ).length : 0;
  const prereqAssumed = profileReady ? plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.status === "assumed"
  ).length : 0;
  const prereqMissing = profileReady ? plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.status === "missing"
  ).length : 0;

  const semesterPoints = Object.entries(bySemester).map(([semester, group]) => ({
    semester,
    points: group.reduce((sum, c) => sum + c.points, 0),
    count: group.length,
  }));

  const FULL_TIME_THRESHOLD = 60;

  if (!plan.isReady) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">{t.plan.loading}</div>;
  }

  if (plannedCourses.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.plan.empty}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.plan.emptyDesc}</p>
        <Link
          href="/courses"
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {t.plan.browseCourses}
        </Link>
      </section>
    );
  }

  const detailT = { ...t.plan, ...t.prereq };

  return (
    <div className="space-y-6">
      {/* Current Points Banner */}
      <section
        className={`rounded-lg border-2 p-6 shadow-card ${
          totalPoints >= FULL_TIME_THRESHOLD
            ? "border-emerald-300 bg-emerald-50"
            : "border-amber-300 bg-amber-50"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">{t.plan.currentPoints}</p>
            <p
              className={`mt-1 text-4xl font-bold ${
                totalPoints >= FULL_TIME_THRESHOLD ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {totalPoints}
            </p>
          </div>
          <div className="text-right">
            {totalPoints >= FULL_TIME_THRESHOLD ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                ✓ {t.plan.fullTimeMet}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                ⚠ {FULL_TIME_THRESHOLD - totalPoints} {t.plan.pointsBelow} ({FULL_TIME_THRESHOLD})
              </span>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {plannedCourses.length} course{plannedCourses.length !== 1 ? "s" : ""} {t.plan.coursesSelected}
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisite Warning Box */}
      {profileReady && prereqMissing > 0 && (
        <section className="rounded-lg border-2 border-rose-300 bg-rose-50 p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-800">{t.prereqWarning.warningBox}</p>
              <ul className="mt-2 space-y-2">
                {plannedCourses
                  .filter((c) => prereqChecks.get(c.id)?.status === "missing")
                  .map((c) => {
                    const check = prereqChecks.get(c.id);
                    return (
                      <li key={c.id}>
                        <span className="text-sm text-rose-700">
                          <span className="font-semibold">{c.code}</span>
                          {check && check.missingCodes.length > 0 && (
                            <span className="text-rose-600"> — {check.missingCodes.join(", ")}</span>
                          )}
                        </span>
                        {check && check.missingCodes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {check.missingCodes.map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => markCompleted(code)}
                                className="inline-flex items-center rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:border-emerald-400"
                              >
                                ✓ {code} — {t.prereqWarning.markCompleted}
                              </button>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Semester points breakdown */}
      {semesterPoints.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">{t.plan.pointsBySemester}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {semesterPoints.map(({ semester, points, count }) => {
              const pct = totalPoints > 0 ? Math.round((points / totalPoints) * 100) : 0;
              return (
                <div key={semester} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-ink">{semester}</p>
                  <p className="mt-1 text-2xl font-bold text-ink">{points}</p>
                  <p className="text-xs text-slate-500">
                    points &middot; {count} course{count !== 1 ? "s" : ""} &middot; {pct}%
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-fern transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-500">{t.plan.plannedCourses}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{plannedCourses.length}</p>
        </div>
        <div
          className={`rounded-lg border p-5 shadow-card ${
            totalPoints >= FULL_TIME_THRESHOLD
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <p className="text-sm font-semibold text-slate-500">{t.plan.totalPoints}</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              totalPoints >= FULL_TIME_THRESHOLD ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {totalPoints}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-500">{t.plan.prerequisites}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {prereqMet > 0 && (
              <span className="text-sm font-bold text-emerald-700">✓ {prereqMet}</span>
            )}
            {prereqAssumed > 0 && (
              <span className="text-sm font-bold text-amber-700">⚠ {prereqAssumed}</span>
            )}
            {prereqMissing > 0 && (
              <span className="text-sm font-bold text-rose-700">✗ {prereqMissing}</span>
            )}
            {prereqMet === plannedCourses.length && (
              <span className="text-sm font-bold text-emerald-700">{t.plan.allMet}</span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-500">{t.plan.storage}</p>
          <p className="mt-2 text-base font-bold text-ink">{t.plan.storageBrowser}</p>
        </div>
      </section>

      {/* Course list */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t.plan.selectedCourses}</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {plannedCourses.map((course) => {
            const check = prereqChecks.get(course.id);
            return (
              <div key={course.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{course.code}</p>
                    {profileReady && check ? (
                      <PrereqBadge status={check.status} t={t.prereq} />
                    ) : !profileReady ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                        {t.plan.loadingStatus}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-600">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatPoints(course.points)} points | {translateSemesters(course.semesters, lang)} | {translateStage(course.stage, lang)}
                  </p>
                  {check && (
                    <PrereqDetail
                      check={check}
                      course={course}
                      expanded={expandedPrereqs.has(course.id)}
                      onToggle={() => togglePrereq(course.id)}
                      t={detailT}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => plan.remove(course.id)}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  {t.plan.remove}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Semester & Stage groups */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-ink">{t.plan.groupedBySemester}</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(bySemester).map(([semester, group]) => {
              const groupPoints = group.reduce((sum, c) => sum + c.points, 0);
              return (
                <div key={semester} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{semester}</p>
                    <p className="text-sm font-bold text-fern">{groupPoints} pts</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {group.map((course) => course.code).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-ink">{t.plan.groupedByStage}</h2>
          <div className="mt-4 space-y-4">
            {Object.entries(byStage).map(([stage, group]) => {
              const stagePoints = group.reduce((sum, c) => sum + c.points, 0);
              return (
                <div key={stage} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{stage}</p>
                    <p className="text-sm font-bold text-fern">{stagePoints} pts</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {group.map((course) => course.code).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
