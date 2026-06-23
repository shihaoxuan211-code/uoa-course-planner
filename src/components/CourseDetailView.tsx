"use client";

import { useState, useEffect } from "react";
import type { Course, CourseReview } from "@/types/course";
import { SimpleCourseView } from "@/components/SimpleCourseView";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";
import { useT, useLang } from "@/lib/i18n";
import { useFavorites } from "@/lib/useFavorites";
import { ExamModeBadge } from "@/components/ExamModeBadge";
import { AssessmentInsights } from "@/components/AssessmentInsights";
import { GradeOutlook } from "@/components/GradeOutlook";
import { CourseRoadmap } from "@/components/CourseRoadmap";
import { ReviewSection } from "@/components/ReviewSection";
import { PrereqStatusBadge } from "@/components/PrereqStatusBadge";
import { HistoricalExamPattern } from "@/components/HistoricalExamPattern";
import { AddCourseActions } from "@/components/AddCourseActions";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { CourseIntelligence } from "@/components/CourseIntelligence";
import { QuickPageFeedback } from "@/components/QuickPageFeedback";
import { CourseReviewsSection } from "@/components/CourseReviewsSection";
import { SimilarCourses } from "@/components/SimilarCourses";
import { getRecommendTags } from "@/lib/recommendedFor";
import { getDifficulty } from "@/lib/difficultyEstimator";
import { computeGradeOutlook } from "@/lib/gradeOutlook";
import { computeCourseIntelligence } from "@/lib/courseIntelligence";
import { pushRecentCourse } from "@/lib/courseSearch";

interface CourseDetailViewProps {
  course: Course;
  allCourses: Course[];
  reviewData?: CourseReview;
}

