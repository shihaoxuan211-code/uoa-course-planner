import type { Course, Semester } from "@/types/course";

const EXAM_MODES = ["A", "B", "C", "D"] as const;

export interface CourseFilters {
  query: string;
  subject: string;
  semester: string;
  stage: string;
  examMode: string;
  difficulty: string;
  groupWork: string;
  workload: string;
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

    // Group work filter
    let matchesGroupWork = true;
    if (filters.groupWork === "has-group") matchesGroupWork = course.hasGroupWork;
    else if (filters.groupWork === "no-group") matchesGroupWork = !course.hasGroupWork;

    // Workload filter
    let matchesWorkload = true;
    if (filters.workload === "low") {
      const n = course.assessments.length;
      const examW = course.assessments
        .filter((a) => /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${a.type} ${a.weight}`))
        .reduce((s, a) => { const m = a.weight.match(/(\d+(?:\.\d+)?)\s*%/); return s + (m ? parseFloat(m[1]) : 0); }, 0);
      matchesWorkload = n <= 2 && examW < 50;
    } else if (filters.workload === "medium") {
      const n = course.assessments.length;
      matchesWorkload = n >= 3 && n <= 4;
    } else if (filters.workload === "high") {
      const n = course.assessments.length;
      const examW = course.assessments
        .filter((a) => /final\s+(exam|assessment|examination)\b|^\s*exam\b/i.test(`${a.type} ${a.weight}`))
        .reduce((s, a) => { const m = a.weight.match(/(\d+(?:\.\d+)?)\s*%/); return s + (m ? parseFloat(m[1]) : 0); }, 0);
      matchesWorkload = examW >= 50 || n >= 5 || (course.hasGroupWork && course.hasFinalExam);
    }

    return matchesQuery && matchesSubject && matchesSemester && matchesStage && matchesExamMode && matchesDifficulty && matchesGroupWork && matchesWorkload;
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
