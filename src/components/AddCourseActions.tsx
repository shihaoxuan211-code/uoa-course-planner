"use client";

import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/types/course";
import { COMPARE_STORAGE_KEY, PLAN_STORAGE_KEY, COMPLETED_COURSES_KEY, ASSUMED_COURSES_KEY } from "@/lib/storageKeys";
import { useLocalStorageList } from "@/lib/useLocalStorageList";
import { checkPrerequisites } from "@/lib/prerequisites";
import type { PrerequisiteCheck } from "@/lib/prerequisites";
import { useT } from "@/lib/i18n";
import { PrerequisiteWarningModal } from "@/components/PrerequisiteWarningModal";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : []);
  } catch { return new Set(); }
}

interface AddCourseActionsProps {
  course: Pick<Course, "id" | "code" | "prerequisites">;
  compact?: boolean;
}

export function AddCourseActions({ course, compact = false }: AddCourseActionsProps) {
  const t = useT();
  const plan = useLocalStorageList(PLAN_STORAGE_KEY);
  const compare = useLocalStorageList(COMPARE_STORAGE_KEY, { maxItems: 4 });
  const [notice, setNotice] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [missingPrereqs, setMissingPrereqs] = useState<string[]>([]);

  // Pre-compute prerequisite check
  const [prereqCheck, setPrereqCheck] = useState<PrerequisiteCheck | null>(null);
  useEffect(() => {
    const completed = readSet(COMPLETED_COURSES_KEY);
    const assumed = readSet(ASSUMED_COURSES_KEY);
    const planned = readSet(PLAN_STORAGE_KEY);
    const result = checkPrerequisites(
      { prerequisites: course.prerequisites } as Course,
      completed,
      assumed,
      planned
    );
    setPrereqCheck(result);
  }, [course.prerequisites]);

  const handleAddToPlan = useCallback(() => {
    if (plan.contains(course.id)) {
      setNotice(`${course.code} ${t.addActions.alreadyInPlan}`);
      return;
    }

    // Check prerequisites
    if (prereqCheck && prereqCheck.status === "missing" && prereqCheck.missingCodes.length > 0) {
      setMissingPrereqs(prereqCheck.missingCodes);
      setShowModal(true);
      return;
    }

    // No missing prereqs — add directly
    plan.add(course.id);
    setNotice(`${course.code} ${t.addActions.addedToPlan}`);
  }, [course, plan, prereqCheck, t]);

  const handleConfirmAddAnyway = useCallback(() => {
    setShowModal(false);
    plan.add(course.id);
    setNotice(`${course.code} ${t.addActions.addedToPlan} — ${t.prereqWarning.missingBadge}`);
  }, [course, plan, t]);

  const handleCancelModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const addToCompare = () => {
    const result = compare.add(course.id);
    if (result === "max") {
      setNotice(t.addActions.compareLimit);
      return;
    }
    setNotice(
      result === "exists" ? `${course.code} ${t.addActions.alreadyInCompare}` : `${course.code} ${t.addActions.addedToCompare}`
    );
  };

  const buttonClass =
    "rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAddToPlan}
          disabled={!plan.isReady}
          className={`${buttonClass} ${plan.contains(course.id) ? "bg-slate-300 text-slate-600" : "bg-fern text-white hover:bg-emerald-700"}`}
        >
          {plan.contains(course.id) ? t.addActions.inPlan : t.addActions.addToPlan}
        </button>
        <button
          type="button"
          onClick={addToCompare}
          disabled={!compare.isReady || compare.contains(course.id)}
          className={`${buttonClass} bg-ink text-white hover:bg-slate-800`}
        >
          {compare.contains(course.id) ? t.addActions.inCompare : t.addActions.addToCompare}
        </button>
      </div>
      {notice ? (
        <p className="text-xs font-medium text-slate-600" role="status">
          {notice}
        </p>
      ) : null}

      {/* Prerequisite Warning Modal */}
      {showModal && (
        <PrerequisiteWarningModal
          courseCode={course.code}
          missingCodes={missingPrereqs}
          onCancel={handleCancelModal}
          onConfirm={handleConfirmAddAnyway}
        />
      )}
    </div>
  );
}
