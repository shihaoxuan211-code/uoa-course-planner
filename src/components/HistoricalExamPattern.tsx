"use client";

import type { HistoricalExam } from "@/types/course";
import { examModeDetails, getHistoricalExamPattern } from "@/lib/exam";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { ExamModeBadge } from "@/components/ExamModeBadge";
import { useT } from "@/lib/i18n";

interface HistoricalExamPatternProps {
  exams: HistoricalExam[];
}

export function HistoricalExamPattern({ exams }: HistoricalExamPatternProps) {
  const t = useT();
  const pattern = getHistoricalExamPattern(exams);

  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-fern">{t.examHistory.heading}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-ink">{pattern}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["A", "B", "C", "D"] as const).map((mode) => (
            <ExamModeBadge key={mode} mode={mode} />
          ))}
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        {(["A", "B", "C", "D"] as const).map((mode) => (
          <p key={mode} className="rounded-lg bg-slate-50 px-3 py-2">
            {examModeDetails[mode].label}
          </p>
        ))}
      </div>

      {exams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">{t.examHistory.year}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.semester}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.examDate}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.examMode}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.format}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.location}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.duration}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.materials}</th>
                <th className="px-3 py-3 font-semibold">{t.examHistory.sourceNote}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr key={`${exam.year}-${exam.semester}-${exam.date}`} className="align-top">
                  <td className="px-3 py-3 font-semibold text-ink">{exam.year}</td>
                  <td className="px-3 py-3 text-slate-700">{exam.semester}</td>
                  <td className="px-3 py-3 text-slate-700">{exam.date}</td>
                  <td className="px-3 py-3">
                    <ExamModeBadge mode={exam.mode} />
                  </td>
                  <td className="px-3 py-3 text-slate-700">{exam.format}</td>
                  <td className="px-3 py-3 text-slate-700">{exam.locationType}</td>
                  <td className="px-3 py-3 text-slate-700">{exam.duration}</td>
                  <td className="px-3 py-3 text-slate-700">{exam.materials}</td>
                  <td className="max-w-xs px-3 py-3 text-slate-600">{exam.sourceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          {t.examHistory.noExamInS1}
        </div>
      )}

      <DisclaimerBox title={t.examHistory.warningTitle}>
        <p>{t.examHistory.warningBody}</p>
      </DisclaimerBox>
    </section>
  );
}
