"use client";

import type { ExamMode } from "@/types/course";
import { examModeDetails } from "@/lib/exam";
import { useT } from "@/lib/i18n";

interface ExamModeBadgeProps {
  mode?: ExamMode;
  showDescription?: boolean;
}

export function ExamModeBadge({ mode, showDescription = false }: ExamModeBadgeProps) {
  const t = useT();

  if (!mode) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
        {t.examModeBadge.notInS1}
      </span>
    );
  }

  const detail = examModeDetails[mode];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${detail.className}`}
      title={detail.label}
    >
      {showDescription ? detail.label : detail.shortLabel}
    </span>
  );
}
