"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Course } from "@/types/course";
import { formatAssessmentSummary, formatPoints, formatSemesters } from "@/lib/courseDisplay";
import { COMPARE_STORAGE_KEY } from "@/lib/storageKeys";
import { getHistoricalExamPattern, getLatestHistoricalExamMode } from "@/lib/exam";
import { useLocalStorageList } from "@/lib/useLocalStorageList";
import { ExamModeBadge } from "@/components/ExamModeBadge";
import { computeGradeOutlook } from "@/lib/gradeOutlook";
import { computeCourseIntelligence } from "@/lib/courseIntelligence";
import reviewsRaw from "@/data/course-reviews.json";

interface ComparisonTableProps {
  courses: Course[];
}

interface Row {
  label: string;
  render: (course: Course) => ReactNode;
}

function getReviewData(code: string) {
  const data = reviewsRaw as { reviews?: Record<string, { ratings: { difficulty: number; workload: number; enjoyment: number; usefulness: number } }> };
  return data.reviews?.[code];
}

function StarsInline({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-px text-amber-400">
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < value ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export function ComparisonTable({ courses }: ComparisonTableProps) {
  const compare = useLocalStorageList(COMPARE_STORAGE_KEY, { maxItems: 4 });
  const comparedCourses = compare.items
    .map((id) => courses.find((course) => course.id === id))
    .filter((course): course is Course => Boolean(course));

  const rows: Row[] = [
    { label: "Course code", render: (course) => course.code },
    { label: "Course title", render: (course) => course.title },
    { label: "Points", render: (course) => formatPoints(course.points) },
    { label: "Semester", render: (course) => formatSemesters(course) },
    { label: "Stage", render: (course) => `Stage ${course.stage}` },
    { label: "Prerequisite", render: (course) => course.prerequisites },
    { label: "Workload", render: (course) => course.workload },
    {
      label: "Assessment",
      render: (course) => formatAssessmentSummary(course)
    },
    { label: "Final exam status", render: (course) => (course.hasFinalExam ? "Has final exam" : "No final exam") },
    {
      label: "Historical exam mode",
      render: (course) => {
        const latestMode = getLatestHistoricalExamMode(course.historicalExams);
        return (
          <div className="space-y-2">
            <ExamModeBadge mode={latestMode} />
            <p className="text-xs text-slate-600">{getHistoricalExamPattern(course.historicalExams)}</p>
          </div>
        );
      }
    },
    { label: "Group work status", render: (course) => (course.hasGroupWork ? "Includes group work" : "No group work listed") },
    {
      label: "Workload",
      render: (course) => {
        const ci = computeCourseIntelligence(course);
        const colors: Record<string,string>={High:"text-rose-700",Medium:"text-amber-700",Low:"text-emerald-700"};
        return <span className={`text-sm font-semibold ${colors[ci.workload.level]??""}`}>{ci.workload.icon} {ci.workload.level}</span>;
      }
    },
    {
      label: "Group Work",
      render: (course) => (course.hasGroupWork ? "👥 Yes" : "🚫 No")
    },
    {
      label: "Final Exam",
      render: (course) => (course.hasFinalExam ? "📝 Yes" : "🚫 No")
    },
    {
      label: "Assessment Focus",
      render: (course) => <span className="text-xs text-slate-600">{computeCourseIntelligence(course).assessmentFocus}</span>
    },
    {
      label: "Easy A Index",
      render: (course) => {
        const r = getReviewData(course.code);
        const o = computeGradeOutlook(course, r?.ratings);
        const colors: Record<string,string>={Easy:"text-emerald-700",Moderate:"text-sky-700",Hard:"text-amber-700","Very Hard":"text-rose-700"};
        return <span className={`text-sm font-semibold ${colors[o.easyAIndex]??""}`}>{o.easyAIndex}</span>;
      }
    },
    {
      label: "A Range Potential",
      render: (course) => {
        const r = getReviewData(course.code);
        const o = computeGradeOutlook(course, r?.ratings);
        const colors: Record<string,string>={High:"text-emerald-700",Medium:"text-sky-700",Low:"text-amber-700"};
        return <span className={`text-sm font-semibold ${colors[o.aRangePotential]??""}`}>{o.aRangePotential}</span>;
      }
    },
    {
      label: "Risk Level",
      render: (course) => {
        const r = getReviewData(course.code);
        const o = computeGradeOutlook(course, r?.ratings);
        const colors: Record<string,string>={Low:"text-emerald-700",Medium:"text-amber-700",High:"text-rose-700"};
        return <span className={`text-sm font-semibold ${colors[o.riskLevel]??""}`}>{o.riskLevel}</span>;
      }
    },
    {
      label: "Difficulty (1-5)",
      render: (course) => {
        const r = getReviewData(course.code);
        return r ? <StarsInline value={r.ratings.difficulty} /> : <span className="text-xs text-slate-400">Information unavailable</span>;
      }
    },
    {
      label: "Workload (1-5)",
      render: (course) => {
        const r = getReviewData(course.code);
        return r ? <StarsInline value={r.ratings.workload} /> : <span className="text-xs text-slate-400">Information unavailable</span>;
      }
    },
    {
      label: "S1 2026 Exam Mode",
      render: (course) => {
        const s1 = course.historicalExams.length > 0 ? course.historicalExams[0] : null;
        return s1 ? (
          <div className="space-y-2">
            <ExamModeBadge mode={s1.mode} />
            <p className="text-xs text-slate-600">{s1.format}</p>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Not in S1 2026</span>
        );
      }
    },
    {
      label: "S1 2026 Duration",
      render: (course) => {
        const s1 = course.historicalExams.length > 0 ? course.historicalExams[0] : null;
        return s1 ? s1.duration : <span className="text-xs text-slate-500">—</span>;
      }
    },
    {
      label: "S1 2026 Materials",
      render: (course) => {
        const s1 = course.historicalExams.length > 0 ? course.historicalExams[0] : null;
        return s1 ? s1.materials : <span className="text-xs text-slate-500">—</span>;
      }
    },
    {
      label: "S1 2026 Campus",
      render: (course) => {
        const s1 = course.historicalExams.length > 0 ? course.historicalExams[0] : null;
        return s1 ? s1.locationType : <span className="text-xs text-slate-500">—</span>;
      }
    },
    { label: "Notes", render: (course) => course.notes }
  ];

  if (!compare.isReady) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">Loading comparison...</div>;
  }

  if (comparedCourses.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-card">
        <h2 className="text-xl font-bold text-ink">No courses selected for comparison</h2>
        <p className="mt-2 text-sm text-slate-600">Add 2 to 4 courses from the Courses page.</p>
        <Link
          href="/courses"
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Browse courses
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">{comparedCourses.length} of 4 courses selected</p>
          {comparedCourses.length < 2 ? (
            <p className="mt-1 text-sm text-amber-800">Add at least one more course for a useful comparison.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={compare.clear}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink hover:bg-white"
        >
          Clear comparison
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-card">
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-44 border-b border-slate-200 px-4 py-3 font-semibold text-slate-600">Field</th>
              {comparedCourses.map((course) => (
                <th key={course.id} className="border-b border-slate-200 px-4 py-3 align-top">
                  <div className="space-y-2">
                    <Link href={`/courses/${course.id}`} className="font-bold text-ink hover:underline">
                      {course.code}
                    </Link>
                    <button
                      type="button"
                      onClick={() => compare.remove(course.id)}
                      className="block rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="align-top">
                <th className="border-b border-slate-100 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                  {row.label}
                </th>
                {comparedCourses.map((course) => (
                  <td key={`${row.label}-${course.id}`} className="border-b border-slate-100 px-4 py-3 text-slate-700">
                    {row.render(course)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
