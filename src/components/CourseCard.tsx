import Link from "next/link";
import type { Course } from "@/types/course";
import { formatPoints, formatSemesters, translateSemesters, translateStage } from "@/lib/courseDisplay";
import { getLatestHistoricalExamMode } from "@/lib/exam";
import { useT, useLang } from "@/lib/i18n";
import { useFavorites } from "@/lib/useFavorites";
import { AddCourseActions } from "@/components/AddCourseActions";
import { ExamModeBadge } from "@/components/ExamModeBadge";

interface CourseCardProps {
  course: Course;
  difficulty?: number;
}

function StarsMini({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-px text-amber-400 text-xs" aria-label={`Difficulty ${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < value ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export function CourseCard({ course, difficulty }: CourseCardProps) {
  const t = useT();
  const { lang } = useLang();
  const { toggle, isFavorite } = useFavorites();
  const latestMode = getLatestHistoricalExamMode(course.historicalExams);
  const fav = isFavorite(course.id);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      {/* Top row: code + badge + heart */}
      <div className="flex items-start justify-between gap-2 min-h-[28px]">
        <p className="text-sm font-bold text-fern">{course.code}</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggle(course.id); }}
            className={`text-lg leading-none transition ${fav ? "text-rose-500" : "text-slate-300 hover:text-rose-400"}`}
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            {fav ? "♥" : "♡"}
          </button>
          <ExamModeBadge mode={latestMode} />
        </div>
      </div>

      {/* Title — max 2 lines, consistent height */}
      <h2 className="mt-1 text-lg font-bold tracking-normal text-ink line-clamp-2 min-h-[3.5rem]">
        {course.title}
      </h2>

      {/* Description — max 3 lines, consistent height */}
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 min-h-[4.5rem]">
        {course.description}
      </p>

      {/* Info grid — 3x2, consistent layout */}
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm min-h-[7.5rem]">
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.points}</dt>
          <dd className="text-sm font-semibold text-ink">{formatPoints(course.points)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.semester}</dt>
          <dd className="text-sm font-semibold text-ink line-clamp-1">{translateSemesters(course.semesters, lang)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.stage}</dt>
          <dd className="text-sm font-semibold text-ink">{translateStage(course.stage, lang)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.subject}</dt>
          <dd className="text-sm font-semibold text-ink">{course.subject}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.finalExam}</dt>
          <dd className="text-sm font-semibold text-ink">{course.hasFinalExam ? t.courseCard.yes : t.courseCard.no}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{t.courseCard.s1Exam}</dt>
          <dd className="text-sm font-semibold text-ink">{latestMode ? `Mode ${latestMode}` : t.courseCard.infoUnavailable}</dd>
        </div>
        {difficulty !== undefined && (
          <div className="col-span-2">
            <dt className="text-xs text-slate-500">{t.courseCard.estimatedDifficulty}</dt>
            <dd className="text-sm font-semibold text-ink"><StarsMini value={difficulty} /></dd>
          </div>
        )}
      </dl>

      {/* Spacer pushes buttons to card bottom */}
      <div className="flex-1" />

      {/* Buttons — always at bottom */}
      <div className="flex flex-col gap-2 pt-3">
        <AddCourseActions course={course} compact />
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-slate-50"
        >
          {t.courseCard.viewDetails}
        </Link>
      </div>
    </article>
  );
}
