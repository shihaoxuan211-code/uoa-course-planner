"use client";

import { useT } from "@/lib/i18n";

interface PrerequisiteWarningModalProps {
  courseCode: string;
  missingCodes: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function PrerequisiteWarningModal({
  courseCode,
  missingCodes,
  onCancel,
  onConfirm
}: PrerequisiteWarningModalProps) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h2 className="text-lg font-bold text-rose-700">{t.prereqWarning.title}</h2>
        </div>

        {/* Message */}
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {t.prereqWarning.message}
        </p>

        {/* Missing list */}
        <div className="mt-3 rounded-lg bg-rose-50 p-3">
          <p className="text-xs font-semibold text-rose-800">
            {t.prereqWarning.missingPrereqs}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {missingCodes.map((code) => (
              <li key={code} className="text-sm font-medium text-rose-700">
                {code}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {t.prereqWarning.canStillAdd}
        </p>

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            {t.prereqWarning.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            {t.prereqWarning.addAnyway}
          </button>
        </div>
      </div>
    </div>
  );
}
