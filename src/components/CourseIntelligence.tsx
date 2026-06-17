import type { Course } from "@/types/course";
import { computeCourseIntelligence } from "@/lib/courseIntelligence";

interface CourseIntelligenceProps { course: Course }

export function CourseIntelligence({ course }: CourseIntelligenceProps) {
  const ci = computeCourseIntelligence(course);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-ink">Course Insights</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Workload</p>
          <p className="mt-1 text-lg font-bold">{ci.workload.icon}</p>
          <p className={`text-xs font-semibold ${
            ci.workload.level === "High" ? "text-rose-700" : ci.workload.level === "Medium" ? "text-amber-700" : "text-emerald-700"
          }`}>{ci.workload.label}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Difficulty</p>
          <p className="mt-1 text-lg font-bold">{ci.difficulty.icon}</p>
          <p className={`text-xs font-semibold ${
            ci.difficulty.level === "Intensive" ? "text-rose-700" : ci.difficulty.level === "Moderate" ? "text-amber-700" : "text-emerald-700"
          }`}>{ci.difficulty.label}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Group Work</p>
          <p className="mt-1 text-lg">{ci.groupWork.icon}</p>
          <p className="text-xs font-semibold text-slate-700">{ci.groupWork.label}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Final Exam</p>
          <p className="mt-1 text-lg">{ci.finalExam.icon}</p>
          <p className="text-xs font-semibold text-slate-700">{ci.finalExam.label}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Assessment Focus</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{ci.assessmentFocus}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">Assessment-based estimate only.</p>
    </section>
  );
}
