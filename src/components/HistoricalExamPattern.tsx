import type { HistoricalExam } from "@/types/course";
import { examModeDetails, getHistoricalExamPattern } from "@/lib/exam";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { ExamModeBadge } from "@/components/ExamModeBadge";

interface HistoricalExamPatternProps {
  exams: HistoricalExam[];
}

export function HistoricalExamPattern({ exams }: HistoricalExamPatternProps) {
  const pattern = getHistoricalExamPattern(exams);

  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-fern">Historical Exam Pattern</p>
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
                <th className="px-3 py-3 font-semibold">Year</th>
                <th className="px-3 py-3 font-semibold">Semester</th>
                <th className="px-3 py-3 font-semibold">Exam date</th>
                <th className="px-3 py-3 font-semibold">Exam mode</th>
                <th className="px-3 py-3 font-semibold">Format</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Duration</th>
                <th className="px-3 py-3 font-semibold">Materials</th>
                <th className="px-3 py-3 font-semibold">Source note</th>
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
          No final exam listed in Semester 1 2026 timetable.
        </div>
      )}

      <DisclaimerBox title="Historical exam pattern warning">
        <p>
          Historical exam patterns are not official predictions. UOA may change exam mode, date, format,
          or assessment structure in any semester.
        </p>
      </DisclaimerBox>
    </section>
  );
}
