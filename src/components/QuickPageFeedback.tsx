"use client";

import { useState, useEffect } from "react";
import { useT } from "@/lib/i18n";

interface QuickPageFeedbackProps {
  pageId: string;
}

const STORAGE_PREFIX = "uoa-course-planner:page-feedback:";

export function QuickPageFeedback({ pageId }: QuickPageFeedbackProps) {
  const t = useT();
  const [voted, setVoted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const storageKey = `${STORAGE_PREFIX}${pageId}`;

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) {
      setVoted(true);
    }
  }, [storageKey]);

  const handleVote = (value: "helpful" | "needs-improvement") => {
    if (voted) return;
    setVoted(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ value, timestamp: new Date().toISOString() }));
    } catch { /* ignore */ }
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-card">
      {showThanks ? (
        <p className="text-sm font-semibold text-emerald-700">{t.quickFeedback.thanks}</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-600">{t.quickFeedback.question}</p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleVote("helpful")}
              disabled={voted}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
            >
              {t.quickFeedback.helpful}
            </button>
            <button
              type="button"
              onClick={() => handleVote("needs-improvement")}
              disabled={voted}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:border-rose-400 hover:bg-rose-50 disabled:opacity-50"
            >
              {t.quickFeedback.needsImprovement}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