export function CourseDetailView({ course, allCourses, reviewData }: CourseDetailViewProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const reviewRatings = reviewData?.ratings;
  const t = useT();
  const { lang } = useLang();
  const { toggle, isFavorite } = useFavorites();
  const fav = isFavorite(course.id);

  useEffect(() => { pushRecentCourse(course.id); }, [course.id]);

  if (!showAdvanced) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <DisclaimerBox />
        <div className="mt-4">
          <SimpleCourseView
            course={course}
            review={reviewRatings}
            onViewDetails={() => setShowAdvanced(true)}
          />
        </div>
        <div className="mt-6">
          <QuickPageFeedback pageId={course.id} />
        </div>
      </main>
    );
  }

  const s1Exam = course.historicalExams.length > 0 ? course.historicalExams[0] : null;
  const ci = computeCourseIntelligence(course);
  const outlook = computeGradeOutlook(course, reviewRatings);
  const tags = getRecommendTags(course, reviewRatings, lang);
  const diff = getDifficulty(course, reviewRatings);

  return (
    <main>
      {/* ── Back link ── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-6">
        <DisclaimerBox />
        <button type="button" onClick={() => setShowAdvanced(false)}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-fern hover:underline">
          {t.courseDetail.backToSimple}
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="mt-6 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* LEFT — course info */}
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-fern">{course.code}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{course.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-ink">{translateStage(course.stage, lang)}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-600">{formatPoints(course.points)} points</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-600">{translateSemesters(course.semesters, lang)}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-600">{course.subject}</span>
              </div>
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.slice(0, 5).map((tag) => (
                    <span key={tag.label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tag.icon} {tag.label}</span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-400">
                {t.courseDetail.lastUpdated}: {(course as any).sourceFetchedAt
                  ? new Date((course as any).sourceFetchedAt).toLocaleDateString("en-NZ", { year:"numeric", month:"short", day:"numeric" })
                  : t.courseDetail.lastUpdatedUnknown}
              </p>
            </div>

            {/* RIGHT — actions + quick stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AddCourseActions course={course} />
                <button type="button" onClick={() => toggle(course.id)}
                  className={`shrink-0 rounded-xl border p-2.5 text-lg leading-none transition ${
                    fav ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-200 bg-white text-slate-300 hover:text-rose-400 hover:border-rose-200"
                  }`} title={fav ? "Remove from favorites" : "Add to favorites"}>
                  {fav ? "♥" : "♡"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-lg">{ci.workload.icon}</p>
                  <p className={`mt-1 text-xs font-semibold ${ci.workload.level==="High"?"text-rose-600":ci.workload.level==="Medium"?"text-amber-600":"text-emerald-600"}`}>{ci.workload.level}</p>
                  <p className="text-[10px] text-slate-400">Workload</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-lg">{ci.difficulty.icon}</p>
                  <p className={`mt-1 text-xs font-semibold ${ci.difficulty.level==="Intensive"?"text-rose-600":ci.difficulty.level==="Moderate"?"text-amber-600":"text-emerald-600"}`}>{ci.difficulty.level}</p>
                  <p className="text-[10px] text-slate-400">Difficulty</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-lg">{course.hasFinalExam ? "📝" : "🚫"}</p>
                  <p className="mt-1 text-xs font-semibold text-ink">{course.hasFinalExam ? "Final Exam" : "No Exam"}</p>
                  <p className="text-[10px] text-slate-400">Exam</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-lg">{course.hasGroupWork ? "👥" : "🚫"}</p>
                  <p className="mt-1 text-xs font-semibold text-ink">{course.hasGroupWork ? "Group Work" : "No Groups"}</p>
                  <p className="text-[10px] text-slate-400">Groups</p>
                </div>
                <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-lg font-bold text-ink">{"★".repeat(diff.level)}{"☆".repeat(5-diff.level)}</p>
                  <p className="mt-1 text-xs font-semibold text-ink">{outlook.easyAIndex} · {outlook.aRangePotential} A-Range · {outlook.riskLevel} Risk</p>
                  <p className="text-[10px] text-slate-400">Grade Outlook</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-10">
        {/* Assessment — first, most important */}
        <section>
          <h2 className="text-xl font-bold text-ink">{t.courseDetail.assessmentStructure}</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
            {course.assessments.length > 0 ? (
              <div className="space-y-4">
                {course.assessments.map((a) => {
                  const pctMatch = a.weight.match(/(\d+)/);
                  const pct = pctMatch ? Math.min(100, Number(pctMatch[1])) : 0;
                  return (
                    <div key={a.type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{a.type}</span>
                        <span className="text-xs font-semibold text-slate-500">{a.weight}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-fern transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t.courseDetail.infoUnavailable}</p>
            )}
            <p className="mt-4 text-xs text-slate-400">{t.courseDetail.mayVary}</p>
          </div>
        </section>

        {/* Prerequisites + Restrictions */}
        <section>
          <h2 className="text-xl font-bold text-ink">Prerequisites & Restrictions</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <Info label={t.courseDetail.prerequisite} value={course.prerequisites} />
            <div className="mt-2"><PrereqStatusBadge course={course} /></div>
            <div className="mt-3"><Info label={t.courseDetail.restriction} value={course.restrictions} /></div>
          </div>
        </section>

        {/* Course Info — 2-column grid */}
        <section>
          <h2 className="text-xl font-bold text-ink">{t.courseDetail.courseInformation}</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Info label={t.courseDetail.semester} value={translateSemesters(course.semesters, lang)} />
              <Info label={t.courseDetail.stage} value={translateStage(course.stage, lang)} />
              <Info label={t.courseDetail.points} value={formatPoints(course.points)} />
              <Info label={t.courseDetail.faculty} value={course.faculty} />
              <Info label={t.courseDetail.workload} value={course.workload} />
              <Info label={t.courseDetail.subject} value={course.subject} />
            </dl>
          </div>
        </section>

        {/* S1 Exam */}
        <section>
          <h2 className="text-xl font-bold text-ink">{t.courseDetail.s1ExamInfo}</h2>
          {s1Exam ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ExamInfo label={t.courseDetail.examMode}><ExamModeBadge mode={s1Exam.mode} showDescription /></ExamInfo>
              <ExamInfo label={t.courseDetail.examDate} value={s1Exam.date} />
              <ExamInfo label={t.courseDetail.duration} value={s1Exam.duration} />
              <ExamInfo label={t.courseDetail.campus} value={s1Exam.locationType} />
              <ExamInfo label={t.courseDetail.materials} value={s1Exam.materials} />
              <ExamInfo label={t.courseDetail.mode} value={s1Exam.format} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-400">{t.courseDetail.noExamInS1}</p>
          )}
        </section>

        <CourseRoadmap course={course} allCourses={allCourses} />
        <AssessmentInsights course={course} />
        {reviewData && <ReviewSection review={reviewData} />}
        <CourseReviewsSection courseId={course.id} courseCode={course.code} />
        <SimilarCourses course={course} allCourses={allCourses} difficultyMap={new Map()} />
        <HistoricalExamPattern exams={course.historicalExams} />
        <QuickPageFeedback pageId={course.id} />
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-3 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function ExamInfo({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children ?? <span>{value}</span>}</dd>
    </div>
  );
}
