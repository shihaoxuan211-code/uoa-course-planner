"use client";

import { useEffect, useState, useCallback } from "react";
import type { Course } from "@/types/course";
import { checkPrerequisites } from "@/lib/prerequisites";
import type { PrerequisiteCheck } from "@/lib/prerequisites";
import { COMPLETED_COURSES_KEY, ASSUMED_COURSES_KEY, PLAN_STORAGE_KEY } from "@/lib/storageKeys";
import { useT } from "@/lib/i18n";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : []);
  } catch { return new Set(); }
}

interface PrereqStatusBadgeProps {
  course: Course;
}

export function PrereqStatusBadge({ course }: PrereqStatusBadgeProps) {
  const t = useT();
  const [check, setCheck] = useState<PrerequisiteCheck | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const completed = readSet(COMPLETED_COURSES_KEY);
    const assumed = readSet(ASSUMED_COURSES_KEY);
    const planned = readSet(PLAN_STORAGE_KEY);
    const result = checkPrerequisites(course, completed, assumed, planned);
    setCheck(result);
  }, [course, refreshKey]);

  const markCompleted = useCallback((code: string) => {
    const current = readSet(COMPLETED_COURSES_KEY);
    current.add(code);
    try {
      localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify([...current]));
    } catch { /* ignore */ }
    setRefreshKey((k) => k + 1);
  }, []);

  if (!check) {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-slate-600">{t.prereq.heading}</p>
        <p className="mt-2 text-xs text-slate-400">{t.prereq.loading}</p>
      </div>
    );
  }
  if (!course.prerequisites || course.prerequisites === "Information unavailable") return null;

  return (
    <div className="rounded-lg bg-slate-50 p-4 text-sm">
      <p className="font-semibold text-slate-600">{t.prereq.heading}</p>
      <div className="mt-2">
        {check.status === "met" && (
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              ✓ {t.prereq.met}
            </span>
            {check.metBy.length > 0 && (
              <p className="mt-2 text-xs text-emerald-700">
                {t.prereq.satisfiedBy} {check.metBy.join(", ")}
              </p>
            )}
          </div>
        )}
        {check.status === "assumed" && (
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              ⚠ {t.prereq.assumed}
            </span>
            {check.assumedBy.length > 0 && (
              <p className="mt-2 text-xs text-amber-700">
                {t.prereq.assumedFromProfile} {check.assumedBy.join(", ")}
              </p>
            )}
            {check.metBy.length > 0 && (
              <p className="mt-1 text-xs text-emerald-700">
                {t.prereq.satisfiedBy} {check.metBy.join(", ")}
              </p>
            )}
            <p className="mt-2 text-xs italic text-amber-600">
              {t.prereq.assumeNote}
            </p>
          </div>
        )}
        {check.status === "missing" && (
          <div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 mb-3">
              <p className="text-xs font-semibold text-rose-800">
                ⚠️ {t.prereqWarning.mayNeed}
              </p>
              {check.missingCodes.length > 0 && (
                <ul className="mt-1.5 space-y-1.5">
                  {check.missingCodes.map((code) => (
                    <li key={code} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-rose-700">{code}</span>
                      <button
                        type="button"
                        onClick={() => markCompleted(code)}
                        className="shrink-0 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:border-emerald-400"
                      >
                        ✓ {t.prereqWarning.markCompleted}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              ✗ {t.prereq.missing}
            </span>
            {check.missingCodes.length > 0 && (
              <p className="mt-2 text-xs text-rose-700">
                {t.prereq.notSatisfied} {check.missingCodes.join(", ")}
              </p>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {t.prereq.checkedAgainst}
        </p>
      </div>
    </div>
  );
}
