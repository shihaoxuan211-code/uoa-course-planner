"use client";

import type { CourseReview } from "@/types/course";
import { useT } from "@/lib/i18n";

interface ReviewSectionProps {
  review: CourseReview;
}

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < value ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export function ReviewSection({ review }: ReviewSectionProps) {
  const t = useT();
  const { ratings, positiveComments, negativeComments, tipsForFutureStudents } = review;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-ink">{t.reviews.heading}</h2>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
          {t.reviews.demoBadge}
        </span>
      </div>

      {/* Ratings */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{t.reviews.difficulty}</p>
          <p className="mt-1 text-lg"><Stars value={ratings.difficulty} /></p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{t.reviews.workload}</p>
          <p className="mt-1 text-lg"><Stars value={ratings.workload} /></p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{t.reviews.enjoyment}</p>
          <p className="mt-1 text-lg"><Stars value={ratings.enjoyment} /></p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{t.reviews.usefulness}</p>
          <p className="mt-1 text-lg"><Stars value={ratings.usefulness} /></p>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {positiveComments.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-emerald-700">{t.reviews.positiveComments}</h3>
            <ul className="mt-2 space-y-1.5">
              {positiveComments.map((comment, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 shrink-0 text-emerald-500">+</span>
                  <span>{comment}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {negativeComments.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-rose-700">{t.reviews.negativeComments}</h3>
            <ul className="mt-2 space-y-1.5">
              {negativeComments.map((comment, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 shrink-0 text-rose-500">−</span>
                  <span>{comment}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tips */}
      {tipsForFutureStudents && (
        <div className="mt-5 rounded-lg bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-800">{t.reviews.tips}</h3>
          <p className="mt-1 text-sm leading-6 text-amber-900">{tipsForFutureStudents}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        {t.reviews.disclaimer}
      </p>
    </section>
  );
}
