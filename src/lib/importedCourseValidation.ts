import type { AssessmentItem, Course, ImportedAssessmentItem, ImportedCourse, Semester } from "@/types/course";

export const NOT_AVAILABLE = "Information unavailable";

const validSemesters: Semester[] = [
  "Semester 1",
  "Semester 2",
  "Summer School",
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
  "Information unavailable"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, fallback = NOT_AVAILABLE) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function cleanOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function cleanNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeCode(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");
  return /^[A-Z]{2,10}\s\d{3}[A-Z]?$/.test(normalized) ? normalized : undefined;
}

function subjectFromCode(code: string) {
  return code.split(" ")[0] ?? NOT_AVAILABLE;
}

function stageFromCode(code: string, importedStage: unknown) {
  const parsedStage = cleanNumber(importedStage, 0);
  if (parsedStage >= 1 && parsedStage <= 7 && Number.isInteger(parsedStage)) {
    return parsedStage as Course["stage"];
  }

  const number = code.match(/\d{3}/)?.[0];
  const stage = number ? Number(number[0]) : 0;
  return stage >= 1 && stage <= 7 ? (stage as Course["stage"]) : undefined;
}

function normalizeId(code: string, importedId: unknown) {
  const cleanId = cleanOptionalString(importedId);
  return cleanId ?? code.toLowerCase().replace(/\s+/g, "-");
}

function normalizeSemesters(value: unknown): Semester[] {
  if (!Array.isArray(value)) {
    return [NOT_AVAILABLE];
  }

  const semesters = value
    .map((semester) => cleanOptionalString(semester))
    .filter((semester): semester is Semester => Boolean(semester) && validSemesters.includes(semester as Semester));

  return semesters.length > 0 ? semesters : [NOT_AVAILABLE];
}

function normalizeAssessments(value: unknown): AssessmentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((assessment): assessment is ImportedAssessmentItem => isRecord(assessment))
    .map((assessment) => ({
      type: cleanString(assessment.type),
      weight: cleanString(assessment.weight)
    }))
    .filter((assessment) => assessment.type !== NOT_AVAILABLE || assessment.weight !== NOT_AVAILABLE);
}

function normalizeImportedCourse(value: unknown, index: number): Course | undefined {
  if (!isRecord(value)) {
    console.warn(`Skipping imported course at index ${index}: expected an object.`);
    return undefined;
  }

  const imported = value as ImportedCourse;
  const code = normalizeCode(imported.code);
  if (!code) {
    console.warn(`Skipping imported course at index ${index}: missing or invalid course code.`);
    return undefined;
  }

  const stage = stageFromCode(code, imported.stage);
  if (!stage) {
    console.warn(`Skipping imported course ${code}: could not derive a valid stage.`);
    return undefined;
  }

  const assessments = normalizeAssessments(imported.assessments);
  const hasFinalExam =
    typeof imported.hasFinalExam === "boolean"
      ? imported.hasFinalExam
      : assessments.some((assessment) => /final\s+exam/i.test(`${assessment.type} ${assessment.weight}`));
  const sourceUrl = cleanOptionalString(imported.sourceUrl);
  const sourceFetchedAt = cleanOptionalString(imported.sourceFetchedAt);

  return {
    id: normalizeId(code, imported.id),
    code,
    title: cleanString(imported.title),
    subject: cleanString(imported.subject, subjectFromCode(code)),
    faculty: cleanString(imported.faculty),
    stage,
    points: cleanNumber(imported.points),
    semesters: normalizeSemesters(imported.semesters),
    description: cleanString(imported.description),
    prerequisites: cleanString(imported.prerequisites),
    restrictions: cleanString(imported.restrictions),
    workload: cleanString(imported.workload),
    assessments,
    hasFinalExam,
    hasGroupWork:
      typeof imported.hasGroupWork === "boolean"
        ? imported.hasGroupWork
        : assessments.some((assessment) => /group|team|presentation/i.test(`${assessment.type} ${assessment.weight}`)),
    notes:
      "Imported course data is based on public catalogue information and may be incomplete or outdated.",
    sourceNote:
      "Imported course data is based on public catalogue information and may be incomplete or outdated. Please verify all information with official University of Auckland sources before making enrolment decisions.",
    sourceUrl,
    sourceFetchedAt,
    dataSource: "imported",
    historicalExams: []
  };
}

export function normalizeImportedCourses(value: unknown): Course[] {
  if (!Array.isArray(value)) {
    console.warn("Skipping imported courses: generated-courses.json must contain an array.");
    return [];
  }

  const seen = new Set<string>();
  const courses: Course[] = [];

  value.forEach((item, index) => {
    const course = normalizeImportedCourse(item, index);
    if (!course) {
      return;
    }

    if (seen.has(course.code)) {
      console.warn(`Skipping duplicate imported course ${course.code}.`);
      return;
    }

    seen.add(course.code);
    courses.push(course);
  });

  return courses;
}
