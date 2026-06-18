"use client";

import type { Course } from "@/types/course";
import { computeAssessmentInsights } from "@/lib/assessmentInsights";
import type { AssessmentInsight } from "@/lib/assessmentInsights";
import { useT } from "@/lib/i18n";

interface AssessmentInsightsProps {
  course: Course;
}

function InsightRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm">
      <dt className="font-medium text-slate-600">{label}</dt>
      <dd className={`font-semibold ${emphasis ? "text-ink text-base" : "text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}

function getExamWeightColor(level: AssessmentInsight["examWeight"]["level"]) {
  switch (level) {
    case "High": return "text-rose-700";
    case "Medium": return "text-amber-700";
    case "Low": return "text-emerald-700";
    case "None": return "text-slate-500";
  }
}

function getBalanceColor(type: AssessmentInsight["assessmentBalance"]["type"]) {
  switch (type) {
    case "Exam Heavy": return "text-rose-700";
    case "Coursework Heavy": return "text-emerald-700";
    case "Balanced": return "text-sky-700";
    case "No Final Exam": return "text-slate-500";
  }
}

function getWorkloadColor(level: AssessmentInsight["workloadSignal"]["level"]) {
  switch (level) {
    case "High": return "text-rose-700";
    case "Medium": return "text-amber-700";
    case "Low": return "text-emerald-700";
    case "Unknown": return "text-slate-400";
  }
}

export function AssessmentInsights({ course }: AssessmentInsightsProps) {
  const insights = computeAssessmentInsights(course);
  const t = useT();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-xl font-bold text-ink">{t.assessmentInsights.heading}</h2>

      <dl className="mt-4 divide-y-0">
        {/* Final Exam */}
        <InsightRow
          label={t.assessmentInsights.finalExam}
          value={insights.finalExam.label}
          emphasis
        />

        {/* Exam Weight */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm">
          <dt className="font-medium text-slate-600">{t.assessmentInsights.examWeight}</dt>
          <dd className={`font-semibold ${getExamWeightColor(insights.examWeight.level)}`}>
            {insights.examWeight.label}
          </dd>
        </div>

        {/* Continuous Assessment */}
        <InsightRow
          label={t.assessmentInsights.continuousAssessment}
          value={insights.continuousAssessment.label}
        />

        {/* Assessment Balance */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm">
          <dt className="font-medium text-slate-600">{t.assessmentInsights.assessmentBalance}</dt>
          <dd className={`font-semibold ${getBalanceColor(insights.assessmentBalance.type)}`}>
            {insights.assessmentBalance.label}
          </dd>
        </div>

        {/* Assessment Style */}
        <InsightRow
          label={t.assessmentInsights.assessmentStyle}
          value={insights.assessmentStyle.summary}
        />

        {/* Number of Assessments */}
        <InsightRow
          label={t.assessmentInsights.numberOfAssessments}
          value={String(course.assessments.length)}
        />

        {/* Group Work */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm">
          <dt className="font-medium text-slate-600">{t.assessmentInsights.groupWork}</dt>
          <dd className={`font-semibold ${insights.groupWork.hasGroup ? "text-emerald-700" : "text-slate-500"}`}>
            {insights.groupWork.label}
          </dd>
        </div>

        {/* Presentation */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 text-sm">
          <dt className="font-medium text-slate-600">{t.assessmentInsights.presentation}</dt>
          <dd className={`font-semibold ${insights.presentation.hasPresentation ? "text-emerald-700" : "text-slate-500"}`}>
            {insights.presentation.label}
          </dd>
        </div>

        {/* Workload Signal */}
        <div className="flex items-center justify-between gap-3 py-3 text-sm">
          <dt className="font-medium text-slate-600">{t.assessmentInsights.workloadSignal}</dt>
          <dd className={`font-semibold ${getWorkloadColor(insights.workloadSignal.level)}`}>
            {insights.workloadSignal.label} ({insights.workloadSignal.count} items)
          </dd>
        </div>
      </dl>
    </section>
  );
}
