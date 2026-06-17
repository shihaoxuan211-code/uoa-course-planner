import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddCourseActions } from "@/components/AddCourseActions";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { HistoricalExamPattern } from "@/components/HistoricalExamPattern";
import { courses, getCourseById } from "@/data/courses";
import { formatPoints, formatSemesters } from "@/lib/courseDisplay";
import { ExamModeBadge } from "@/components/ExamModeBadge";
import { AssessmentInsights } from "@/components/AssessmentInsights";
import { ReviewSection } from "@/components/ReviewSection";
import { getCourseReview } from "@/data/reviewData";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return courses.map((course) => ({ id: course.id }));
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);

  return {
    title: course ? `${course.code} | UOA Course Planner` : "Course not found | UOA Course Planner"
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    notFound();
  }

  const s1Exam = course.historicalExams.length > 0 ? course.historicalExams[0] : null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <DisclaimerBox />

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-fern">{course.code}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{course.description}</p>
          </div>
          <div className="min-w-64 rounded-lg bg-slate-50 p-4">
            <div className="mt-5">
              <AddCourseActions course={course} />
            </div>
          </div>
        </div>
      </section>

      {/* S1 2026 Exam Information */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-xl font-bold text-ink">S1 2026 Exam Information</h2>
        {s1Exam ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ExamInfoItem label="Exam Mode">
              <ExamModeBadge mode={s1Exam.mode} showDescription />
            </ExamInfoItem>
            <ExamInfoItem label="Mode Description" value={s1Exam.format} />
            <ExamInfoItem label="Exam Date" value={s1Exam.date} />
            <ExamInfoItem label="Duration" value={s1Exam.duration} />
            <ExamInfoItem label="Campus" value={s1Exam.locationType} />
            <ExamInfoItem label="Materials" value={s1Exam.materials} />
            <ExamInfoItem label="Online / In-person">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                s1Exam.locationType === "Online"
                  ? "bg-sky-50 text-sky-800 ring-sky-200"
                  : "bg-violet-50 text-violet-800 ring-violet-200"
              }`}>
                {s1Exam.locationType === "Online" ? "Online" : "In-person"}
              </span>
            </ExamInfoItem>
            <ExamInfoItem label="Digital / Paper">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                s1Exam.mode === "C"
                  ? "bg-amber-50 text-amber-800 ring-amber-200"
                  : "bg-emerald-50 text-emerald-800 ring-emerald-200"
              }`}>
                {s1Exam.mode === "C" ? "Paper" : "Digital"}
              </span>
            </ExamInfoItem>
          </dl>
        ) : (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No final exam listed in Semester 1 2026 timetable.
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          Source: {s1Exam ? s1Exam.sourceNote : "University of Auckland Semester 1 2026 Examination Timetable"}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-ink">Course information</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <InfoRow label="Points" value={formatPoints(course.points)} />
            <InfoRow label="Semester offered" value={formatSemesters(course)} />
            <InfoRow label="Stage" value={`Stage ${course.stage}`} />
            <InfoRow label="Subject" value={course.subject} />
            <InfoRow label="Faculty" value={course.faculty} />
            <InfoRow label="Prerequisite" value={course.prerequisites} />
            <InfoRow label="Restriction" value={course.restrictions} />
            <InfoRow label="Workload" value={course.workload} />
            <InfoRow label="Final exam status" value={course.hasFinalExam ? "Has final exam" : "No final exam listed"} />
            <InfoRow label="Group work status" value={course.hasGroupWork ? "Includes group work" : "No group work listed"} />
            <InfoRow label="Notes / warning" value={course.notes} />
            <InfoRow label="Source note" value={course.sourceNote} />
            {course.sourceUrl ? <InfoRow label="Source URL" value={course.sourceUrl} /> : null}
            {course.sourceFetchedAt ? <InfoRow label="Source fetched at" value={course.sourceFetchedAt} /> : null}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-ink">Assessment structure</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {course.assessments.length > 0 ? (
              course.assessments.map((assessment) => (
                <div key={assessment.type} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-medium text-slate-700">{assessment.type}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-ink">
                    {assessment.weight}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm font-medium text-slate-600">Not available</p>
            )}
          </div>
        </div>
      </section>

      <AssessmentInsights course={course} />

      {(() => {
        const review = getCourseReview(course.code);
        if (review) {
          return <ReviewSection review={review} />;
        }
        return null;
      })()}

      <HistoricalExamPattern exams={course.historicalExams} />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-3 sm:grid-cols-[160px_1fr]">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="leading-6 text-slate-800">{value}</dd>
    </div>
  );
}

function ExamInfoItem({
  label,
  value,
  children
}: {
  label: string;
  value?: string;
  children?: import("react").ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">
        {children ?? <span>{value}</span>}
      </dd>
    </div>
  );
}
