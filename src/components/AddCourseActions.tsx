"use client";

import { useState } from "react";
import type { Course } from "@/types/course";
import { COMPARE_STORAGE_KEY, PLAN_STORAGE_KEY } from "@/lib/storageKeys";
import { useLocalStorageList } from "@/lib/useLocalStorageList";

interface AddCourseActionsProps {
  course: Pick<Course, "id" | "code">;
  compact?: boolean;
}

export function AddCourseActions({ course, compact = false }: AddCourseActionsProps) {
  const plan = useLocalStorageList(PLAN_STORAGE_KEY);
  const compare = useLocalStorageList(COMPARE_STORAGE_KEY, { maxItems: 4 });
  const [notice, setNotice] = useState("");

  const addToPlan = () => {
    const result = plan.add(course.id);
    setNotice(result === "exists" ? `${course.code} is already in My Plan.` : `${course.code} added to My Plan.`);
  };

  const addToCompare = () => {
    const result = compare.add(course.id);
    if (result === "max") {
      setNotice("You can compare up to 4 courses. Remove one before adding another.");
      return;
    }

    setNotice(
      result === "exists" ? `${course.code} is already in Compare.` : `${course.code} added to Compare.`
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
          {plan.contains(course.id) ? "In Plan" : "Add to Plan"}
        </button>
        <button
          type="button"
          onClick={addToCompare}
          disabled={!compare.isReady || compare.contains(course.id)}
          className={`${buttonClass} bg-ink text-white hover:bg-slate-800`}
        >
          {compare.contains(course.id) ? "In Compare" : "Add to Compare"}
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
