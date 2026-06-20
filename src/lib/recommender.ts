import type { Course } from "@/types/course";
import { checkPrerequisites } from "@/lib/prerequisites";
import { COMPLETED_COURSES_KEY } from "@/lib/storageKeys";

// ── Types ────────────────────────────────────────────────────────────────

export type StudyGoal =
  | "max-gpa" | "lower-workload" | "avoid-exams" | "practical" | "explore" | "balanced";

export type AssessmentPref =
  | "coursework" | "exams" | "group-projects" | "avoid-group" | "none";

export type WorkloadPrefInput = "light" | "medium" | "heavy-ok";

export interface RecommenderInput {
  degree: string;
  major: string;
  stage: string;       // "1" | "2" | "3" | "any"
  targetSemester: string;  // "Semester 1" | "Semester 2" | "Summer School" | "any"
  completedCodes: string[];
  studyGoal: StudyGoal;
  assessmentPref: AssessmentPref;
  workloadPref: WorkloadPrefInput;
}

export interface RecommendationResult {
  course: Course;
  score: number;           // 0-100
  reasons: string[];
  warnings: string[];
  prereqStatus: "eligible" | "possibly" | "missing";
  examWeightPct: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getExamWeightPct(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${a.type} ${a.weight}`))
      .reduce((s, a) => {
        const m = a.weight.match(/(\d+(?:\.\d+)?)\s*%/);
        return s + (m ? Number.parseFloat(m[1]) : 0);
      }, 0)
  );
}

function hasGroupWork(course: Course): boolean {
  return course.hasGroupWork;
}

function getAssessmentCount(course: Course): number {
  return course.assessments.length;
}

function loadCompletedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(COMPLETED_COURSES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}

// ── Scoring ───────────────────────────────────────────────────────────────

export function generateRecommendations(
  courses: Course[],
  input: RecommenderInput,
  topN = 5
): RecommendationResult[] {
  const completedSet = new Set(input.completedCodes.map((c) => c.trim().toUpperCase()));
  const results: RecommendationResult[] = [];

  for (const course of courses) {
    // Skip courses with no semester info or no points
    if (course.points <= 0) continue;

    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    let maxScore = 0;

    // ── 1. Semester match (max 15 pts) ──
    maxScore += 15;
    if (input.targetSemester === "any") {
      score += 10;
      reasons.push("Available in multiple semesters");
    } else if (course.semesters.includes(input.targetSemester as any)) {
      score += 15;
      reasons.push(`Available in ${input.targetSemester}`);
    } else if (course.semesters.length > 0) {
      // Not the target semester but available
      score += 3;
      warnings.push(`Available in ${course.semesters.join(", ")}, not ${input.targetSemester}`);
    }

    // ── 2. Stage match (max 10 pts) ──
    maxScore += 10;
    if (input.stage === "any") {
      score += 7;
    } else {
      const inputStage = Number(input.stage);
      if (course.stage === inputStage) {
        score += 10;
        reasons.push(`Stage ${course.stage} — matches your current level`);
      } else if (Math.abs(course.stage - inputStage) <= 1) {
        score += 6;
        reasons.push(`Stage ${course.stage} — within range of your current stage`);
      } else {
        score += 2;
      }
    }

    // ── 3. Subject / major relevance (max 20 pts) ──
    maxScore += 20;
    const majorUpper = input.major.trim().toUpperCase();
    const degreeUpper = input.degree.trim().toUpperCase();

    // Direct subject match
    if (course.subject === majorUpper) {
      score += 20;
      reasons.push(`${course.subject} matches your major`);
    }
    // Faculty match via degree keywords
    else if (
      (degreeUpper.includes("BCOM") && ["ACCTG","BUSAN","BUSINESS","COMLAW","ECON","FINANCE","INFOSYS","INTBUS","MGMT","MKTG","OPSMGT","PROPERTY"].includes(course.subject)) ||
      (degreeUpper.includes("BSC") && ["BIOSCI","CHEM","COMPSCI","EARTHSCI","ENVSCI","FOODSCI","GEOG","MATHS","PHYSICS","PSYCH","STATS","MEDSCI","EXERSCI"].includes(course.subject)) ||
      (degreeUpper.includes("BA") && ["ANTHRO","COMMS","DANCE","DRAMA","ENGLISH","FINEARTS","FRENCH","GERMAN","GLOBAL","HISTORY","LINGUIST","MAORI","MEDIA","MUSIC","PHIL","POLITICS","SOCIOL","SPANISH"].includes(course.subject)) ||
      (degreeUpper.includes("ENGIN") && ["CIVIL","ELECTENG","ENGGEN","ENGSCI","MECHENG","SOFTENG"].includes(course.subject))
    ) {
      score += 15;
      reasons.push(`${course.subject} aligns with your ${input.degree} programme`);
    }
    // Fallback: partial subject match
    else if (course.subject.includes(majorUpper) || majorUpper.includes(course.subject)) {
      score += 10;
      reasons.push(`${course.subject} may relate to your interests`);
    } else {
      score += 3;
    }

    // ── 4. Prerequisite match (max 20 pts) ──
    maxScore += 20;
    if (!course.prerequisites || course.prerequisites === "Information unavailable" || course.prerequisites.trim().length === 0) {
      score += 20;
      reasons.push("No prerequisites required");
    } else {
      // Use our checkPrerequisites with completed + localStorage completed
      const storageCompleted = loadCompletedSet();
      const allCompleted = new Set([...completedSet, ...storageCompleted]);
      const prereqCheck = checkPrerequisites(course, allCompleted, new Set(), new Set());

      if (prereqCheck.status === "met") {
        score += 20;
        reasons.push("Prerequisites satisfied");
      } else if (prereqCheck.status === "assumed") {
        score += 14;
        reasons.push("Prerequisites likely satisfied based on your profile");
      } else if (prereqCheck.missingCodes.length > 0) {
        score += 5;
        warnings.push(`Missing prerequisites: ${prereqCheck.missingCodes.join(", ")}`);
      } else if (!prereqCheck.parseable) {
        score += 8;
        warnings.push("Prerequisites could not be verified — check the official catalogue");
      }
    }

    // ── 5. Assessment preference (max 15 pts) ──
    maxScore += 15;
    const examW = getExamWeightPct(course);
    const hasGroup = hasGroupWork(course);
    const nAssess = getAssessmentCount(course);

    switch (input.assessmentPref) {
      case "coursework":
        if (examW === 0) { score += 15; reasons.push("100% coursework — no final exam"); }
        else if (examW < 30) { score += 12; }
        else { score += 4; warnings.push(`Has a ${examW}% final exam`); }
        break;
      case "exams":
        if (examW >= 40) { score += 15; reasons.push(`${examW}% exam weight`); }
        else if (examW > 0) { score += 8; }
        else { score += 4; warnings.push("No final exam"); }
        break;
      case "group-projects":
        if (hasGroup) { score += 15; reasons.push("Includes group work"); }
        else { score += 5; warnings.push("No group work listed"); }
        break;
      case "avoid-group":
        if (!hasGroup) { score += 15; reasons.push("No group work required"); }
        else { score += 4; warnings.push("Includes group work"); }
        break;
      default: // no preference
        score += 10;
        break;
    }

    // ── 6. Workload preference (max 10 pts) ──
    maxScore += 10;
    const workloadHeuristic = nAssess >= 5 ? "heavy" : nAssess >= 3 ? "medium" : "light";
    switch (input.workloadPref) {
      case "light":
        if (workloadHeuristic === "light") { score += 10; reasons.push("Light assessment load"); }
        else if (workloadHeuristic === "medium") { score += 5; }
        else { score += 2; warnings.push("Multiple assessments — heavier workload"); }
        break;
      case "medium":
        if (workloadHeuristic === "medium") { score += 10; }
        else { score += 6; }
        break;
      case "heavy-ok":
        score += 10;
        break;
    }

    // ── 7. Study goal bonus (max 10 pts) ──
    maxScore += 10;
    switch (input.studyGoal) {
      case "max-gpa":
        if (!hasGroup && examW < 40 && nAssess <= 3) { score += 10; reasons.push("Structured for consistent performance"); }
        else { score += 4; }
        break;
      case "lower-workload":
        if (nAssess <= 3 && !hasGroup) { score += 10; reasons.push("Manageable assessment load"); }
        else { score += 4; }
        break;
      case "avoid-exams":
        if (examW === 0) { score += 10; reasons.push("No final exam"); }
        else if (examW < 30) { score += 7; }
        else { score += 2; }
        break;
      case "practical":
        if (hasGroup || nAssess >= 4) { score += 10; reasons.push("Practical assessment structure"); }
        else { score += 5; }
        break;
      case "explore":
        if (course.stage <= 2) { score += 10; reasons.push(`Stage ${course.stage} — suitable for exploration`); }
        else { score += 5; }
        break;
      default: // balanced
        score += 8;
        break;
    }

    // ── Normalize to 0-100 ──
    const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;

    // ── Prereq status label ──
    let prereqStatus: "eligible" | "possibly" | "missing" = "eligible";
    if (course.prerequisites && course.prerequisites !== "Information unavailable" && course.prerequisites.trim().length > 0) {
      const allCompleted = new Set([...completedSet, ...loadCompletedSet()]);
      const prereqCheck = checkPrerequisites(course, allCompleted, new Set(), new Set());
      if (prereqCheck.status === "met") prereqStatus = "eligible";
      else if (prereqCheck.status === "assumed") prereqStatus = "possibly";
      else prereqStatus = "missing";
    }

    results.push({
      course,
      score: normalizedScore,
      reasons: reasons.length > 0 ? reasons : ["Matches your general criteria"],
      warnings: warnings.length > 0 ? warnings : ["Verify enrolment requirements in the official catalogue"],
      prereqStatus,
      examWeightPct: examW
    });
  }

  // Sort by score descending and return top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
