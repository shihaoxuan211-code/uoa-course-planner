"use client";

import { useState } from "react";
import type { Course } from "@/types/course";
import { COMPARE_STORAGE_KEY, PLAN_STORAGE_KEY } from "@/lib/storageKeys";
import { useLocalStorageList } from "@/lib/useLocalStorageList";
import { useT } from "@/lib/i18n";

interface AddCourseActionsProps {
  course: Pick<Course, "id" | "code">;
  compact?: boolean;
}

export function AddCourseActions({ course, compact = false }: AddCourseActionsProps) {
  const t = useT();
  const plan = useLocalStorageList(PLAN_STORAGE_KEY);
  const compare = useLocalStorageList(COMPARE_STORAGE_KEY, { maxItems: 4 });
  const [notice, setNotice] = useState("");

  const addToPlan = () => {
    const result = plan.add(course.id);
    setNotice(result === "exists" ? `${course.code} ${t.addActions.alreadyInPlan}` : `${course.code} ${t.addActions.addedToPlan}`);
  };

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
          onClick={addToPlan}
          disabled={!plan.isReady || plan.contains(course.id)}
          className={`${buttonClass} bg-fern text-white hover:bg-emerald-700`}
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
    </div>
  );
}
