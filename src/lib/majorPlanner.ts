import type { Course } from "@/types/course";
import type { StudentYear, StudentMajor } from "@/lib/studentProfile";

export type GoalType = "easy-gpa" | "major-progression" | "avoid-exams" | "practical-skills" | "balanced";
export type WorkloadPref = "light" | "balanced" | "heavy";
export type PrefSemester = "Semester 1" | "Semester 2" | "Summer School" | "any";

export interface Recommendation {
  course: Course;
  reasons: string[];
  score: number;
  ready: boolean;       // prereqs met?
  missingPrereqs: string[];
}

export interface PlannerInput {
  year: StudentYear;
  major: StudentMajor;
  preferredSemester: PrefSemester;
  workload: WorkloadPref;
  goal: GoalType;
  completedCodes: Set<string>;
  plannedCodes: Set<string>;
  assumedCodes: Set<string>;
  allCourses: Course[];
}

// ── Major-specific priority courses ────────────────────────────────

const MAJOR_PRIORITY: Record<StudentMajor, string[]> = {
  accounting: ["ACCTG 102","ACCTG 211","ACCTG 222","ACCTG 311","ACCTG 312","ACCTG 321"],
  "business-analytics": ["BUSAN 200","BUSAN 201","BUSAN 300","INFOSYS 110","INFOSYS 222","STATS 108"],
  "commercial-law": ["COMLAW 101","COMLAW 201","COMLAW 301","COMLAW 303","COMLAW 311"],
  economics: ["ECON 151","ECON 152","ECON 201","ECON 211","ECON 301","ECON 311"],
  finance: ["FINANCE 251","FINANCE 261","FINANCE 351","FINANCE 361","FINANCE 362"],
  "information-systems": ["INFOSYS 110","INFOSYS 220","INFOSYS 222","INFOSYS 300","INFOSYS 303"],
  "international-business": ["INTBUS 201","INTBUS 202","INTBUS 305","INTBUS 306","INTBUS 333"],
  management: ["MGMT 211","MGMT 223","MGMT 302","MGMT 309","MGMT 314"],
  marketing: ["MKTG 151","MKTG 202","MKTG 203","MKTG 301","MKTG 302","MKTG 303"],
  "operations-supply-chain": ["OPSMGT 255","OPSMGT 258","OPSMGT 357","OPSMGT 370","OPSMGT 371"],
  property: ["PROPERTY 102","PROPERTY 211","PROPERTY 221","PROPERTY 231","PROPERTY 241","PROPERTY 341"],
  "general-bcom": [],
  undecided: []
};

// ── Helpers ────────────────────────────────────────────────────────

const COURSE_RE = /[A-Z]{2,10}\s\d{3}[A-Z]*/g;

function extractPrereqCodes(text: string): string[] {
  if (!text || text === "Not available") return [];
  return [...new Set((text.match(COURSE_RE) || []))];
}

function prereqsMet(course: Course, completed: Set<string>, planned: Set<string>, assumed: Set<string>): { met: boolean; missing: string[] } {
  const codes = extractPrereqCodes(course.prerequisites);
  if (codes.length === 0) return { met: true, missing: [] };
  const combined = new Set([...completed, ...planned, ...assumed]);
  const missing = codes.filter((c) => !combined.has(c));
  return { met: missing.length === 0, missing };
}

