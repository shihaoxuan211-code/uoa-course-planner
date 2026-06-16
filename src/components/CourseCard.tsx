import Link from "next/link";
import type { Course } from "@/types/course";
import { formatPoints, formatSemesters } from "@/lib/courseDisplay";
import { getLatestHistoricalExamMode } from "@/lib/exam";
import { AddCourseActions } from "@/components/AddCourseActions";
import { ExamModeBadge } from "@/components/ExamModeBadge";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const latestMode = getLatestHistoricalExamMode(course.historicalExams);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-fern">{course.code}</p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-ink">{course.title}</h2>
        </div>
        <ExamModeBadge mode={latestMode} />
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Points</dt>
          <dd className="font-semibold text-ink">{formatPoints(course.points)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Semester</dt>
          <dd className="font-semibold text-ink">{formatSemesters(course)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Stage</dt>
          <dd className="font-semibold text-ink">Stage {course.stage}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Subject</dt>
          <dd className="font-semibold text-ink">{course.subject}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Final exam</dt>
          <dd className="font-semibold text-ink">{course.hasFinalExam ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Latest mode</dt>
          <dd className="font-semibold text-ink">{latestMode ? `Mode ${latestMode}` : "No data"}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-1 flex-col justify-end gap-4">
        <AddCourseActions course={course} compact />
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
