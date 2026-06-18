"use client";

import type { Course, ReviewRatings } from "@/types/course";
import { formatPoints, formatSemesters } from "@/lib/courseDisplay";
import { getDifficulty } from "@/lib/difficultyEstimator";
import { computeCourseIntelligence } from "@/lib/courseIntelligence";
import { computeGradeOutlook } from "@/lib/gradeOutlook";
import { getRecommendTags } from "@/lib/recommendedFor";
import { generateQuickVerdict } from "@/lib/quickVerdict";
import { useT, useLang } from "@/lib/i18n";
import { AddCourseActions } from "@/components/AddCourseActions";

interface SimpleCourseViewProps {
  course: Course;
  review?: ReviewRatings;
  onViewDetails: () => void;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400 text-sm">
      {Array.from({ length: 5 }, (_, i) => (<span key={i}>{i < value ? "★" : "☆"}</span>))}
    </span>
  );
}

export function SimpleCourseView({ course, review, onViewDetails }: SimpleCourseViewProps) {
  const t = useT();
  const { lang } = useLang();
  const diffInfo = getDifficulty(course, review);
  const ci = computeCourseIntelligence(course);
  const outlook = computeGradeOutlook(course, review);
  const tags = getRecommendTags(course, review, lang);
  const verdict = generateQuickVerdict(course, diffInfo.level, review, lang);

  return (
    <div className="mx-auto max-w-3xl space-y-4 lg:max-w-4xl">
      {/* 1. Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-sm font-bold text-fern">{course.code}</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{course.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">Stage {course.stage}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{formatPoints(course.points)} points</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{formatSemesters(course)}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{course.description}</p>
      </section>

      {/* 2. Quick Summary — 2-col mobile, 3-col desktop */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">{t.simpleView.quickSummary}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.estimatedDifficulty}</p>
            <p className="mt-1"><Stars value={diffInfo.level} /></p>
            {diffInfo.source === "real" ? null : (
              <p className="mt-0.5 text-[10px] text-slate-400">{t.simpleView.estimated}</p>
            )}
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.workload}</p>
            <p className={`mt-1 text-sm font-bold ${ci.workload.level==="High"?"text-rose-700":ci.workload.level==="Medium"?"text-amber-700":"text-emerald-700"}`}>
              {ci.workload.icon} {ci.workload.level}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.easyAPotential}</p>
            <p className="mt-1 text-sm font-bold text-ink">{outlook.easyAIndex}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.finalExam}</p>
            <p className="mt-1 text-sm font-bold text-ink">{course.hasFinalExam ? "📝 Yes" : "🚫 No"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.groupWork}</p>
            <p className="mt-1 text-sm font-bold text-ink">{course.hasGroupWork ? "👥 Yes" : "🚫 No"}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t.simpleView.aRangePotential}</p>
            <p className={`mt-1 text-sm font-bold ${outlook.aRangePotential==="High"?"text-emerald-700":outlook.aRangePotential==="Medium"?"text-sky-700":"text-amber-700"}`}>
              {outlook.aRangePotential}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Assessment Snapshot */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">{t.simpleView.assessmentSnapshot}</h2>
        {course.assessments.length > 0 ? (
          <div className="mt-3 space-y-2">
            {course.assessments.map((a) => (
              <div key={a.type} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{a.type}</span>
                <span className="rounded-full bg-fern/10 px-2.5 py-0.5 text-xs font-semibold text-fern">{a.weight}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">{t.simpleView.assessmentUnavailable}</p>
        )}
      </section>

      {/* 4. Recommended For */}
      {tags.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-base font-bold text-ink">{t.simpleView.recommendedFor}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                {tag.icon} {tag.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 5. Student Review Snapshot */}
      {review && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-base font-bold text-ink">{t.simpleView.studentReviews}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">{t.simpleView.difficulty}</p>
              <p className="mt-1"><Stars value={review.difficulty} /></p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">{t.simpleView.workload}</p>
              <p className="mt-1"><Stars value={review.workload} /></p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">{t.simpleView.enjoyment}</p>
              <p className="mt-1"><Stars value={review.enjoyment} /></p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">{t.simpleView.usefulness}</p>
              <p className="mt-1"><Stars value={review.usefulness} /></p>
            </div>
          </div>
        </section>
      )}

      {/* 6. Quick Verdict */}
      <section className="rounded-lg border border-fern/30 bg-fern/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-normal text-fern">{t.simpleView.quickVerdict}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{verdict}</p>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <AddCourseActions course={course} />
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
        >
          {t.simpleView.viewFullDetails}
        </button>
      </div>
    </div>
  );
}
