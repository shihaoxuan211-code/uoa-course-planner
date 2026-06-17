import type { Course } from "@/types/course";

export type WorkloadLevel = "Low" | "Medium" | "High";
export type DifficultySignal = "Light" | "Moderate" | "Intensive";

export interface CourseIntelligence {
  workload: { level: WorkloadLevel; label: string; icon: string };
  difficulty: { level: DifficultySignal; label: string; icon: string };
  assessmentFocus: string;
  groupWork: { has: boolean; label: string; icon: string };
  finalExam: { has: boolean; label: string; icon: string };
}

// ── Helpers ────────────────────────────────────────────────────────

function parsePct(w: string): number {
  const m = w.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number.parseFloat(m[1]) : 0;
}

function isExamAssess(type: string, weight: string): boolean {
  return /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${type} ${weight}`);
}

function getExamWeight(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => isExamAssess(a.type, a.weight))
      .reduce((s, a) => s + parsePct(a.weight), 0)
  );
}

// ── 1. Workload Indicator ──────────────────────────────────────────

function computeWorkload(course: Course): CourseIntelligence["workload"] {
  const n = course.assessments.length;
  const examW = getExamWeight(course);
  const hasGroup = course.hasGroupWork;

  if (examW >= 50 || n >= 5 || (hasGroup && course.hasFinalExam)) {
    return { level: "High", label: "High workload", icon: "🔴" };
  }
  if (n >= 3) {
    return { level: "Medium", label: "Medium workload", icon: "🟡" };
  }
  return { level: "Low", label: "Low workload", icon: "🟢" };
}

// ── 2. Assessment Breakdown Insight ────────────────────────────────

function computeAssessmentFocus(course: Course): string {
  const types = course.assessments.map((a) => a.type.toLowerCase());
  const allText = types.join(" ");
  const examW = getExamWeight(course);

  const hasAssignments = /\bassignment\b/i.test(allText);
  const hasTests = /\btest\b|quiz|mid.?semester|mid.?term/i.test(allText);
  const hasProject = /\bproject\b/i.test(allText);
  const hasPresentation = /\bpresentation\b|pitch\b|podcast\b|oral\b|seminar\b/i.test(allText);
  const hasGroup = course.hasGroupWork;

  // Exam-focused
  if (examW >= 50) {
    if (hasGroup) return "Exam-focused course with group assessment.";
    return "Exam-focused course.";
  }
  if (examW >= 30) {
    if (hasGroup && hasProject) return "Balanced assessment with group project and exam.";
    if (hasGroup) return "Balanced exam and group coursework.";
    return "Balanced exam and coursework.";
  }

  // Coursework-focused
  if (!course.hasFinalExam) {
    if (hasGroup && hasProject) return "Coursework-focused with group project.";
    if (hasGroup) return "Coursework-focused with group assessment.";
    if (hasTests && hasAssignments) return "Coursework-focused with tests and assignments.";
    return "Coursework-focused — no final exam.";
  }

  // Mixed
  const parts: string[] = [];
  if (hasTests) parts.push("tests");
  if (hasAssignments) parts.push("assignments");
  if (hasProject) parts.push("project");
  if (hasPresentation) parts.push("presentation");
  if (hasGroup) parts.push("group work");

  if (parts.length >= 3) {
    return `Balanced assessment with ${parts.slice(0, 2).join(" and ")}.`;
  }
  if (parts.length === 2) {
    return `Mix of ${parts.join(" and ")}.`;
  }
  if (parts.length === 1) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}-based assessment.`;
  }

  return "Standard assessment structure.";
}

// ── 3. Group Work ──────────────────────────────────────────────────

function computeGroupWork(course: Course): CourseIntelligence["groupWork"] {
  if (course.hasGroupWork) {
    return { has: true, label: "Group Work Present", icon: "👥" };
  }
  return { has: false, label: "No Group Work", icon: "🚫" };
}

// ── 4. Final Exam ──────────────────────────────────────────────────

function computeFinalExam(course: Course): CourseIntelligence["finalExam"] {
  if (course.hasFinalExam) {
    return { has: true, label: "Final Exam", icon: "📝" };
  }
  return { has: false, label: "No Final Exam", icon: "🚫" };
}

// ── 5. Difficulty Signal ───────────────────────────────────────────

function computeDifficulty(course: Course): CourseIntelligence["difficulty"] {
  let score = 0;
  const n = course.assessments.length;
  const examW = getExamWeight(course);

  if (examW >= 50) score += 3;
  else if (examW >= 30) score += 1;
  if (n >= 5) score += 2;
  else if (n >= 3) score += 1;
  if (course.hasGroupWork && course.hasFinalExam) score += 1;
  if (course.hasGroupWork && n >= 4) score += 1;

  if (score >= 4) return { level: "Intensive", label: "Intensive", icon: "🔴" };
  if (score >= 2) return { level: "Moderate", label: "Moderate", icon: "🟡" };
  return { level: "Light", label: "Light", icon: "🟢" };
}

// ── Main ───────────────────────────────────────────────────────────

export function computeCourseIntelligence(course: Course): CourseIntelligence {
  return {
    workload: computeWorkload(course),
    difficulty: computeDifficulty(course),
    assessmentFocus: computeAssessmentFocus(course),
    groupWork: computeGroupWork(course),
    finalExam: computeFinalExam(course)
  };
}
