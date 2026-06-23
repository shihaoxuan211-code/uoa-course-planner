"use client";

import type { Course, ReviewRatings } from "@/types/course";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";
import { getDifficulty } from "@/lib/difficultyEstimator";
import { computeCourseIntelligence } from "@/lib/courseIntelligence";
import { computeGradeOutlook } from "@/lib/gradeOutlook";
import { getRecommendTags } from "@/lib/recommendedFor";
import { generateQuickVerdict } from "@/lib/quickVerdict";
import { useT, useLang } from "@/lib/i18n";
import { useFavorites } from "@/lib/useFavorites";
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

function MiniStat({ label, value, color = "" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`mt-0.5 text-xs font-semibold ${color || "text-ink"}`}>{value}</p>
    </div>
  );
}

export function SimpleCourseView({ course, review, onViewDetails }: SimpleCourseViewProps) {
  const t = useT();
  const { lang } = useLang();
  const { toggle, isFavorite } = useFavorites();
  const fav = isFavorite(course.id);
  const diffInfo = getDifficulty(course, review);
  const ci = computeCourseIntelligence(course);
  const outlook = computeGradeOutlook(course, review);
  const tags = getRecommendTags(course, review, lang);
  const isBasic = course.dataQuality === "basic";
  const verdict = isBasic
    ? (lang === "zh" ? "该课程目前仅收录基础信息，暂不进行难度、学习负担或成绩潜力评估。" : "This course currently has basic information only. Difficulty, workload and grade potential are not estimated.")
    : generateQuickVerdict(course, diffInfo.level, review, lang);
  const naText = lang === "zh" ? "信息暂缺" : "N/A";
  const yesText = t.courseCard.yes;
  const noText = t.courseCard.no;

  return (
    <div className="space-y-5">
      {/* Header — full width */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-fern">{course.code}</p>
            <h1 className="mt-2 text-xl font-bold leading-snug text-ink">{course.title}</h1>
          </div>
          <button type="button" onClick={() => toggle(course.id)}
            className={`shrink-0 rounded-xl border p-2 text-lg leading-none transition ${
              fav ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 bg-white text-slate-300 hover:text-rose-400 hover:border-rose-200"
            }`} title={fav ? "Remove from favorites" : "Add to favorites"}>
            {fav ? "♥" : "♡"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{translateStage(course.stage, lang)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{course.points > 0 ? `${formatPoints(course.points)} points` : (lang === "zh" ? "学分暂缺" : "Points unavailable")}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{translateSemesters(course.semesters, lang)}</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {isBasic ? (lang === "zh" ? "该课程目前只有基础信息。" : "Basic course information only.") : course.description}
        </p>
        {course.dataQuality === "basic" && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {t.courseDetail.basicRecordNotice}
          </div>
        )}
      </section>

      {/* Two-column — desktop only */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* LEFT — overview + assessment + reviews */}
        <div className="space-y-5 min-w-0">
          {/* Quick Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-ink">{t.simpleView.quickSummary}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
              <div className="flex flex-col justify-center rounded-lg bg-slate-50 p-3 min-h-[4.5rem]">
                <p className="text-xs text-slate-500">{t.simpleView.estimatedDifficulty}</p>
                <div className="mt-1">{isBasic ? <span className="text-xs text-slate-400">{naText}</span> : <><Stars value={diffInfo.level} />{diffInfo.source !== "real" && <span className="mt-0.5 block text-[10px] text-slate-400">{t.simpleView.estimated}</span>}</>}</div>
              </div>
              <div className="flex flex-col justify-center rounded-lg bg-slate-50 p-3 min-h-[4.5rem]">
                <p className="text-xs text-slate-500">{t.simpleView.workload}</p>
                <p className="mt-1 text-sm font-bold text-ink">{isBasic ? <span className="text-xs font-normal text-slate-400">{naText}</span> : <span className={ci.workload.level==="High"?"text-rose-700":ci.workload.level==="Medium"?"text-amber-700":"text-emerald-700"}>{ci.workload.icon} {lang === "zh" ? (ci.workload.level==="High"?"高":ci.workload.level==="Medium"?"中":"低") : ci.workload.level}</span>}</p>
              </div>
              <div className="flex flex-col justify-center rounded-lg bg-slate-50 p-3 min-h-[4.5rem]">
                <p className="text-xs text-slate-500">{t.simpleView.easyAPotential}</p>
                <p className="mt-1 text-sm font-bold text-ink">{isBasic ? <span className="text-xs font-normal text-slate-400">{naText}</span> : outlook.easyAIndex}</p>
              </div>
            </div>
          </section>

          {/* Assessment Snapshot */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-ink">{t.simpleView.assessmentSnapshot}</h2>
            {course.assessments.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
                {course.assessments.map((a) => (
                  <div key={a.type} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">{a.type}</span>
                    <span className="shrink-0 rounded-full bg-fern/10 px-3 py-1 text-xs font-semibold text-fern">{a.weight}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">{t.simpleView.assessmentUnavailable}</p>
            )}
          </section>

          {/* Student Reviews */}
          {review && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-base font-bold text-ink">{t.simpleView.studentReviews}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.simpleView.difficulty}</p><p className="mt-1"><Stars value={review.difficulty} /></p></div>
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.simpleView.workload}</p><p className="mt-1"><Stars value={review.workload} /></p></div>
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.simpleView.enjoyment}</p><p className="mt-1"><Stars value={review.enjoyment} /></p></div>
                <div className="rounded-lg bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">{t.simpleView.usefulness}</p><p className="mt-1"><Stars value={review.usefulness} /></p></div>
              </div>
            </section>
          )}

          {/* Quick Verdict */}
          <section className="rounded-xl border border-fern/30 bg-fern/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-normal text-fern">{t.simpleView.quickVerdict}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{verdict}</p>
          </section>
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-4">
          {/* Quick Facts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h3 className="text-sm font-bold text-ink">Quick Facts</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniStat label="Final Exam" value={isBasic ? naText : (course.hasFinalExam ? `📝 ${yesText}` : `🚫 ${noText}`)}
                color={isBasic?"":course.hasFinalExam?"text-amber-700":"text-emerald-700"} />
              <MiniStat label="Group Work" value={isBasic ? naText : (course.hasGroupWork ? `👥 ${yesText}` : `🚫 ${noText}`)}
                color={isBasic?"":course.hasGroupWork?"text-sky-700":"text-emerald-700"} />
              <MiniStat label="GPA Potential" value={isBasic ? naText : outlook.easyAIndex}
                color={isBasic?"":outlook.easyAIndex==="Easy"?"text-emerald-700":outlook.easyAIndex==="Moderate"?"text-sky-700":"text-amber-700"} />
              <MiniStat label="A Range" value={isBasic ? naText : outlook.aRangePotential}
                color={isBasic?"":outlook.aRangePotential==="High"?"text-emerald-700":outlook.aRangePotential==="Medium"?"text-sky-700":"text-amber-700"} />
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h3 className="text-sm font-bold text-ink">Actions</h3>
            <div className="mt-3"><AddCourseActions course={course} /></div>
          </div>

          {/* Suitable for */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h3 className="text-sm font-bold text-ink">{t.simpleView.recommendedFor}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {isBasic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  {lang === "zh" ? "仅基础信息" : "Basic info only"}
                </span>
              ) : tags.length > 0 ? (
                tags.slice(0, 5).map((tag) => (
                  <span key={tag.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {tag.icon} {tag.label}
                  </span>
                ))
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* View Full Details button */}
      <button type="button" onClick={onViewDetails}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50">
        {t.simpleView.viewFullDetails}
      </button>
    </div>
  );
}
