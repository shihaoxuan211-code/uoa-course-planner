import type { Course } from "@/types/course";
import { checkPrerequisites } from "@/lib/prerequisites";
import { resolveTemplate, type DegreeTemplate } from "@/data/degree-templates";

// ── Types ────────────────────────────────────────────────────────────────

export interface RoadmapInput {
  degree: string; major: string; currentYear: string;
  completedCodes: string[];
  gradTiming: "asap" | "balanced" | "part-time" | "not-sure";
  semesterLoad: "2" | "3" | "4" | "flexible";
  includeSummer: "yes" | "no" | "maybe";
  startSemester?: "Semester 1" | "Semester 2";
}

export interface DegreeAudit {
  templateFound: boolean; templateName?: string;
  requiredCourses: { code: string; completed: boolean; inDataset: boolean }[];
  stage2Courses: { code: string; completed: boolean; inDataset: boolean }[];
  stage3Courses: { code: string; completed: boolean; inDataset: boolean }[];
  totalRequired: number; completedRequired: number; progressPercent: number;
}

export interface ProgressSummary {
  completedPoints: number; totalDegreePoints: number; remainingPoints: number;
  completedCount: number; estimatedRemainingCourses: number;
  estimatedSemesters: number; estimatedGrad: string; delayRisk: boolean;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  reasons: string[];
  delays: string[];
  conflicts: { semester: string; count: number }[];
  startImpact: boolean;
}

export interface SemesterPlan {
  label: string; points: number; courses: CoursePlanItem[];
}

export interface CoursePlanItem {
  course: Course;
  type: "required" | "major" | "elective" | "recommended";
  warnings: string[];
  highPriority: boolean;
  availability: string; // "Semester 1 only" | "Semester 2 only" | "Summer School available" | ""
}

export interface RoadmapResult {
  audit: DegreeAudit; progress: ProgressSummary; risk: RiskAssessment;
  plan: SemesterPlan[]; warnings: string[]; alternatives: string[];
}

