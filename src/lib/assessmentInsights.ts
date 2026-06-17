import type { AssessmentItem, Course } from "@/types/course";

// ── Types ──────────────────────────────────────────────────────────

export interface AssessmentInsight {
  finalExam: { hasExam: boolean; label: string };
  examWeight: { level: "High" | "Medium" | "Low" | "None"; label: string; percentage: number };
  continuousAssessment: { percentage: number; label: string };
  assessmentBalance: { type: "Exam Heavy" | "Coursework Heavy" | "Balanced" | "No Final Exam"; label: string };
  assessmentStyle: { labels: string[]; summary: string };
  groupWork: { hasGroup: boolean; label: string };
  presentation: { hasPresentation: boolean; label: string };
  workloadSignal: { level: "Low" | "Medium" | "High" | "Unknown"; label: string; count: number };
}

// ── Weight parsing ─────────────────────────────────────────────────

/** Extract numeric percentage from a weight string like "50% - Individual Examination" */
function parseWeightPercent(weight: string): number {
  const match = weight.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return 0;
  const pct = Number.parseFloat(match[1]);
  return Number.isFinite(pct) ? pct : 0;
}

// ── Final Exam ─────────────────────────────────────────────────────

function isExamAssessment(assessment: AssessmentItem): boolean {
  const text = `${assessment.type} ${assessment.weight}`.toLowerCase();
  return /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(text);
}

function getFinalExamWeight(assessments: AssessmentItem[]): number {
  const exam = assessments.find(isExamAssessment);
  if (!exam) return 0;
  return parseWeightPercent(exam.weight);
}

// ── Exam weight level ──────────────────────────────────────────────

function getExamWeightLevel(pct: number): AssessmentInsight["examWeight"] {
  if (pct === 0) return { level: "None", label: "No Final Exam", percentage: 0 };
  if (pct >= 50) return { level: "High", label: `High (${pct}%)`, percentage: pct };
  if (pct >= 25) return { level: "Medium", label: `Medium (${pct}%)`, percentage: pct };
  return { level: "Low", label: `Low (${pct}%)`, percentage: pct };
}

// ── Continuous assessment ──────────────────────────────────────────

function getContinuousAssessment(assessments: AssessmentItem[]): { percentage: number; label: string } {
  const nonExam = assessments.filter((a) => !isExamAssessment(a));
  const total = nonExam.reduce((sum, a) => sum + parseWeightPercent(a.weight), 0);
  const pct = Math.round(total);
  return { percentage: pct, label: `Continuous Assessment: ${pct}%` };
}

// ── Assessment balance ─────────────────────────────────────────────

function getAssessmentBalance(
  examPct: number,
  continuousPct: number,
  hasExam: boolean
): AssessmentInsight["assessmentBalance"] {
  if (!hasExam) return { type: "No Final Exam", label: "No Final Exam" };
  if (continuousPct >= 60) return { type: "Coursework Heavy", label: "Coursework Heavy" };
  if (examPct >= 50) return { type: "Exam Heavy", label: "Exam Heavy" };
  return { type: "Balanced", label: "Balanced" };
}

// ── Assessment style ───────────────────────────────────────────────

const STYLE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Final Exam", pattern: /\bfinal\s+(exam|assessment|examination)\b|^\s*exam\s*$/i },
  { label: "Final Exam", pattern: /\bexam\b/i },
  { label: "Tests", pattern: /\btest\b|quiz|mid.?semester|mid.?term/i },
  { label: "Assignments", pattern: /\bassignment\b|problem\s*set/i },
  { label: "Presentation", pattern: /\bpresentation\b|pitch\b|podcast\b|oral\b|seminar\b|video\b/i },
  { label: "Group Work", pattern: /\bgroup\b|team\b/i },
  { label: "Project", pattern: /\bproject\b/i },
  { label: "Labs", pattern: /\blab\b|laborator/i },
  { label: "Participation", pattern: /\bparticipation\b|engagement\b|attendance\b/i },
  { label: "Reports", pattern: /\breport\b|essay\b|reflective\b|writing\b|memo\b/i },
  { label: "Quizzes", pattern: /\bquiz\b/i },
  { label: "Coursework", pattern: /\bcoursework\b/i },
];

function getAssessmentStyle(assessments: AssessmentItem[]): AssessmentInsight["assessmentStyle"] {
  const labels = new Set<string>();

  for (const assessment of assessments) {
    const text = `${assessment.type} ${assessment.weight}`;
    for (const { label, pattern } of STYLE_PATTERNS) {
      if (pattern.test(text)) {
        labels.add(label);
        break; // one label per assessment
      }
    }
  }

  // Deduplicate: if we have both "Final Exam" entries, keep only one
  // Ensure a sensible order
  const order = [
    "Assignments", "Coursework", "Tests", "Quizzes", "Labs",
    "Reports", "Project", "Group Work", "Presentation",
    "Participation", "Final Exam"
  ];
  const sorted = order.filter((l) => labels.has(l));

  return {
    labels: sorted,
    summary: sorted.length > 0 ? sorted.join(" + ") : "Not available"
  };
}

// ── Presentation detection ─────────────────────────────────────────

const PRESENTATION_RE = /\bpresentation\b|\bpitch\b|\bpodcast\b|\boral\b|\bseminar\b/i;

function hasPresentationComponent(assessments: AssessmentItem[]): boolean {
  return assessments.some((a) => PRESENTATION_RE.test(`${a.type} ${a.weight}`));
}

// ── Workload signal ────────────────────────────────────────────────

function getWorkloadSignal(count: number): AssessmentInsight["workloadSignal"] {
  if (count === 0) return { level: "Unknown", label: "Unknown", count };
  if (count <= 2) return { level: "Low", label: "Low", count };
  if (count <= 4) return { level: "Medium", label: "Medium", count };
  return { level: "High", label: "High", count };
}

// ── Main entry point ───────────────────────────────────────────────

export function computeAssessmentInsights(course: Course): AssessmentInsight {
  const assessments = course.assessments;
  const hasExam = course.hasFinalExam;
  const examPct = Math.round(getFinalExamWeight(assessments));
  const { percentage: continuousPct, label: continuousLabel } = getContinuousAssessment(assessments);

  return {
    finalExam: {
      hasExam,
      label: hasExam
        ? `Yes (${examPct}%)`
        : "No final exam listed"
    },
    examWeight: getExamWeightLevel(hasExam ? examPct : 0),
    continuousAssessment: { percentage: continuousPct, label: continuousLabel },
    assessmentBalance: getAssessmentBalance(examPct, continuousPct, hasExam),
    assessmentStyle: getAssessmentStyle(assessments),
    groupWork: {
      hasGroup: course.hasGroupWork,
      label: course.hasGroupWork ? "✓ Group Work Included" : "✗ No Group Work Listed"
    },
    presentation: {
      hasPresentation: hasPresentationComponent(assessments),
      label: hasPresentationComponent(assessments)
        ? "✓ Presentation Component"
        : "✗ No Presentation Listed"
    },
    workloadSignal: getWorkloadSignal(assessments.length)
  };
}
