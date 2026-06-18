import type { Course, ReviewRatings } from "@/types/course";

export interface RecommendTag {
  label: string;
  icon: string;
}

export function getRecommendTags(course: Course, review?: ReviewRatings): RecommendTag[] {
  const tags: RecommendTag[] = [];

  const examWeight = getExamWeightPct(course);
  const numAssessments = course.assessments.length;
  const hasGroup = course.hasGroupWork;
  const hasPres = hasPresentation(course);
  const reviewDiff = review?.difficulty ?? 0;
  const reviewWork = review?.workload ?? 0;
  const noExam = !course.hasFinalExam || examWeight === 0;

  const easyScore = computeEasyScore(examWeight, numAssessments, hasGroup, hasPres, reviewDiff, reviewWork, noExam);
  const wlScore = (numAssessments >= 5 ? 2 : numAssessments >= 3 ? 1 : 0) +
                  (reviewWork >= 4 ? 2 : reviewWork >= 3 ? 1 : 0) +
                  (hasGroup ? 1 : 0) + (hasPres ? 1 : 0);

  if (easyScore <= 2) {
    tags.push({ label: "Suitable if you want a manageable workload", icon: "📈" });
  }

  if (noExam || (examWeight > 0 && examWeight < 25)) {
    tags.push({ label: "Suitable if you prefer coursework over exams", icon: "📝" });
  }

  if (noExam) {
    tags.push({ label: "Good choice if you dislike final exams", icon: "🚫" });
  }

  if (easyScore <= 3 && reviewWork <= 3 && numAssessments <= 4) {
    tags.push({ label: "Good option for exchange or visiting students", icon: "🌏" });
  }

  if (course.subject === "INTBUS") {
    tags.push({ label: "Recommended for International Business students", icon: "🌐" });
  }
  if (course.subject === "ACCTG") {
    tags.push({ label: "Recommended for Accounting students", icon: "📊" });
  }
  if (course.subject === "FINANCE") {
    tags.push({ label: "Recommended for Finance students", icon: "💰" });
  }
  if (course.subject === "MKTG") {
    tags.push({ label: "Recommended for Marketing students", icon: "📢" });
  }

  if (wlScore >= 4) {
    tags.push({ label: "Expect a moderate to high workload", icon: "⚠️" });
  }

  return tags;
}

function parsePct(w: string): number {
  const m = w.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number.parseFloat(m[1]) : 0;
}

function isExamAssess(type: string, weight: string): boolean {
  return /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(type + " " + weight);
}

function getExamWeightPct(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => isExamAssess(a.type, a.weight))
      .reduce((s, a) => s + parsePct(a.weight), 0)
  );
}

function hasPresentation(course: Course): boolean {
  return course.assessments.some(
    (a) => /\bpresentation\b|\bpitch\b|\bpodcast\b|\boral\b|\bseminar\b/i.test(a.type + " " + a.weight)
  );
}

function computeEasyScore(
  examW: number, n: number, grp: boolean, pres: boolean,
  rDiff: number, rWork: number, noExam: boolean
): number {
  let s = 0;
  if (examW >= 50) s += 3; else if (examW >= 30) s += 1; else if (noExam) s -= 1;
  if (n >= 5) s += 2; else if (n >= 4) s += 1; else if (n <= 2 && n > 0) s -= 1;
  if (grp) s += 1;
  if (pres) s += 1;
  if (rDiff >= 4) s += 2; else if (rDiff >= 3) s += 1;
  if (rWork >= 4) s += 2; else if (rWork >= 3) s += 1;
  return s;
}
