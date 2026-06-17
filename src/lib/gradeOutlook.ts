import type { Course, ReviewRatings } from "@/types/course";

// ── Types ──────────────────────────────────────────────────────────

export type EasyAIndex = "Easy" | "Moderate" | "Hard" | "Very Hard";
export type PotentialLevel = "High" | "Medium" | "Low";
export type WorkloadLevel = "Low" | "Medium" | "High";
export type RiskLevel = "Low" | "Medium" | "High";

export interface GradeOutlook {
  easyAIndex: EasyAIndex;
  aRangePotential: PotentialLevel;
  workloadLevel: WorkloadLevel;
  riskLevel: RiskLevel;
  reasons: string[];
  disclaimer: string;
}

// ── Weight extraction ──────────────────────────────────────────────

function parseWeightPct(weight: string): number {
  const m = weight.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!m) return 0;
  const p = Number.parseFloat(m[1]);
  return Number.isFinite(p) ? p : 0;
}

function isExamAssessment(type: string, weight: string): boolean {
  return /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${type} ${weight}`);
}

function getExamWeight(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => isExamAssessment(a.type, a.weight))
      .reduce((s, a) => s + parseWeightPct(a.weight), 0)
  );
}

function hasPresentation(course: Course): boolean {
  return course.assessments.some(
    (a) => /\bpresentation\b|\bpitch\b|\bpodcast\b|\boral\b|\bseminar\b/i.test(`${a.type} ${a.weight}`)
  );
}

// ── Main calculation ───────────────────────────────────────────────

export function computeGradeOutlook(course: Course, review?: ReviewRatings): GradeOutlook {
  const reasons: string[] = [];
  const examWeight = getExamWeight(course);
  const numAssessments = course.assessments.length;
  const hasGroup = course.hasGroupWork;
  const hasPres = hasPresentation(course);
  const reviewDiff = review?.difficulty ?? 0;
  const reviewWork = review?.workload ?? 0;
  const hasExam = course.hasFinalExam;

  let score = 0; // Higher = harder

  // ── Final exam weight ──
  if (examWeight >= 50) {
    score += 3;
    reasons.push(`Final exam is weighted at ${examWeight}%`);
  } else if (examWeight >= 30) {
    score += 1;
    if (hasExam) reasons.push(`Final exam weight is moderate at ${examWeight}%`);
  } else if (!hasExam) {
    score -= 1;
    reasons.push("No final exam — assessment is fully coursework-based");
  }

  // ── Assessment count ──
  if (numAssessments >= 5) {
    score += 2;
    reasons.push(`${numAssessments} assessments — high assessment load`);
  } else if (numAssessments >= 4) {
    score += 1;
    reasons.push(`${numAssessments} assessments — moderate load`);
  } else if (numAssessments <= 2 && numAssessments > 0) {
    score -= 1;
    reasons.push(`Only ${numAssessments} assessments — focused workload`);
  }

  // ── Group work ──
  if (hasGroup) {
    score += 1;
    reasons.push("Includes group work — adds coordination complexity");
  }

  // ── Presentation ──
  if (hasPres) {
    score += 1;
    reasons.push("Includes presentation component");
  }

  // ── Review difficulty ──
  if (reviewDiff >= 4) {
    score += 2;
    reasons.push(`Student reviews rate difficulty at ${reviewDiff}/5`);
  } else if (reviewDiff >= 3) {
    score += 1;
  }

  // ── Review workload ──
  if (reviewWork >= 4) {
    score += 2;
    reasons.push(`Student reviews rate workload at ${reviewWork}/5`);
  } else if (reviewWork >= 3) {
    score += 1;
  }

  // ── Easy A Index (from score) ──
  let easyAIndex: EasyAIndex;
  if (score <= 0) easyAIndex = "Easy";
  else if (score <= 2) easyAIndex = "Moderate";
  else if (score <= 5) easyAIndex = "Hard";
  else easyAIndex = "Very Hard";

  // ── A Range Potential ──
  let aRangePotential: PotentialLevel;
  if (score <= 1) aRangePotential = "High";
  else if (score <= 4) aRangePotential = "Medium";
  else aRangePotential = "Low";

  // ── Workload Level ──
  let workloadScore = 0;
  if (numAssessments >= 5) workloadScore += 2;
  else if (numAssessments >= 3) workloadScore += 1;
  if (reviewWork >= 4) workloadScore += 2;
  else if (reviewWork >= 3) workloadScore += 1;
  if (hasGroup) workloadScore += 1;
  if (hasPres) workloadScore += 1;

  let workloadLevel: WorkloadLevel;
  if (workloadScore <= 1) workloadLevel = "Low";
  else if (workloadScore <= 3) workloadLevel = "Medium";
  else workloadLevel = "High";

  // ── Risk Level ──
  let riskScore = 0;
  if (examWeight >= 50) riskScore += 2;
  else if (examWeight >= 30) riskScore += 1;
  if (hasGroup) riskScore += 1;
  if (numAssessments <= 2 && hasExam) riskScore += 1; // fewer items = higher stakes per item
  if (reviewDiff >= 4) riskScore += 1;

  let riskLevel: RiskLevel;
  if (riskScore <= 1) riskLevel = "Low";
  else if (riskScore <= 3) riskLevel = "Medium";
  else riskLevel = "High";

  // Add at least 2 reasons
  if (reasons.length < 2) {
    if (hasExam) reasons.push("Assessment structure appears manageable");
    else reasons.push("Coursework-focused assessment structure");
  }

  return {
    easyAIndex,
    aRangePotential,
    workloadLevel,
    riskLevel,
    reasons: reasons.slice(0, 4),
    disclaimer: "Estimate only. Not official university grade data. Based on assessment structure and student reviews where available."
  };
}
