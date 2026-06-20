import type { Course } from "@/types/course";
import { checkPrerequisites } from "@/lib/prerequisites";
import { COMPLETED_COURSES_KEY } from "@/lib/storageKeys";

export type StudyGoal = "max-gpa" | "lower-workload" | "avoid-exams" | "practical" | "explore" | "balanced";
export type AssessmentPref = "coursework" | "exams" | "group-projects" | "avoid-group" | "none";
export type WorkloadPrefInput = "light" | "medium" | "heavy-ok";

export interface RecommenderInput {
  degree: string; major: string; stage: string;
  targetSemester: string; completedCodes: string[];
  studyGoal: StudyGoal; assessmentPref: AssessmentPref; workloadPref: WorkloadPrefInput;
}

export interface RecommendationResult {
  course: Course; score: number;
  reasons: string[];      // max 3 short bullet points
  warning: string;        // one short warning or empty
  prereqStatus: "eligible" | "possibly" | "missing";
  examWeightPct: number;
  isPathwayCourse: boolean; // unlocks multiple future courses
}

function getExamWeightPct(course: Course): number {
  return Math.round(course.assessments
    .filter((a) => /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${a.type} ${a.weight}`))
    .reduce((s, a) => { const m = a.weight.match(/(\d+(?:\.\d+)?)\s*%/); return s + (m ? Number.parseFloat(m[1]) : 0); }, 0));
}

function loadCompletedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const raw = localStorage.getItem(COMPLETED_COURSES_KEY); return raw ? new Set(JSON.parse(raw) as string[]) : new Set(); }
  catch { return new Set(); }
}

const DEGREE_SUBJECTS: Record<string, string[]> = {
  BCOM: ["ACCTG","BUSAN","BUSINESS","COMLAW","ECON","FINANCE","INFOSYS","INTBUS","MGMT","MKTG","OPSMGT","PROPERTY"],
  BSC: ["BIOSCI","CHEM","COMPSCI","EARTHSCI","ENVSCI","EXERSCI","FOODSCI","GEOG","MARINE","MATHS","MEDSCI","PHYSICS","PSYCH","STATS","SCIGEN"],
  BA: ["ANTHRO","ASIAN","COMMS","DANCE","DRAMA","ENGLISH","FINEARTS","FRENCH","GERMAN","GLOBAL","HISTORY","KOREAN","LINGUIST","MAORI","MEDIA","MUSIC","PHIL","POLITICS","SOCIOL","SPANISH"],
  ENGINEERING: ["CIVIL","ELECTENG","ENGGEN","ENGSCI","MECHENG","SOFTENG"],
  BPROP: ["PROPERTY","BUSINESS","ECON","FINANCE"]
};

export function generateRecommendations(courses: Course[], input: RecommenderInput, topN = 5): RecommendationResult[] {
  const completedSet = new Set(input.completedCodes.map((c) => c.trim().toUpperCase()));
  const results: RecommendationResult[] = [];

  for (const course of courses) {
    if (course.points <= 0) continue;
    const reasons: string[] = [];
    let score = 0; let maxScore = 0;
    const majorUpper = input.major.trim().toUpperCase();
    const degreeUpper = input.degree.trim().toUpperCase();
    const examW = getExamWeightPct(course);
    const hasGroup = course.hasGroupWork;
    const nAssess = course.assessments.length;

    // 1. Semester match (15)
    maxScore += 15;
    if (input.targetSemester === "any") { score += 10; reasons.push("Available year-round"); }
    else if (course.semesters.includes(input.targetSemester as any)) { score += 15; }
    else if (course.semesters.length > 0) { score += 3; }

    // 2. Stage match (10)
    maxScore += 10;
    if (input.stage === "any") { score += 7; }
    else { const s = Number(input.stage); if (course.stage === s) score += 10; else if (Math.abs(course.stage - s) <= 1) score += 6; else score += 2; }

    // 3. Subject relevance (20)
    maxScore += 20;
    if (course.subject === majorUpper) { score += 20; reasons.push("Matches your major"); }
    else if (
      (degreeUpper.includes("BCOM") && DEGREE_SUBJECTS.BCOM.includes(course.subject)) ||
      (degreeUpper.includes("BSC") && DEGREE_SUBJECTS.BSC.includes(course.subject)) ||
      (degreeUpper.includes("BA") && DEGREE_SUBJECTS.BA.includes(course.subject)) ||
      (degreeUpper.includes("ENGIN") && DEGREE_SUBJECTS.ENGINEERING.includes(course.subject))
    ) { score += 15; reasons.push("Fits your degree"); }
    else if (course.subject.includes(majorUpper) || majorUpper.includes(course.subject)) { score += 10; }
    else { score += 3; }

    // 4. Prereqs (20)
    maxScore += 20;
    if (!course.prerequisites || course.prerequisites === "Information unavailable" || !course.prerequisites.trim()) {
      score += 20; reasons.push("No prerequisites");
    } else {
      const allCompleted = new Set([...completedSet, ...loadCompletedSet()]);
      const pc = checkPrerequisites(course, allCompleted, new Set(), new Set());
      if (pc.status === "met") { score += 20; }
      else if (pc.status === "assumed") { score += 14; reasons.push("Prerequisites likely met"); }
      else { score += 5; }
    }

    // 5. Assessment preference (15)
    maxScore += 15;
    switch (input.assessmentPref) {
      case "coursework": if (examW === 0) { score += 15; reasons.push("100% coursework"); } else if (examW < 30) score += 12; else score += 4; break;
      case "exams": if (examW >= 40) { score += 15; } else if (examW > 0) score += 8; else score += 4; break;
      case "group-projects": if (hasGroup) { score += 15; reasons.push("Includes group projects"); } else score += 5; break;
      case "avoid-group": if (!hasGroup) { score += 15; reasons.push("No group work"); } else score += 4; break;
      default: score += 10; break;
    }

    // 6. Workload (10)
    maxScore += 10;
    const wl = nAssess >= 5 ? "heavy" : nAssess >= 3 ? "medium" : "light";
    switch (input.workloadPref) {
      case "light": if (wl === "light") { score += 10; reasons.push("Light workload"); } else if (wl === "medium") score += 5; else score += 2; break;
      case "medium": score += wl === "medium" ? 10 : 6; break;
      case "heavy-ok": score += 10; break;
    }

    // 7. Study goal bonus (10)
    maxScore += 10;
    switch (input.studyGoal) {
      case "max-gpa": if (!hasGroup && examW < 40 && nAssess <= 3) { score += 10; reasons.push("Good for GPA"); } else score += 4; break;
      case "lower-workload": if (nAssess <= 3 && !hasGroup) { score += 10; reasons.push("Manageable workload"); } else score += 4; break;
      case "avoid-exams": if (examW === 0) { score += 10; reasons.push("No final exam"); } else if (examW < 30) score += 7; else score += 2; break;
      case "practical": if (hasGroup || nAssess >= 4) { score += 10; reasons.push("Practical assessment"); } else score += 5; break;
      case "explore": if (course.stage <= 2) { score += 10; reasons.push("Good for exploration"); } else score += 5; break;
      default: score += 8; break;
    }

    const normalizedScore = Math.round((score / maxScore) * 100);

    // Warning
    let warning = "";
    if (course.semesters.length === 1) warning = `Only ${course.semesters[0]}`;
    if (examW >= 50 && input.assessmentPref === "coursework") warning = `${examW}% exam weight`;
    if (hasGroup && input.assessmentPref === "avoid-group") warning = "Includes group work";

    // Prereq status
    let prereqStatus: "eligible"|"possibly"|"missing" = "eligible";
    if (course.prerequisites && course.prerequisites !== "Information unavailable" && course.prerequisites.trim()) {
      const ac = new Set([...completedSet, ...loadCompletedSet()]);
      const pc = checkPrerequisites(course, ac, new Set(), new Set());
      if (pc.status === "met") prereqStatus = "eligible";
      else if (pc.status === "assumed") prereqStatus = "possibly";
      else prereqStatus = "missing";
    }

    // Pathway course: this course is a prerequisite for 2+ other courses
    const isPathwayCourse = courses.filter((c) =>
      c.prerequisites && c.prerequisites !== "Information unavailable" && c.prerequisites.includes(course.code)
    ).length >= 2;

    // Cap reasons at 3
    const trimmed = reasons.slice(0, 3);
    if (trimmed.length === 0) trimmed.push("Matches your criteria");

    results.push({ course, score: normalizedScore, reasons: trimmed, warning, prereqStatus, examWeightPct: examW, isPathwayCourse });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topN);
}