export interface MajorChangeComparison {
  template: DegreeTemplate; overlapping: string[];
  noLongerNeeded: string[]; additionalRequired: string[];
  estimatedExtraSemesters: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getCoursesPerSemester(load: string): number {
  switch (load) { case "2": return 2; case "3": return 3; case "4": return 4; default: return 3; }
}

const DEGREE_SUBJECTS: Record<string, string[]> = {
  BCOM: ["ACCTG","BUSAN","BUSINESS","COMLAW","ECON","FINANCE","INFOSYS","INTBUS","MGMT","MKTG","OPSMGT","PROPERTY"],
  BSC: ["BIOSCI","CHEM","COMPSCI","EARTHSCI","ENVSCI","EXERSCI","FOODSCI","GEOG","MARINE","MATHS","MEDSCI","PHYSICS","PSYCH","STATS","SCIGEN"],
  BA: ["ANTHRO","ASIAN","COMMS","DANCE","DRAMA","ENGLISH","FINEARTS","FRENCH","GERMAN","GLOBAL","HISTORY","KOREAN","LINGUIST","MAORI","MEDIA","MUSIC","PHIL","POLITICS","SOCIOL","SPANISH"],
  ENGINEERING: ["CIVIL","ELECTENG","ENGGEN","ENGSCI","MECHENG","SOFTENG"],
  BPROP: ["PROPERTY","BUSINESS","ECON","FINANCE"]
};

// ── Availability label ────────────────────────────────────────────────────

function getAvailability(course: Course): string {
  if (course.semesters.length === 1) {
    return course.semesters[0] === "Semester 1" ? "Semester 1 only" :
           course.semesters[0] === "Semester 2" ? "Semester 2 only" : "";
  }
  if (course.semesters.includes("Summer School" as any)) return "Summer School available";
  return "";
}

// ── Degree Audit ──────────────────────────────────────────────────────────

export function generateAudit(completedCodes: string[], template?: DegreeTemplate): DegreeAudit {
  const completedSet = new Set(completedCodes.map((c) => c.trim().toUpperCase()));
  if (!template) return { templateFound: false, requiredCourses: [], stage2Courses: [], stage3Courses: [], totalRequired: 0, completedRequired: 0, progressPercent: 0 };
  const r = (codes: string[]) => codes.map((c) => ({ code: c, completed: completedSet.has(c), inDataset: true }));
  const req = r(template.requiredCourses), s2 = r(template.stage2Courses), s3 = r(template.stage3Courses);
  const total = req.length + s2.length + s3.length, done = [...req, ...s2, ...s3].filter((c) => c.completed).length;
  return { templateFound: true, templateName: `${template.degree} — ${template.major}`, requiredCourses: req, stage2Courses: s2, stage3Courses: s3, totalRequired: total, completedRequired: done, progressPercent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

// ── Risk Assessment ───────────────────────────────────────────────────────

export function assessRisk(
  audit: DegreeAudit,
  allCourses: Course[],
  input: RoadmapInput,
  template?: DegreeTemplate
): RiskAssessment {
  const reasons: string[] = [];
  const delays: string[] = [];
  const conflicts: { semester: string; count: number }[] = [];
  let score = 0;
  let startImpact = false;

  // 1. Missing required courses
  const missing = [...audit.requiredCourses, ...audit.stage2Courses, ...audit.stage3Courses].filter((c) => !c.completed);
  if (missing.length > 0) {
    reasons.push(`${missing.length} required courses still missing`);
    score += missing.length * 3;
    for (const m of missing) {
      // Check if this missing course is a prereq for others
      const unlocks = allCourses.filter((c) => c.prerequisites && c.prerequisites !== "Information unavailable" && c.prerequisites.includes(m.code));
      if (unlocks.length > 0) {
        delays.push(`Missing ${m.code} may delay completion of ${unlocks.map((u) => u.code).join(", ")}.`);
        score += 5;
      }
    }
  }

  // 2. Single-semester course risk
  const singleSemCourses = template ? [...template.requiredCourses, ...template.stage2Courses, ...template.stage3Courses]
    .map((c) => allCourses.find((ac) => ac.code === c))
    .filter((c): c is Course => !!c && c.semesters.length === 1) : [];
  if (singleSemCourses.length > 0) {
    reasons.push(`${singleSemCourses.length} required courses are only available in one semester`);
    score += singleSemCourses.length * 4;
  }

  // 3. Stage 3 locked by missing prereqs
  if (audit.stage3Courses.filter((c) => !c.completed).length > 0 && audit.stage2Courses.filter((c) => !c.completed).length > 0) {
    reasons.push("Stage 3 courses are locked behind incomplete Stage 2 prerequisites");
    score += 10;
  }

  // 4. Low semester load
  if (input.semesterLoad === "2") {
    reasons.push("Taking only 2 courses per semester will significantly extend the timeline");
    score += 8;
  }

  // 5. Semester 2 start impact
  if (input.startSemester === "Semester 2") {
    startImpact = true;
    reasons.push("Starting in Semester 2 may extend this pathway by approximately one additional semester");
    score += 7;
  }

  // 6. No Summer School
  if (input.includeSummer === "no") {
    reasons.push("Excluding Summer School removes flexibility for catching up");
    score += 3;
  }

  // 7. Conflict detection — multiple required courses in same semester
  if (template) {
    const allTemplate = [...template.requiredCourses, ...template.stage2Courses, ...template.stage3Courses];
    const sem1Courses = allTemplate.map((c) => allCourses.find((ac) => ac.code === c)).filter((c): c is Course => !!c && c.semesters.includes("Semester 1" as any));
    const sem2Courses = allTemplate.map((c) => allCourses.find((ac) => ac.code === c)).filter((c): c is Course => !!c && c.semesters.includes("Semester 2" as any));
    if (sem1Courses.length >= 4) conflicts.push({ semester: "Semester 1", count: sem1Courses.length });
    if (sem2Courses.length >= 4) conflicts.push({ semester: "Semester 2", count: sem2Courses.length });
    for (const c of conflicts) { score += c.count * 3; reasons.push(`Semester 1 contains ${c.count} required courses`); }
  }

  const level = score <= 8 ? "low" : score <= 20 ? "medium" : "high";
  return { level, reasons: reasons.slice(0, 6), delays: delays.slice(0, 4), conflicts, startImpact };
}

// ── Major Change Simulator ────────────────────────────────────────────────

export function simulateMajorChange(completedCodes: string[], fromTemplate: DegreeTemplate, toTemplate: DegreeTemplate): MajorChangeComparison {
  const completedSet = new Set(completedCodes.map((c) => c.trim().toUpperCase()));
  const fromAll = [...fromTemplate.requiredCourses, ...fromTemplate.stage2Courses, ...fromTemplate.stage3Courses];
  const toAll = [...toTemplate.requiredCourses, ...toTemplate.stage2Courses, ...toTemplate.stage3Courses];
  const overlapping = toAll.filter((c) => fromAll.includes(c) && completedSet.has(c));
  const noLongerNeeded = fromAll.filter((c) => !toAll.includes(c) && completedSet.has(c));
  const extra = toAll.filter((c) => !completedSet.has(c));
  return { template: toTemplate, overlapping, noLongerNeeded, additionalRequired: extra, estimatedExtraSemesters: Math.ceil(extra.length / 3) };
}

// ── Main Generator ────────────────────────────────────────────────────────

export function generateRoadmap(allCourses: Course[], input: RoadmapInput): RoadmapResult {
  const completedSet = new Set(input.completedCodes.map((c) => c.trim().toUpperCase()));
  const completedCourses = allCourses.filter((c) => completedSet.has(c.code));
  const completedPoints = completedCourses.reduce((s, c) => s + c.points, 0);
  const template = resolveTemplate(input.degree, input.major);
  const audit = generateAudit(input.completedCodes, template);
  const risk = assessRisk(audit, allCourses, input, template);
  const totalPoints = template?.totalPoints ?? (input.degree.toUpperCase().includes("ENGIN") ? 480 : 360);
  const remainingPoints = Math.max(0, totalPoints - completedPoints);
  const degreeUpper = input.degree.toUpperCase();
  const majorUpper = input.major.toUpperCase();
  let degreeSubjects: string[] = [];
  for (const [key, subj] of Object.entries(DEGREE_SUBJECTS)) { if (degreeUpper.includes(key)) { degreeSubjects = subj; break; } }
  const coursesPerSem = getCoursesPerSemester(input.semesterLoad);
  const estimatedRemainingCourses = Math.ceil(remainingPoints / 15);
  const estimatedSemesters = Math.ceil(estimatedRemainingCourses / coursesPerSem);
  const now = new Date(); const currentYear = now.getFullYear(); const currentMonth = now.getMonth();
  let gradYear = currentYear + Math.ceil(estimatedSemesters / 2);
  let gradSem = currentMonth < 6 ? "Semester 2" : "Semester 1";
  if (estimatedSemesters % 2 === 0) gradSem = gradSem === "Semester 1" ? "Semester 2" : "Semester 1";
  const progress: ProgressSummary = { completedPoints, totalDegreePoints: totalPoints, remainingPoints, completedCount: completedCourses.length, estimatedRemainingCourses, estimatedSemesters, estimatedGrad: `${gradSem}, ${gradYear}`, delayRisk: estimatedRemainingCourses > 16 || (input.includeSummer === "no" && estimatedSemesters > 6) || risk.level === "high" };
  const plan: SemesterPlan[] = []; const addedSet = new Set<string>(completedSet);
  const allTemplateCodes = template ? [...template.requiredCourses, ...template.stage2Courses, ...template.stage3Courses] : [];
  const relevantCourses = allCourses.filter((c) => c.points > 0 && !addedSet.has(c.code)).sort((a, b) => {
    const aIn = allTemplateCodes.includes(a.code) ? 0 : 1; const bIn = allTemplateCodes.includes(b.code) ? 0 : 1;
    if (aIn !== bIn) return aIn - bIn;
    const aM = a.subject === majorUpper ? 0 : degreeSubjects.includes(a.subject) ? 1 : 2;
    const bM = b.subject === majorUpper ? 0 : degreeSubjects.includes(b.subject) ? 1 : 2;
    if (aM !== bM) return aM - bM; return a.stage - b.stage;
  });
  const useSummer = input.includeSummer === "yes" || input.includeSummer === "maybe";
  const startOffset = input.startSemester === "Semester 2" ? 1 : 0;
  const semesters: string[] = [];
  for (let i = 0; i < Math.min(estimatedSemesters + 2 + startOffset, 12); i++) {
    const yr = currentYear + Math.floor((currentMonth >= 6 ? i + startOffset : i + startOffset - 1) / 2) + (currentMonth >= 6 ? 0 : 1);
    const isS1 = (currentMonth >= 6 ? i + startOffset : i + startOffset + 1) % 2 === 1;
    semesters.push(`${isS1 ? "Semester 1" : "Semester 2"}, ${yr}`);
    if (useSummer && i % 2 === 1) semesters.push(`Summer School, ${yr - 1}-${yr}`);
  }
  let si = 0, added = 0;
  while (added < Math.min(estimatedRemainingCourses + 4, relevantCourses.length) && si < semesters.length) {
    const sl = semesters[si]; const sp: SemesterPlan = { label: sl, points: 0, courses: [] };
    const isSummer = sl.includes("Summer"); const sk = sl.includes("Semester 1") ? "Semester 1" : sl.includes("Semester 2") ? "Semester 2" : "Summer School";
    for (const course of relevantCourses) {
      if (sp.courses.length >= (isSummer ? 2 : coursesPerSem)) break;
      if (addedSet.has(course.code)) continue;
      if (!course.semesters.includes(sk as any) && !isSummer) continue;
      const pc = checkPrerequisites(course, addedSet, new Set(), new Set());
      if (pc.status === "missing" && pc.missingCodes.length > 0) continue;
      let type: "required"|"major"|"elective"|"recommended" = "recommended";
      if (template && allTemplateCodes.includes(course.code)) {
        if (template.requiredCourses.includes(course.code)) type = "required";
        else if (template.stage2Courses.includes(course.code) || template.stage3Courses.includes(course.code)) type = "major";
      } else if (course.subject === majorUpper || degreeSubjects.includes(course.subject)) { type = "recommended"; }
      else { type = "elective"; }
      const cw: string[] = [];
      if (course.semesters.length === 1) cw.push(`Only available in ${course.semesters[0]}`);
      const isPrereqFor = allCourses.some((c) => c.prerequisites && c.prerequisites !== "Information unavailable" && c.prerequisites.includes(course.code));
      const hp = isPrereqFor && course.stage <= 2;
      if (hp) cw.push("high priority");
      sp.courses.push({ course, type, warnings: cw, highPriority: hp, availability: getAvailability(course) });
      sp.points += course.points; addedSet.add(course.code); added++;
    }
    if (sp.courses.length > 0) plan.push(sp); si++;
  }
  const warnings: string[] = [];
  const singleSem = plan.flatMap((s) => s.courses.filter((c) => c.warnings.some((w) => w.includes("Only available"))));
  if (singleSem.length > 0) warnings.push(`${singleSem.length} recommended courses are only available in a single semester`);
  if (progress.delayRisk) warnings.push("Graduation may be delayed — consider higher course load or Summer School");
  if (audit.progressPercent < 50) warnings.push("Less than 50% of required courses completed");
  const alternatives: string[] = [];
  if (input.includeSummer !== "yes") alternatives.push("Consider Summer School to reduce timeline");
  if (singleSem.length > 0) alternatives.push("Some courses are single-semester — prioritise these");
  if (template) alternatives.push(`Following ${template.degree} ${template.major} degree template`);
  if (risk.level !== "low") alternatives.push("Review the risk assessment above and adjust your plan");
  alternatives.push("Verify all requirements in the official UOA catalogue");
  return { audit, progress, risk, plan, warnings, alternatives };
}
