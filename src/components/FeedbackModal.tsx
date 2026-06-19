"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

interface FeedbackModalProps {
  onClose: () => void;
}

const STORAGE_KEY = "uoa-course-planner:feedback";

type FeedbackType = "bug" | "course-error" | "feature" | "suggestion";

interface FeedbackEntry {
  type: FeedbackType;
  message: string;
  email: string;
  timestamp: string;
  page: string;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const t = useT();
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;

    const entry: FeedbackEntry = {
      type,
      message: message.trim(),
      email: email.trim(),
      timestamp: new Date().toISOString(),
      page: typeof window !== "undefined" ? window.location.pathname : ""
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch { /* ignore */ }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-white p-6 shadow-2xl text-center">
          <span className="text-3xl">✅</span>
          <h2 className="mt-3 text-lg font-bold text-ink">{t.feedback.success}</h2>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg bg-fern px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-ink">{t.feedback.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.feedback.description}</p>

        <div className="mt-5 space-y-4">
          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.feedback.typeLabel}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
            >
              <option value="bug">{t.feedback.typeBug}</option>
              <option value="course-error">{t.feedback.typeCourseError}</option>
              <option value="feature">{t.feedback.typeFeature}</option>
              <option value="suggestion">{t.feedback.typeSuggestion}</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.feedback.messageLabel}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t.feedback.messagePlaceholder}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern resize-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-500">{t.feedback.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.feedback.emailPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fern"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            {t.feedback.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="flex-1 rounded-lg bg-fern px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {t.feedback.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