function getExamWeight(course: Course): number {
  return Math.round(
    course.assessments
      .filter((a) => /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${a.type} ${a.weight}`))
      .reduce((s, a) => { const m = a.weight.match(/(\d+(?:\.\d+)?)\s*%/); return s + (m ? parseFloat(m[1]) : 0); }, 0)
  );
}

function availableInSemester(course: Course, sem: PrefSemester): boolean {
  if (sem === "any") return true;
  return course.semesters.some((s) => s === sem);
}

// ── Main recommendation engine ─────────────────────────────────────

export function generateRecommendations(input: PlannerInput): {
  recommendations: Recommendation[];
  notReady: Recommendation[];
} {
  const { major, preferredSemester, workload, goal, completedCodes, plannedCodes, assumedCodes, allCourses } = input;

  const priorityList = MAJOR_PRIORITY[major] || [];
  const prioritySet = new Set(priorityList);

  const candidates = allCourses.filter((c) => {
    // Must be in major priority list
    if (priorityList.length > 0 && !prioritySet.has(c.code)) return false;
    // Must not be already completed
    if (completedCodes.has(c.code)) return false;
    // Must not be in plan
    if (plannedCodes.has(c.code)) return false;
    // Must be offered in target semester
    if (!availableInSemester(c, preferredSemester)) return false;
    return true;
  });

  const scored: Recommendation[] = candidates.map((course) => {
    const reasons: string[] = [];
    let score = 0;

    // Prerequisites
    const { met, missing } = prereqsMet(course, completedCodes, plannedCodes, assumedCodes);
    if (met) {
      score += 20;
      if (course.prerequisites && course.prerequisites !== "Not available") {
        reasons.push("Prerequisites satisfied");
      } else {
        reasons.push("No prerequisites required");
      }
    }

    // Major priority order
    const priorityIdx = priorityList.indexOf(course.code);
    if (priorityIdx >= 0) {
      score += Math.max(0, 15 - priorityIdx * 2);
      reasons.push(`Fits ${getMajorLabel(major)} pathway`);
    }

    // Stage progression
    const year = input.year;
    const stageMap: Record<StudentYear, number> = { first: 1, second: 2, third: 3, "fourth-plus": 4 };
    const expectedStage = stageMap[year];
    if (course.stage === expectedStage) { score += 5; reasons.push(`Matches ${year} stage level`); }
    else if (course.stage === expectedStage + 1) { score += 3; }

    // Goal alignment
    const examW = getExamWeight(course);
    switch (goal) {
      case "easy-gpa":
        if (!course.hasFinalExam) { score += 8; reasons.push("No final exam"); }
        else if (examW < 30) { score += 4; reasons.push("Low exam weight"); }
        if (course.assessments.length <= 3 && !course.hasGroupWork) { score += 4; reasons.push("Lighter assessment load"); }
        break;
      case "avoid-exams":
        if (!course.hasFinalExam) { score += 10; reasons.push("No final exam"); }
        else if (examW < 25) { score += 5; }
        break;
      case "major-progression":
        if (priorityIdx <= 3) { score += 8; reasons.push("Core major progression course"); }
        break;
      case "practical-skills":
        if (course.hasGroupWork) { score += 3; reasons.push("Builds teamwork skills"); }
        if (/presentation|project/i.test(course.assessments.map((a) => a.type).join(" "))) {
          score += 3; reasons.push("Includes applied project work");
        }
        break;
      case "balanced":
        if (examW >= 25 && examW <= 45) { score += 4; reasons.push("Balanced exam and coursework"); }
        break;
    }

    // Workload preference
    const nAssess = course.assessments.length;
    const wlScore = nAssess + (course.hasGroupWork ? 1 : 0);
    switch (workload) {
      case "light":
        if (wlScore <= 3) { score += 5; reasons.push("Light assessment load"); }
        else score -= 3;
        break;
      case "heavy":
        if (wlScore >= 5) { score += 3; }
        break;
    }

    // Semester match
    if (preferredSemester !== "any" && course.semesters.includes(preferredSemester)) {
      score += 5;
      reasons.push(`Offered in ${preferredSemester}`);
    }

    return { course, reasons: reasons.slice(0, 4), score, ready: met, missingPrereqs: missing };
  });

  const ready = scored.filter((r) => r.ready).sort((a, b) => b.score - a.score);
  const notReady = scored.filter((r) => !r.ready).sort((a, b) => b.score - a.score);

  return { recommendations: ready, notReady };
}

function getMajorLabel(major: StudentMajor): string {
  const labels: Record<StudentMajor, string> = {
    accounting: "Accounting", "business-analytics": "Business Analytics",
    "commercial-law": "Commercial Law", economics: "Economics", finance: "Finance",
    "information-systems": "Information Systems", "international-business": "International Business",
    management: "Management", marketing: "Marketing", "operations-supply-chain": "Operations & SCM",
    property: "Property", "general-bcom": "BCom", undecided: "Undecided"
  };
  return labels[major];
}
