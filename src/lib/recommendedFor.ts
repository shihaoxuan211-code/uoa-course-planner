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

  // 1. "Want easy GPA boost" — Easy/Moderate + Low risk
  const easyScore = computeEasyScore(examWeight, numAssessments, hasGroup, hasPres, reviewDiff, reviewWork, noExam);
  if (easyScore <= 2) {
    tags.push({ label: "Want easy GPA boost", icon: "📈" });
  }

  // 2. "Prefer coursework" — No exam or exam < 25%
  if (noExam || (examWeight > 0 && examWeight < 25)) {
    tags.push({ label: "Prefer coursework", icon: "📝" });
  }

  // 3. "Avoid final exams" — No final exam at all
  if (noExam) {
    tags.push({ label: "Avoid final exams", icon: "🚫" });
  }

  // 4. "Good for exchange students" — Easy/Moderate, Low/Medium workload
  if (easyScore <= 3 && reviewWork <= 3 && numAssessments <= 4) {
    tags.push({ label: "Good for exchange students", icon: "🌏" });
  }

  // 5. "Useful for IB major" — INTBUS subject
  if (course.subject === "INTBUS") {
    tags.push({ label: "Useful for International Business major", icon: "🌐" });
  }

  // Other major-specific
  if (course.subject === "ACCTG") {
    tags.push({ label: "Useful for Accounting major", icon: "📊" });
  }
  if (course.subject === "FINANCE") {
    tags.push({ label: "Useful for Finance major", icon: "💰" });
  }
  if (course.subject === "MKTG") {
    tags.push({ label: "Useful for Marketing major", icon: "📢" });
  }

  // 6. "High workload warning" — Workload High or many assessments
  const wlScore = (numAssessments >= 5 ? 2 : numAssessments >= 3 ? 1 : 0) +
                  (reviewWork >= 4 ? 2 : reviewWork >= 3 ? 1 : 0) +
                  (hasGroup ? 1 : 0) + (hasPres ? 1 : 0);
  if (wlScore >= 4) {
    tags.push({ label: "High workload warning", icon: "⚠️" });
  }

  // 7. Bonus tags
  if (hasGroup) {
    // don't add — already shown elsewhere
  }

  return tags;
}

// ── Helpers ────────────────────────────────────────────────────────

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
