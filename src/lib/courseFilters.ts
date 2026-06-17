import type { Course, Semester } from "@/types/course";

const EXAM_MODES = ["A", "B", "C", "D"] as const;

export interface CourseFilters {
  query: string;
  subject: string;
  semester: string;
  stage: string;
  examMode: string;
  difficulty: string;
}

export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
  difficultyMap?: Map<string, number>
) {
  const query = filters.query.trim().toLowerCase().replace(/\s+/g, " ");

  return courses.filter((course) => {
    const code = course.code.toLowerCase();
    const title = course.title.toLowerCase();
    const matchesQuery = query.length === 0 || code.includes(query) || title.includes(query);
    const matchesSubject = filters.subject === "all" || course.subject === filters.subject;
    const matchesSemester =
      filters.semester === "all" || course.semesters.length === 0 || course.semesters.includes(filters.semester as Semester);
    const matchesStage = filters.stage === "all" || String(course.stage) === filters.stage;

    // Exam mode filter
    let matchesExamMode = true;
    const hasExam = course.historicalExams.length > 0;
    const examMode = hasExam ? course.historicalExams[0].mode : undefined;

    if (filters.examMode === "has-exam") {
      matchesExamMode = hasExam;
    } else if (filters.examMode === "no-exam") {
      matchesExamMode = !hasExam;
    } else if ((EXAM_MODES as readonly string[]).includes(filters.examMode)) {
      matchesExamMode = examMode === filters.examMode;
    }

    // Difficulty filter
    let matchesDifficulty = true;
    if (filters.difficulty !== "all") {
      const target = Number(filters.difficulty);
      if (Number.isFinite(target)) {
        const diff = difficultyMap?.get(course.code);
        matchesDifficulty = diff === target;
      }
    }

    return matchesQuery && matchesSubject && matchesSemester && matchesStage && matchesExamMode && matchesDifficulty;
  });
}

export function uniqueSubjects(courses: Course[]) {
  return [...new Set(courses.map((course) => course.subject))].sort();
}

export function uniqueSemesters(courses: Course[]) {
  return [...new Set(courses.flatMap((course) => course.semesters))].sort();
}

export function uniqueStages(courses: Course[]) {
  return [...new Set(courses.map((course) => course.stage))].sort((a, b) => a - b);
}
