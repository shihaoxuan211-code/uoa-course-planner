"use client";

import { useState } from "react";
import type { Course, CourseReview } from "@/types/course";
import { SimpleCourseView } from "@/components/SimpleCourseView";
import { formatPoints, translateSemesters, translateStage } from "@/lib/courseDisplay";
import { useT, useLang } from "@/lib/i18n";
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

  if (!showAdvanced) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
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

  // Full advanced view
  const s1Exam = course.historicalExams.length > 0 ? course.historicalExams[0] : null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <DisclaimerBox />
      </div>

      {/* Back to Simple */}
      <button
        type="button"
        onClick={() => setShowAdvanced(false)}
        className="flex items-center gap-1 text-sm font-medium text-fern hover:underline"
      >
        {t.courseDetail.backToSimple}
      </button>

      {/* Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-fern">{course.code}</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{course.title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-700">{course.description}</p>
          </div>
          <div className="min-w-64 rounded-lg bg-slate-50 p-4">
            <AddCourseActions course={course} />
          </div>
        </div>
      </section>

      {/* S1 Exam */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">{t.courseDetail.s1ExamInfo}</h2>
        {s1Exam ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Course Info + Assessments */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">{t.courseDetail.courseInformation}</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label={t.courseDetail.points} value={formatPoints(course.points)} />
            <Info label={t.courseDetail.semester} value={translateSemesters(course.semesters, lang)} />
            <Info label={t.courseDetail.stage} value={translateStage(course.stage, lang)} />
            <Info label={t.courseDetail.subject} value={course.subject} />
            <Info label={t.courseDetail.faculty} value={course.faculty} />
            <Info label={t.courseDetail.prerequisite} value={course.prerequisites} />
            <div className="border-b border-slate-100 pb-3"><PrereqStatusBadge course={course} /></div>
            <Info label={t.courseDetail.restriction} value={course.restrictions} />
            <Info label={t.courseDetail.workload} value={course.workload} />
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">{t.courseDetail.assessmentStructure}</h2>
          {course.assessments.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {course.assessments.map((a) => (
                <div key={a.type} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-slate-700">{a.type}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-ink">{a.weight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">{t.courseDetail.infoUnavailable}</p>
          )}
          <p className="mt-3 text-xs text-slate-400">{t.courseDetail.mayVary}</p>
        </div>
      </section>

      <CourseIntelligence course={course} />
      <CourseRoadmap course={course} allCourses={allCourses} />
      <AssessmentInsights course={course} />
      <GradeOutlook course={course} review={reviewRatings} />

      {reviewData && <ReviewSection review={reviewData} />}

      <CourseReviewsSection courseId={course.id} courseCode={course.code} />

      <HistoricalExamPattern exams={course.historicalExams} />
      <div className="mt-6">
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
