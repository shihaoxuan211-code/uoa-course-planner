import type { ExamMode } from "@/types/course";
import { examModeDetails } from "@/lib/exam";

interface ExamModeBadgeProps {
  mode?: ExamMode;
  showDescription?: boolean;
}

export function ExamModeBadge({ mode, showDescription = false }: ExamModeBadgeProps) {
  if (!mode) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
        No exam data
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
