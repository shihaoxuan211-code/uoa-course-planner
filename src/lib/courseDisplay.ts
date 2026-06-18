import type { Course } from "@/types/course";
import type { Lang } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { NOT_AVAILABLE } from "@/lib/importedCourseValidation";

export function formatPoints(points: number) {
  return points > 0 ? String(points) : NOT_AVAILABLE;
}

export function formatSemesters(course: Pick<Course, "semesters">) {
  return course.semesters.length > 0 ? course.semesters.join(", ") : NOT_AVAILABLE;
}

export function formatAssessmentSummary(course: Pick<Course, "assessments">) {
  return course.assessments.length > 0
    ? course.assessments.map((item) => `${item.type}: ${item.weight}`).join("; ")
    : NOT_AVAILABLE;
}

/** Translate a semester string ("Semester 1", "Semester 2", etc.) */
export function translateSemester(semester: string, lang: Lang): string {
  const t = getTranslations(lang);
  return t.shared.semesters[semester] ?? semester;
}

/** Translate a list of semester strings, joined with comma */
export function translateSemesters(semesters: string[], lang: Lang): string {
  if (semesters.length === 0) return NOT_AVAILABLE;
  return semesters.map((s) => translateSemester(s, lang)).join(", ");
}

/** Translate a stage number to label. Returns "Stage N" for en, "N阶段课程" for zh */
export function translateStage(stage: number, lang: Lang): string {
  const t = getTranslations(lang);
  const key = String(stage);
  return t.shared.stages[key] ?? `Stage ${stage}`;
}

/** Translate a workload label from CourseIntelligence */
export function translateWorkloadLabel(label: string, lang: Lang): string {
  const t = getTranslations(lang);
  return t.shared.workloadLabels[label] ?? label;
}

/** Translate a difficulty label from CourseIntelligence */
export function translateDifficultyLabel(label: string, lang: Lang): string {
  const t = getTranslations(lang);
  return t.shared.difficultyLabels[label] ?? label;
}

/** Translate a group work label from CourseIntelligence */
export function translateGroupWorkLabel(label: string, lang: Lang): string {
  const t = getTranslations(lang);
  return t.shared.groupWorkLabels[label] ?? label;
}

/** Translate a final exam label from CourseIntelligence */
export function translateFinalExamLabel(label: string, lang: Lang): string {
  const t = getTranslations(lang);
  return t.shared.finalExamLabels[label] ?? label;
}
