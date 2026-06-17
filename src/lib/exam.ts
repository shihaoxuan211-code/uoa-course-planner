import type { ExamMode, HistoricalExam } from "@/types/course";

export const examModeDetails: Record<ExamMode, { label: string; shortLabel: string; className: string }> = {
  A: {
    label: "Mode A = Online, non-invigilated, Inspera",
    shortLabel: "Mode A",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200"
  },
  B: {
    label: "Mode B = Online, invigilated, Inspera Integrity Browser",
    shortLabel: "Mode B",
    className: "bg-amber-50 text-amber-900 ring-amber-200"
  },
  C: {
    label: "Mode C = In-person, paper-based exam",
    shortLabel: "Mode C",
    className: "bg-sky-50 text-sky-800 ring-sky-200"
  },
  D: {
    label: "Mode D = In-person, digital exam using Inspera Integrity Browser",
    shortLabel: "Mode D",
    className: "bg-violet-50 text-violet-800 ring-violet-200"
  }
};

export const likelyPatternByMode: Record<ExamMode, string> = {
  A: "Likely Online Non-invigilated",
  B: "Likely Online Invigilated",
  C: "Likely In-person Paper Exam",
  D: "Likely In-person Digital Exam"
};

export function getLatestHistoricalExam(exams: HistoricalExam[]) {
  return [...exams].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getLatestHistoricalExamMode(exams: HistoricalExam[]) {
  const latest = getLatestHistoricalExam(exams);
  return latest ? latest.mode : undefined;
}

export function getHistoricalExamPattern(exams: HistoricalExam[]) {
  if (exams.length === 0) {
    return "No exam in S1 2026";
  }

  const counts = exams.reduce<Record<ExamMode, number>>(
    (acc, exam) => {
      acc[exam.mode] += 1;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0 }
  );

  const ranked = (Object.entries(counts) as Array<[ExamMode, number]>).sort((a, b) => b[1] - a[1]);
  const [topMode, topCount] = ranked[0];

  if (topCount > exams.length / 2) {
    return likelyPatternByMode[topMode];
  }

  return "Mixed historical pattern";
}
