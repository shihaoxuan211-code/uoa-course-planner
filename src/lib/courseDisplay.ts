import type { Course } from "@/types/course";
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
