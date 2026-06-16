"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { formatPoints, formatSemesters } from "@/lib/courseDisplay";
import { PLAN_STORAGE_KEY } from "@/lib/storageKeys";
import { useLocalStorageList } from "@/lib/useLocalStorageList";
import { checkPrerequisites } from "@/lib/prerequisites";
import type { PrerequisiteCheck } from "@/lib/prerequisites";

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

function PrereqBadge({ check }: { check: PrerequisiteCheck }) {
  if (check.met === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        ✓ Met
      </span>
    );
  }

  if (check.met === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        ⚠ Missing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
      ? Unknown format
    </span>
  );
}

function PrereqDetail({
  check,
  course,
  expanded,
  onToggle,
}: {
  check: PrerequisiteCheck;
  course: Course;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (check.met === true && check.description === "No prerequisites") return null;

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
          {check.met === true && (
            <p className="text-emerald-700">{check.description}</p>
          )}
          {check.met === false && (
            <div>
              <p className="font-semibold text-amber-800">Missing:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-700">
                {check.missingCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}
          {check.met === null && (
            <p className="text-slate-500">{check.description}</p>
          )}
          <p className="mt-2 text-slate-400">Source: {course.prerequisites}</p>
        </div>
      )}
    </div>
  );
}

export function PlanSummary({ courses }: PlanSummaryProps) {
  const plan = useLocalStorageList(PLAN_STORAGE_KEY);
  const plannedCourses = courses.filter((course) => plan.items.includes(course.id));
  const totalPoints = plannedCourses.reduce((sum, course) => sum + course.points, 0);
  const bySemester = groupCourses(plannedCourses, (course) => formatSemesters(course).replaceAll(", ", " / "));
  const byStage = groupCourses(plannedCourses, (course) => `Stage ${course.stage}`);

  const [expandedPrereqs, setExpandedPrereqs] = useState<Set<string>>(new Set());

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

  // Compute prerequisite checks for all planned courses
  const plannedCodes = new Set(plannedCourses.map((c) => c.code));
  const prereqChecks = new Map<string, PrerequisiteCheck>();
  plannedCourses.forEach((course) => {
    prereqChecks.set(course.id, checkPrerequisites(course, plannedCodes));
  });

  // Statistics
  const prereqMet = plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.met === true
  ).length;
  const prereqMissing = plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.met === false
  ).length;
  const prereqUnknown = plannedCourses.filter(
    (c) => prereqChecks.get(c.id)?.met === null
  ).length;

  // Per-semester points
  const semesterPoints = Object.entries(bySemester).map(([semester, group]) => ({
    semester,
    points: group.reduce((sum, c) => sum + c.points, 0),
    count: group.length,
  }));

  const FULL_TIME_THRESHOLD = 60;

  if (!plan.isReady) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">Loading plan...</div>;
  }

  if (plannedCourses.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-card">
        <h2 className="text-xl font-bold text-ink">Your plan is empty</h2>
        <p className="mt-2 text-sm text-slate-600">Add courses from the Courses page to build a local plan.</p>
        <Link
          href="/courses"
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Browse courses
        </Link>
      </section>
    );
  }

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
            <p className="text-sm font-semibold text-slate-600">Current Points</p>
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
                ✓ Full-time load met
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                ⚠ {FULL_TIME_THRESHOLD - totalPoints} points below full-time ({FULL_TIME_THRESHOLD})
              </span>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {plannedCourses.length} course{plannedCourses.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>
      </section>

      {/* Semester points breakdown */}
      {semesterPoints.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">Points by semester</h2>
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
          <p className="text-sm font-semibold text-slate-500">Planned courses</p>
          <p className="mt-2 text-3xl font-bold text-ink">{plannedCourses.length}</p>
        </div>
        <div
          className={`rounded-lg border p-5 shadow-card ${
            totalPoints >= FULL_TIME_THRESHOLD
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-amber-200 bg-amber-50/50"
          }`}
        >
          <p className="text-sm font-semibold text-slate-500">Total points</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              totalPoints >= FULL_TIME_THRESHOLD ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {totalPoints}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-500">Prerequisites</p>
          <div className="mt-2 flex items-center gap-3">
            {prereqMet > 0 && (
              <span className="text-sm font-bold text-emerald-700">✓ {prereqMet}</span>
            )}
            {prereqMissing > 0 && (
              <span className="text-sm font-bold text-amber-700">⚠ {prereqMissing}</span>
            )}
            {prereqUnknown > 0 && (
              <span className="text-sm font-bold text-slate-500">? {prereqUnknown}</span>
            )}
            {prereqMet === plannedCourses.length && (
              <span className="text-sm font-bold text-emerald-700">All met</span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-500">Storage</p>
          <p className="mt-2 text-base font-bold text-ink">Saved in this browser</p>
        </div>
      </section>

      {/* Course list */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-ink">Selected courses</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {plannedCourses.map((course) => {
            const check = prereqChecks.get(course.id);
            return (
              <div key={course.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{course.code}</p>
                    {check && <PrereqBadge check={check} />}
                  </div>
                  <p className="text-sm text-slate-600">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatPoints(course.points)} points | {formatSemesters(course)} | Stage {course.stage}
                  </p>
                  {check && (
                    <PrereqDetail
                      check={check}
                      course={course}
                      expanded={expandedPrereqs.has(course.id)}
                      onToggle={() => togglePrereq(course.id)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => plan.remove(course.id)}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Semester & Stage groups */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-ink">Grouped by semester offered</h2>
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
          <h2 className="text-xl font-bold text-ink">Grouped by stage</h2>
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
